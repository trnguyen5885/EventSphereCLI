import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Dimensions, Modal, FlatList } from 'react-native';
import { appColors } from '../../constants/appColors';
import { TextComponent } from '../../components';
import { appInfo } from '../../constants/appInfos';
import { io } from 'socket.io-client';
import { useNavigation } from '@react-navigation/native';
import { AxiosInstance, formatDate, formatDateCreateAt } from '../../services';
import { globalStyles } from '../../constants/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: screenWidth } = Dimensions.get('window');

const RatingAndReview = ({ detailEventId }) => {
    const navigation = useNavigation();
    const [listReview, setListReivew] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const socketRef = useRef(null);

    console.log(listReview);

    useEffect(() => {
        socketRef.current = io(appInfo.BASE_URL_NOAPI, {
            transports: ['websocket'],
        });

        // Lắng nghe sự kiện 'newPostEvent'
        socketRef.current.on('newPostEvent', (data) => {
            if (data.post.eventId === detailEventId) {
                setListReivew((prevReviews) => [data.post, ...prevReviews]);
            }
        });

        // Dọn dẹp khi component bị hủy
        return () => {
            socketRef.current.disconnect();
        };
    }, [detailEventId]);

    useEffect(() => {
        const getListReviewDetailEvent = async () => {
            try {
                const response = await AxiosInstance().get(`preview/${detailEventId}`);
                setListReivew(response.data);
            } catch (e) {
                console.log(e);
            }
        };

        getListReviewDetailEvent();

        return () => {
            setListReivew([]);
        };
    }, [detailEventId]);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const openImageModal = (images, startIndex = 0) => {
        setSelectedImages(images);
        setCurrentImageIndex(startIndex);
        setIsImageModalVisible(true);
    };

    const closeImageModal = () => {
        setIsImageModalVisible(false);
        setSelectedImages([]);
        setCurrentImageIndex(0);
    };

    const displayedReviews = isExpanded ? listReview : listReview.slice(0, 2);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Ionicons
                key={index}
                name={index < rating ? 'star' : 'star-outline'}
                size={16}
                color={index < rating ? '#FFD700' : '#D1D5DB'}
            />
        ));
    };

    // Component hiển thị grid ảnh
    const renderImageGrid = (images) => {
        if (!images || images.length === 0) return null;

        // Nếu chỉ có 1 ảnh
        if (images.length === 1) {
            return (
                <TouchableOpacity 
                    style={styles.singleImageContainer}
                    onPress={() => openImageModal(images, 0)}
                    activeOpacity={0.8}
                >
                    <Image source={{ uri: images[0] }} style={styles.singleImage} />
                </TouchableOpacity>
            );
        }

        // Nếu có 2 ảnh
        if (images.length === 2) {
            return (
                <View style={styles.twoImagesContainer}>
                    {images.map((image, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => openImageModal(images, index)}
                            activeOpacity={0.8}
                        >
                            <Image source={{ uri: image }} style={styles.twoImages} />
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        // Nếu có 3 ảnh trở lên
        return (
            <View style={styles.multipleImagesContainer}>
                <TouchableOpacity
                    onPress={() => openImageModal(images, 0)}
                    activeOpacity={0.8}
                >
                    <Image source={{ uri: images[0] }} style={styles.mainImage} />
                </TouchableOpacity>
                <View style={styles.sideImagesContainer}>
                    <TouchableOpacity
                        onPress={() => openImageModal(images, 1)}
                        activeOpacity={0.8}
                    >
                        <Image source={{ uri: images[1] }} style={styles.sideImage} />
                    </TouchableOpacity>
                    {images[2] ? (
                        <TouchableOpacity
                            style={styles.lastImageContainer}
                            onPress={() => openImageModal(images, 2)}
                            activeOpacity={0.8}
                        >
                            <Image source={{ uri: images[2] }} style={styles.sideImage} />
                            {images.length > 3 && (
                                <View style={styles.moreImagesOverlay}>
                                    <Text style={styles.moreImagesText}>+{images.length - 3}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.sectionContainer}>
            {/* Header Section */}
            <TouchableOpacity style={styles.sectionHeader} onPress={toggleExpanded}>
                <TextComponent
                    text="Đánh giá và nhận xét"
                    size={18}
                    styles={{ fontWeight: 'bold', color: '#1F2937' }}
                />
                <View style={styles.headerRight}>
                    <Text style={styles.reviewCount}>({listReview.length})</Text>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color="#6B7280"
                    />
                </View>
            </TouchableOpacity>

            {/* Content Section */}
            {isExpanded && (
                <View style={styles.sectionContent}>
                    <View style={styles.contentWrapper}>
                        {/* Nút đánh giá của bạn */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('Review', {
                                detailEventId: detailEventId,
                            })}
                            style={styles.writeReviewButton}
                        >
                            <Ionicons name="create-outline" size={20} color={appColors.primary} />
                            <Text style={styles.writeReviewText}>Viết đánh giá của bạn</Text>
                            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                        </TouchableOpacity>

                        {/* Danh sách bình luận */}
                        {displayedReviews.length > 0 ? (
                            displayedReviews.map((item, index) => (
                                <View key={item._id} style={[
                                    styles.commentItem,
                                    index === displayedReviews.length - 1 && styles.lastCommentItem
                                ]}>
                                    {/* Header: avatar + tên + rating */}
                                    <View style={styles.commentHeader}>
                                        <Image
                                            style={styles.commentAvt}
                                            source={{
                                                uri: item?.userId?.picUrl ?
                                                    item?.userId?.picUrl :
                                                    'https://avatar.iran.liara.run/public'
                                            }}
                                        />
                                        <View style={styles.commentUserInfo}>
                                            <Text style={styles.commentName}>
                                                {item?.userId?.username}
                                            </Text>
                                            <View style={styles.commentRating}>
                                                {renderStars(item.rating)}
                                            </View>
                                        </View>
                                    </View>

                                    {/* Hiển thị ảnh từ trường image */}
                                    {item.image && item.image.length > 0 && (
                                        <View style={styles.imagesContainer}>
                                            {renderImageGrid(item.image)}
                                        </View>
                                    )}

                                    {/* Nội dung bình luận */}
                                    {item.comment && item.comment.trim() !== '' && (
                                        <Text style={styles.commentContent}>
                                            {item.comment}
                                        </Text>
                                    )}

                                    
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
                                <Text style={styles.emptySubText}>Hãy là người đầu tiên đánh giá sự kiện này</Text>
                            </View>
                        )}

                        {/* Nút xem thêm/ít hơn */}
                        {listReview.length > 2 && (
                            <TouchableOpacity
                                style={styles.showMoreButton}
                                onPress={toggleExpanded}
                            >
                                <Text style={styles.showMoreText}>
                                    {isExpanded ? 'Thu gọn' : `Xem thêm ${listReview.length - 2} đánh giá`}
                                </Text>
                                <Ionicons
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={16}
                                    color={appColors.primary}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Modal xem ảnh full screen */}
            <Modal
                visible={isImageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeImageModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeImageModal}
                        >
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.imageCounter}>
                            {currentImageIndex + 1} / {selectedImages.length}
                        </Text>
                    </View>
                    
                    <FlatList
                        data={selectedImages}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        initialScrollIndex={currentImageIndex}
                        getItemLayout={(data, index) => ({
                            length: screenWidth,
                            offset: screenWidth * index,
                            index,
                        })}
                        onMomentumScrollEnd={(event) => {
                            const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                            setCurrentImageIndex(newIndex);
                        }}
                        renderItem={({ item }) => (
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: item }}
                                    style={styles.fullScreenImage}
                                    resizeMode="contain"
                                />
                            </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    
                    {selectedImages.length > 1 && (
                        <View style={styles.dotsContainer}>
                            {selectedImages.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        index === currentImageIndex && styles.activeDot
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
};

export default RatingAndReview;

const styles = StyleSheet.create({
    // Container chính với background sáng
    sectionContainer: {
        marginHorizontal: 12,
        marginTop: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },

    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    reviewCount: {
        color: '#6B7280',
        fontSize: 16,
    },

    sectionContent: {
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },

    contentWrapper: {
        padding: 16,
        paddingTop: 0,
    },

    // Danh sách bình luận
    commentItem: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },

    lastCommentItem: {
        borderBottomWidth: 0,
        marginBottom: 0,
        paddingBottom: 0,
    },

    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    commentAvt: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },

    commentUserInfo: {
        marginLeft: 12,
        flex: 1,
    },

    commentName: {
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },

    commentRating: {
        flexDirection: 'row',
        gap: 2,
    },

    // Images Container
    imagesContainer: {
        marginBottom: 12,
    },

    // Single Image
    singleImageContainer: {
        alignItems: 'flex-start',
    },

    singleImage: {
        width: screenWidth - 64, // Trừ padding
        height: 200,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },

    // Two Images
    twoImagesContainer: {
        flexDirection: 'row',
        gap: 8,
    },

    twoImages: {
        width: (screenWidth - 80) / 2, // Chia đôi trừ padding và gap
        height: 150,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },

    // Multiple Images (3+)
    multipleImagesContainer: {
        flexDirection: 'row',
        gap: 8,
        height: 150,
    },

    mainImage: {
        width: (screenWidth - 80) * 0.6, // 60% width
        height: 150,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },

    sideImagesContainer: {
        flex: 1,
        gap: 8,
    },

    sideImage: {
        width: '100%',
        height: 71, // (150 - 8) / 2
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },

    lastImageContainer: {
        position: 'relative',
    },

    moreImagesOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    moreImagesText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Comment Content
    commentContent: {
        fontSize: 15,
        lineHeight: 20,
        color: '#374151',
        marginBottom: 12,
    },

    // Action Buttons
    actionButtonContainer: {
        flexDirection: 'row',
        gap: 16,
    },

    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },

    actionButtonText: {
        fontSize: 14,
        color: '#6B7280',
    },

    // Write Review Button
    writeReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    writeReviewText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: appColors.primary,
        fontWeight: '500',
    },

    // Show More Button
    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        marginTop: 8,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    showMoreText: {
        fontSize: 14,
        color: appColors.primary,
        fontWeight: '500',
        marginRight: 4,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },

    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 12,
        marginBottom: 4,
    },

    emptySubText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },

    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
    },

    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    closeButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 22,
    },

    imageCounter: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    imageContainer: {
        width: screenWidth,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    fullScreenImage: {
        width: screenWidth,
        height: '80%',
    },

    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        marginHorizontal: 4,
    },

    activeDot: {
        backgroundColor: 'white',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});