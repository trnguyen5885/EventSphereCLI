import React, {useEffect, useRef, useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image} from 'react-native';
import { appColors } from '../../constants/appColors';
import { TextComponent } from '../../components';
import { appInfo } from '../../constants/appInfos';
import { io } from 'socket.io-client';
import { useNavigation } from '@react-navigation/native';
import { AxiosInstance, formatDate, formatDateCreateAt } from '../../services';

const RatingAndReview = ({detailEventId}) => {
     const navigation = useNavigation();
     const [listReview, setListReivew] = useState([]);
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

    return (
        <View style={styles.container}>
            {/* Thanh tiêu đề */}
            <View style={styles.headerTaskbar}>
                <TextComponent text="Đánh giá và nhận xét" size={24} />
            </View>

            <ScrollView contentContainerStyle={styles.contentWrapper}>
                {/* Đánh giá trung bình và biểu đồ */}
                 {/* <View style={styles.ratingContainer}>
                    <View style={styles.avgRatingBox}>
                        <View style={styles.avgRatingContainer}>
                            <Text style={styles.avgRating}>9.5</Text>
                            <Text style={styles.maxRating}>/10</Text>
                        </View>
                        <Text style={styles.totalRating}>44 lượt đánh giá</Text>
                    </View>

                    <View style={styles.chartContainer}>
                        <Text style={styles.placeholderText}>[ Biểu đồ đánh giá ]</Text>
                    </View>
                </View> */}

                {/* Đánh giá của bạn */}
                {/* <View style={styles.userRating}>
                    <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
                    <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
                </View> */}

                {/* Danh sách bình luận */}
                <View style={styles.commentList}>
                    {listReview.map((item) => (
                        <View key={item._id} style={styles.commentItem}>

                            {/* Header: avatar + tên + ngày */}
                            <View style={styles.commentHeader}>
                                <Image style={styles.commentAvt} source={{
                                     uri:
                                     item.userId && item.userId.picUrl
                                       ? item.userId.picUrl
                                       : 'https://avatar.iran.liara./public',
                                }}  />
                                <Text style={styles.commentName}>{item.userId && item.userId.username ? item.userId && item.userId.username : ""}</Text>  
                            </View>

                            {/* Số sao đánh giá */}
                            <View style={styles.commentRating}>
                                <Text>{'⭐'.repeat(item.rating)}</Text>
                            </View>

                            {/* Nội dung bình luận */}
                            <Text style={styles.commentContent}>{item.comment}</Text>

                            {/* Các hành động */}
                            <View style={styles.actionButtonContainer}>
                                <TouchableOpacity style={styles.actionButtons}>
                                    <Text style={styles.actionButtonText}>Thích</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButtons}>
                                    <Text style={styles.actionButtonText}>Báo cáo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
                <TouchableOpacity activeOpacity={0.2} onPress={() => navigation.navigate('Review',{
                    detailEventId: detailEventId,

                })} >
                    <TextComponent styles={styles.comment} text="Đánh giá của bạn về sự kiện" />
                </TouchableOpacity>
            </ScrollView>


        </View>
    );
};

export default RatingAndReview;

const styles = StyleSheet.create({
    // Container chính
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },

    // Header (thanh tiêu đề)
    headerTaskbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#E5E5E5',
    },
    headerTitle: {
        fontSize: 22,

        color: appColors.text,
    },
    backIcon: {
        fontSize: 20,
    },

    // Bọc nội dung chính (scroll view)
    contentWrapper: {
        paddingHorizontal: 15,
        paddingBottom: 10,
    },

    // Phần đánh giá trung bình + biểu đồ
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'baseline',
        marginVertical: 20,
    },
    avgRatingBox: {
        flex: 1,
        marginRight: 10,
    },
    avgRatingContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    avgRating: {
        fontSize: 40,
        fontWeight: 'bold',
    },
    maxRating: {
        fontSize: 20,
        color: 'grey',
        marginLeft: 2,
    },
    totalRating: {
        marginTop: 5,
        color: 'grey',
    },
    chartContainer: {
        width: 180,
        height: 100,
        backgroundColor: '#EEE',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: 'grey',
    },

    // Đánh giá của bạn
    userRating: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#E5E5E5',
    },
    sectionTitle: {
        fontWeight: '600',
    },
    stars: {
        fontSize: 18,
    },

    // Danh sách bình luận
    commentList: {
        paddingVertical: 10,
    },
    commentItem: {
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderColor: '#E5E5E5',
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    commentAvt: {
        width: 35,
        height: 35,
        borderRadius: 25,
    },
    commentName: {
        marginHorizontal: 10,
        fontWeight: '600',
    },
    commentDate: {
        color: 'grey',
        fontSize: 12,
    },
    commentRating: {
        marginVertical: 5,
    },
    commentContent: {
        marginBottom: 10,
    },

    // Các nút hành động dưới comment
    actionButtonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButtons: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    actionButtonText: {
        fontSize: 13,
    },
    comment: {
        minHeight: 50,
        padding: 10,
        textAlignVertical: 'top', // giúp text bắt đầu từ trên cùng
    },
});
