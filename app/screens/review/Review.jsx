import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React from 'react'

const Review = () => {
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
                        <View style={styles.avatarContainer}></View>
                        <View style={styles.detailInfoContainer}></View>
                    </View>

                    {/* trạng thái đánh giá */}
                    <View style={styles.otherActionButtonsContainer}>
                        <TouchableOpacity style={styles.otherActionButtons}>
                            <Text>Chưa tham gia</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.otherActionButtons}>
                            <Text>Đã tham gia</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.otherActionButtons}>
                            <Text>Sắp tham gia</Text>
                        </TouchableOpacity>
                    </View>

                    {/* đánh giá sao + comment */}
                    <View style={styles.ratingContainer}>
                        <Text>Đánh giá của bạn</Text>
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((_, index) => (
                                <TouchableOpacity key={index} style={styles.stars}>
                                    {/* tui set cứng ngôi sao 
                                    vì chưa biết là buil lại rồi sài thư viện gì 
                                    nên ai làm chức năng sau thêm thư viện với icon lại giúp tui nha */}
                                    <Text style={{ fontSize: 24 }}>⭐</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.imageUploadButton}>
                            {/* image upload button */}
                        </TouchableOpacity>

                        <TextInput
                            style={styles.comment}
                            placeholder='Đánh giá của bạn về sự kiện'
                            multiline
                        />
                    </View>
                </ScrollView>

                {/* nút Submit */}
                <View style={styles.submitContainer}>
                    <TouchableOpacity style={styles.submitButton}>
                        <Text>Đánh giá</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default Review

const styles = StyleSheet.create({
    // View cha tổng chứa toàn bộ nội dung (flex layout)
    mainContentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 15,
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
        flex: 2,
        height: 80,
        borderRadius: 10,
        backgroundColor: 'grey',
    },

    // Khung chứa thông tin chi tiết như tên, ngày, v.v.
    detailInfoContainer: {
        flex: 8,
        height: 80,
        backgroundColor: 'grey',
        marginLeft: 10,
        borderRadius: 10,
    },

    // Nhóm nút chọn trạng thái (chưa tham gia, đã tham gia, ...)
    otherActionButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },

    // Style cho từng nút trạng thái
    otherActionButtons: {
        backgroundColor: 'grey',
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
        backgroundColor: 'pink',
        marginVertical: 10,
        borderRadius: 10,
    },

    // Ô nhập bình luận của người dùng
    comment: {
        height: 100,
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 10,
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
        backgroundColor: '#38ff90',
        padding: 15,
        borderRadius: 50,
        width: 200,
        alignItems: 'center',
    },
})

