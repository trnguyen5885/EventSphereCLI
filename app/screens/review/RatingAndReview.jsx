import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
const mockReviews = [
    {
        id: 1,
        name: 'Nguyễn Văn A',
        date: '1/1/2024',
        rating: 5,
        comment: 'Sự kiện rất tuyệt vời, mình đã có trải nghiệm đáng nhớ!',
    },
    {
        id: 2,
        name: 'Trần Thị B',
        date: '2/2/2024',
        rating: 4,
        comment: 'Tổ chức ổn áp, chỉ hơi đông chút xíu.',
    },
    {
        id: 3,
        name: 'Lê Văn C',
        date: '3/3/2024',
        rating: 3,
        comment: 'Không như kỳ vọng nhưng cũng được.',
    },
];

const RatingAndReview = () => {
    return (
        <View style={styles.container}>
            {/* Thanh tiêu đề */}
            <View style={styles.headerTaskbar}>
                <TouchableOpacity>
                    <Text style={styles.backIcon}>◀︎</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đánh giá & Nhận xét</Text>
                <View style={{ width: 24 }} /> {/* Placeholder cân giữa */}
            </View>

            <ScrollView contentContainerStyle={styles.contentWrapper}>
                {/* Đánh giá trung bình và biểu đồ */}
                <View style={styles.ratingContainer}>
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
                </View>

                {/* Đánh giá của bạn */}
                <View style={styles.userRating}>
                    <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
                    <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
                </View>

                {/* Danh sách bình luận */}
                <View style={styles.commentList}>
                    {mockReviews.map((item) => (
                        <View key={item.id} style={styles.commentItem}>

                            {/* Header: avatar + tên + ngày */}
                            <View style={styles.commentHeader}>
                                <View style={styles.commentAvt} />
                                <Text style={styles.commentName}>{item.name}</Text>
                                <Text style={styles.commentDate}>{item.date}</Text>
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
        fontSize: 18,
        fontWeight: '600',
    },
    backIcon: {
        fontSize: 20,
    },

    // Bọc nội dung chính (scroll view)
    contentWrapper: {
        paddingHorizontal: 15,
        paddingBottom: 30,
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
        backgroundColor: 'grey',
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
});
