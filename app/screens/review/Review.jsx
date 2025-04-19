import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosInstance } from '../../services';
import { appColors } from '../../constants/appColors';
import ImagePicker from 'react-native-image-crop-picker';
import LoadingModal from '../../modals/LoadingModal';

const Review = ({navigation,route}) => {
    const {detailEventId} = route.params;
    const [selectedTag, setSelectedTag] = useState('Đã tham gia');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [userInfo, setUserInfo] = useState({
        userId: null,
        username: '',
        avatar: ''
    })
    const [image, setImage] = useState('');
    const [isLoading, setIsLoading] = useState(false)


    useEffect(() => {
        const getUserInfo = async () => {
            const userId = await AsyncStorage.getItem('userId');
            const response = await AxiosInstance().get(`/users/${userId}`);
            setUserInfo({
                userId: response.data._id,
                username: response.data.username,
                avatar: response.data.avatar ? response.data.avatar : 'https://avatar.iran.liara.run/public'
            })
        };
        getUserInfo();
    },[]);

    // Mở thư viện chọn ảnh
  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 500,
        height: 500,
        cropping: true, // Cho phép crop ảnh
        mediaType: 'photo',
      });
  
      console.log('Ảnh đã chọn:', image.path);
      uploadImage(image.path);
    } catch (error) {
      console.log('Người dùng đã hủy chọn ảnh hoặc lỗi:', error);
    }
  };

  // Kết nối Claudinary để tải ảnh lên
  const uploadImage = async (imageUri) => {
    let formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    formData.append('upload_preset', 'DATN2025'); // Thay bằng upload preset của bạn
  
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
      console.log('Cloudinary Response:', data);
  
      if (data.secure_url) {
        setImage(data.secure_url);
        console.log('URL Ảnh:', data.secure_url);
      } else {
        Alert.alert('Upload thất bại!', JSON.stringify(data));
      }
    } catch (error) {
      console.log('Lỗi upload:', error);
      Alert.alert('Lỗi!', 'Không thể tải ảnh lên.');
    }
  };

    const handlePostReview = async () => {
        setIsLoading(true);
        try {
            const response = await AxiosInstance().post('preview/post', {
                userId: userInfo.userId,
                eventId: detailEventId,
                comment: comment,
                rating: rating,
                image: image,

            });

            if(response.status) {
                Alert.alert('Đánh giá thành công', 'Cảm ơn bạn đã đánh giá',
                    [
                        {
                          text: 'OK',
                          onPress: () => navigation.goBack()
                        }
                      ]
                );
                
            }
        } catch(e) {
            console.log(e);
            setIsLoading(false)
        } finally {
            setIsLoading(false)
        }
    }

    if(isLoading) {
        return <LoadingModal />
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
                    {/* info */}
                    <View style={styles.infoContainer}>
                        <View style={styles.avatarContainer}>
                            <Image style = {styles.avatar} source={{uri: userInfo.avatar}} />
                        </View>

                        {/* tên sự kiện, đánh giá trung bình */}
                        <View style={styles.detailInfoContainer}>
                            <Text style={styles.detailInfoName}>{userInfo.username}</Text>
                            <Text style={styles.detailInfoRate}>
                                <AntDesign name="star" size={18} color="grey" /> 9.5
                            </Text>
                        </View>
                    </View>

                    {/* trạng thái đánh giá */}
                    <View style={styles.otherActionButtonsContainer}>
                        {['Chưa tham gia', 'Sắp tham gia', 'Đã tham gia'].map((tag, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.otherActionButtons,
                                    selectedTag === tag && styles.activeTag,
                                ]}
                                onPress={() => setSelectedTag(tag)}
                            >
                                <Text style={[
                                    styles.tagText,
                                    selectedTag === tag && styles.activeTagText,
                                ]}>
                                    {tag}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* đánh giá sao + comment */}
                    <View style={styles.ratingContainer}>
                        {/* Điều kiện: chỉ hiển thị nếu chọn "Đã tham gia" */}
                        {selectedTag === 'Đã tham gia' && (
                            <View>
                                <Text>Đánh giá của bạn</Text>
                                <View style={styles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map((value, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => setRating(value)}
                                            style={styles.stars}
                                        >
                                            <AntDesign
                                                name="star"
                                                size={24}
                                                color={value <= rating ? '#facc15' : 'grey'} // vàng khi được chọn
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Luôn hiển thị phần chọn ảnh */}
                        <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                            <Feather name="image" size={60} color="black" />
                        </TouchableOpacity>

                        {/* Luôn hiển thị ô comment */}
                        <TextInput
                            style={styles.comment}
                            placeholder='Đánh giá của bạn về sự kiện'
                            multiline
                            onChangeText={(value) => setComment(value)}
                        />
                    </View>
                </ScrollView>

                {/* nút Submit */}
                <View style={styles.submitContainer}>
                    <TouchableOpacity style={styles.submitButton} onPress={handlePostReview}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }}>Đánh giá</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Review;

const styles = StyleSheet.create({
    // View cha tổng chứa toàn bộ nội dung (flex layout)
    mainContentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 30,
        backgroundColor: '#fff',
    },

    // Gói phần nội dung cuộn (trừ nút Submit)
    contentWrapper: {
        flexGrow: 1,
        paddingBottom: 20, // chừa khoảng dưới cho đẹp
    },

    // Hàng chứa avatar và thông tin người dùng
    infoContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },

    // Khung ảnh đại diện (avatar)
    avatarContainer: {
        flex: 3,
        height: 80,
        borderRadius: 10,
        justifyContent:'center',
        alignItems:'center',
    },

    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40
    },

    // Khung chứa thông tin chi tiết như tên, ngày, v.v.
    detailInfoContainer: {
        flex: 8,
        height: 80,
        marginLeft: 10,
        borderRadius: 10,
        justifyContent: 'center',
    },

    // Tên sự kiện
    detailInfoName: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    detailInfoRate: {
        fontSize: 18,
    },
    // Nhóm nút chọn trạng thái (chưa tham gia, đã tham gia, ...)
    otherActionButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },

    // Style cho từng nút trạng thái
    otherActionButtons: {
        backgroundColor: '#E5E7EB',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        marginRight: 15,
    },

    // Phần chứa đánh giá sao và bình luận
    ratingContainer: {
        marginBottom: 20,
    },

    // Hàng chứa các icon ngôi sao
    starsContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },

    // Style cho mỗi ngôi sao
    stars: {
        marginRight: 10,
    },

    // Nút upload ảnh minh họa (nếu có)
    imageUploadButton: {
        width: 60,
        height: 60,
        marginVertical: 10,
        borderRadius: 10,
    },

    // Ô nhập bình luận của người dùng
    comment: {
        minHeight: 100,
        padding: 10,
        textAlignVertical: 'top', // giúp text bắt đầu từ trên cùng
    },

    // View chứa nút submit nằm cuối màn hình
    submitContainer: {
        paddingVertical: 15,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff',
    },

    // Nút submit đánh giá
    submitButton: {
        backgroundColor: appColors.primary,
        padding: 15,
        borderRadius: 15,
        width: '100%',
        alignItems: 'center',
    },
    activeTag: {
        backgroundColor: appColors.primary, // màu nền tag khi chọn
    },

    activeTagText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    tagText: {
        color: '#111827', // màu mặc định
    },

});

