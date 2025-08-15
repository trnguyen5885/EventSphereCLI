import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosInstance } from '../../services';
import { appColors } from '../../constants/appColors';
import ImagePicker from 'react-native-image-crop-picker';
import LoadingModal from '../../modals/LoadingModal';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const Review = ({ navigation, route }) => {
    const { detailEventId } = route.params;
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]); // Thay đổi từ image sang images array
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const userId = useSelector(state => state.auth.userId);
    const [name, setName] = useState('');
    const [userAvatar, setUserAvatar] = useState('');

    const MAX_IMAGES = 5;

    useFocusEffect(
        useCallback(() => {
            const getUserInfo = async () => {
                try {
                    if (userId) {
                        const response = await AxiosInstance().get(`users/getUser/${userId}`);
                        setName(response.data.username);
                        setUserAvatar(response.data.picUrl || 'https://avatar.iran.liara.run/public');
                    }
                } catch (error) {
                    console.log('Lỗi khi lấy thông tin người dùng:', error);
                }
            };

            getUserInfo();
        }, [userId])
    );

    // Mở thư viện chọn nhiều ảnh
    const pickMultipleImages = async () => {
        if (images.length >= MAX_IMAGES) {
            Alert.alert('Giới hạn ảnh', `Bạn chỉ có thể chọn tối đa ${MAX_IMAGES} ảnh`);
            return;
        }

        try {
            const selectedImages = await ImagePicker.openPicker({
                multiple: true,
                maxFiles: MAX_IMAGES - images.length,
                mediaType: 'photo',
                cropping: false,
                compressImageQuality: 0.8,
            });

            setIsUploadingImage(true);
            const uploadPromises = selectedImages.map(image => uploadImage(image.path));
            const uploadedUrls = await Promise.all(uploadPromises);

            // Lọc bỏ các URL null/undefined
            const validUrls = uploadedUrls.filter(url => url);
            setImages(prevImages => [...prevImages, ...validUrls]);
            setIsUploadingImage(false);
        } catch (error) {
            setIsUploadingImage(false);
            if (error.code !== 'E_PICKER_CANCELLED') {
                console.log('Lỗi khi chọn ảnh:', error);
                Alert.alert('Lỗi', 'Không thể chọn ảnh');
            }
        }
    };

    // Chọn từ camera
    const takePhoto = async () => {
        if (images.length >= MAX_IMAGES) {
            Alert.alert('Giới hạn ảnh', `Bạn chỉ có thể chọn tối đa ${MAX_IMAGES} ảnh`);
            return;
        }

        try {
            const image = await ImagePicker.openCamera({
                width: 500,
                height: 500,
                cropping: true,
                mediaType: 'photo',
                compressImageQuality: 0.8,
            });

            setIsUploadingImage(true);
            const uploadedUrl = await uploadImage(image.path);
            if (uploadedUrl) {
                setImages(prevImages => [...prevImages, uploadedUrl]);
            }
            setIsUploadingImage(false);
        } catch (error) {
            setIsUploadingImage(false);
            if (error.code !== 'E_PICKER_CANCELLED') {
                console.log('Lỗi khi chụp ảnh:', error);
                Alert.alert('Lỗi', 'Không thể chụp ảnh');
            }
        }
    };

    // Show option chọn ảnh
    const showImagePickerOptions = () => {
        Alert.alert(
            'Chọn ảnh',
            'Bạn muốn chọn ảnh từ đâu?',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Thư viện', onPress: pickMultipleImages },
                { text: 'Camera', onPress: takePhoto },
            ]
        );
    };

    // Upload ảnh lên Cloudinary
    const uploadImage = async (imageUri) => {
        let formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'upload.jpg',
        });
        formData.append('upload_preset', 'DATN2025');

        try {
            let response = await fetch('https://api.cloudinary.com/v1_1/ddkqz5udn/image/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
            });

            let data = await response.json();

            if (data.secure_url) {
                console.log('✅ Ảnh đã upload:', data.secure_url);
                return data.secure_url;
            } else {
                Alert.alert('Upload thất bại!', JSON.stringify(data));
                return null;
            }
        } catch (error) {
            console.log('Lỗi upload:', error);
            Alert.alert('Lỗi!', 'Không thể tải ảnh lên.');
            return null;
        }
    };

    // Xóa ảnh
    const removeImage = (indexToRemove) => {
        setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
    };

    const handlePostReview = async () => {
        if (rating === 0) {
            Alert.alert('Thiếu thông tin', 'Vui lòng chọn số sao đánh giá');
            return;
        }

        if (images.length > MAX_IMAGES) {
            Alert.alert('Quá số lượng ảnh cho phép', `Bạn chỉ được gửi tối đa ${MAX_IMAGES} ảnh`);
            return;
        }

        setIsLoading(true);
        try {
            const response = await AxiosInstance().post('preview/post', {
                userId: userId,
                eventId: detailEventId,
                comment: comment,
                rating: rating,
                image: images, // Gửi mảng ảnh
            });

            if (response.status) {
                Alert.alert('Đánh giá thành công', 'Cảm ơn bạn đã đánh giá',
                    [
                        { text: 'OK', onPress: () => navigation.goBack() }
                    ]
                );
            }
        } catch (e) {
            console.log(e);
            Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };


    if (isLoading) {
        return <LoadingModal />;
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
            <View style={styles.mainContentContainer}>
                <ScrollView
                    contentContainerStyle={styles.contentWrapper}
                    showsVerticalScrollIndicator={false}
                >
                    {/* User Info */}
                    <View style={styles.infoContainer}>
                        <View style={styles.avatarContainer}>
                            <Image style={styles.avatar} source={{ uri: userAvatar }} />
                        </View>

                        <View style={styles.detailInfoContainer}>
                            <Text style={styles.detailInfoName}>{name}</Text>
                            <Text style={styles.detailInfoSubtitle}>Viết cảm nhận về sự kiện của bạn...</Text>
                        </View>
                    </View>

                    {/* Rating Section */}
                    <View style={styles.ratingContainer}>
                        <Text style={styles.sectionTitle}>Đánh giá của bạn *</Text>
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((value, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setRating(value)}
                                    style={styles.stars}
                                >
                                    <AntDesign
                                        name="star"
                                        size={32}
                                        color={value <= rating ? '#facc15' : '#E5E7EB'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        {rating > 0 && (
                            <Text style={styles.ratingText}>
                                {rating === 1 ? 'Rất tệ' :
                                    rating === 2 ? 'Tệ' :
                                        rating === 3 ? 'Bình thường' :
                                            rating === 4 ? 'Tốt' : 'Xuất sắc'}
                            </Text>
                        )}
                    </View>

                    {/* Images Section */}
                    <View style={styles.imagesSection}>
                        <View style={styles.imagesSectionHeader}>
                            <Text style={styles.sectionTitle}>Hình ảnh ({images.length}/{MAX_IMAGES})</Text>
                            {images.length < MAX_IMAGES && (
                                <TouchableOpacity
                                    style={styles.addImageButton}
                                    onPress={showImagePickerOptions}
                                    disabled={isUploadingImage}
                                >
                                    <Feather name="plus" size={20} color={appColors.primary} />
                                    <Text style={styles.addImageText}>Thêm ảnh</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Images Grid */}
                        <View style={styles.imagesGrid}>
                            {images.map((imageUri, index) => (
                                <View key={index} style={styles.imageContainer}>
                                    <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => removeImage(index)}
                                    >
                                        <MaterialIcons name="close" size={18} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        {isUploadingImage && (
                            <View style={styles.uploadingContainer}>
                                <Text style={styles.uploadingText}>Đang tải ảnh lên...</Text>
                            </View>
                        )}
                    </View>

                    {/* Comment Section */}
                    <View style={styles.commentSection}>
                        <Text style={styles.sectionTitle}>Nhận xét</Text>
                        <TextInput
                            style={styles.comment}
                            placeholder="Chia sẻ trải nghiệm của bạn về sự kiện này..."
                            multiline
                            numberOfLines={4}
                            value={comment}
                            onChangeText={setComment}
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View style={styles.submitContainer}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            rating === 0 && styles.submitButtonDisabled
                        ]}
                        onPress={handlePostReview}
                        disabled={rating === 0}
                    >
                        <Text style={[
                            styles.submitButtonText,
                            rating === 0 && styles.submitButtonTextDisabled
                        ]}>
                            Gửi đánh giá
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Review;

const styles = StyleSheet.create({
    mainContentContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },

    contentWrapper: {
        flexGrow: 1,
        padding: 20,
    },

    // User Info Section
    infoContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        alignItems: 'center',
    },

    avatarContainer: {
        marginRight: 12,
    },

    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },

    detailInfoContainer: {
        flex: 1,
    },

    detailInfoName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },

    detailInfoSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },

    // Section Styles
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },

    // Rating Section
    ratingContainer: {
        marginBottom: 24,
    },

    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    stars: {
        marginRight: 8,
        padding: 4,
    },

    ratingText: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
    },

    // Images Section
    imagesSection: {
        marginBottom: 24,
    },

    imagesSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    addImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: appColors.primary,
    },

    addImageText: {
        marginLeft: 6,
        color: appColors.primary,
        fontSize: 14,
        fontWeight: '500',
    },

    imagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },

    imageContainer: {
        position: 'relative',
    },

    uploadedImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },

    removeImageButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#EF4444',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },

    uploadingContainer: {
        padding: 12,
        alignItems: 'center',
    },

    uploadingText: {
        color: '#6B7280',
        fontSize: 14,
    },

    // Comment Section
    commentSection: {
        marginBottom: 20,
    },

    comment: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 100,
        backgroundColor: '#FAFAFA',
    },

    // Submit Section
    submitContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#fff',
    },

    submitButton: {
        backgroundColor: appColors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },

    submitButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },

    submitButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'white',
    },

    submitButtonTextDisabled: {
        color: '#9CA3AF',
    },
});