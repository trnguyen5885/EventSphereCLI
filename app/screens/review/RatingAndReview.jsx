import React, {useEffect, useRef, useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image} from 'react-native';
import { appColors } from '../../constants/appColors';
import { TextComponent } from '../../components';
import { appInfo } from '../../constants/appInfos';
import { io } from 'socket.io-client';
import { useNavigation } from '@react-navigation/native';
import { AxiosInstance, formatDate, formatDateCreateAt } from '../../services';
import { globalStyles } from '../../constants/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RatingAndReview = ({detailEventId}) => {
     const navigation = useNavigation();
     const [listReview, setListReivew] = useState([]);
     const [isExpanded, setIsExpanded] = useState(false);
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
            } catch(e) {
                console.log(e);
            }
        };

        getListReviewDetailEvent();

        return () => {
            setListReivew([]);
          };
      },[detailEventId]);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const displayedReviews = isExpanded ? listReview : listReview.slice(0, 2);

    const renderStars = (rating) => {
        return Array.from({length: 5}, (_, index) => (
            <Ionicons
                key={index}
                name={index < rating ? 'star' : 'star-outline'}
                size={16}
                color={index < rating ? '#FFD700' : '#D1D5DB'}
            />
        ));
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
                        {/* Nút đánh giả của bạn */}
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
                                    {/* Header: avatar + tên + ngày */}
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

                                    {/* Nội dung bình luận */}
                                    <Text style={styles.commentContent}>
                                        {item.comment}
                                    </Text>

                                    {/* Các hành động */}
                                    <View style={styles.actionButtonContainer}>
                                        <TouchableOpacity style={styles.actionButtons}>
                                            <Ionicons name="heart-outline" size={16} color="#6B7280" />
                                            <Text style={styles.actionButtonText}>Thích</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionButtons}>
                                            <Ionicons name="flag-outline" size={16} color="#6B7280" />
                                            <Text style={styles.actionButtonText}>Báo cáo</Text>
                                        </TouchableOpacity>
                                    </View>
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
        backgroundColor: '#F9FAFB',
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

    commentContent: {
        color: '#374151',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },

    // Các nút hành động dưới comment
    actionButtonContainer: {
        flexDirection: 'row',
        gap: 12,
    },

    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    actionButtonText: {
        color: '#6B7280',
        fontSize: 13,
    },

    // Nút xem thêm
    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 12,
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },

    showMoreText: {
        color: appColors.primary,
        fontSize: 14,
        fontWeight: '600',
    },

    // Nút viết đánh giá
    writeReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    writeReviewText: {
        color: '#1F2937',
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        marginLeft: 12,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },

    emptyText: {
        color: '#1F2937',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },

    emptySubText: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
});