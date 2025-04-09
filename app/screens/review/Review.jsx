import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
const Review = () => {
    const [selectedTag, setSelectedTag] = useState('Đã tham gia');
    const [rating, setRating] = useState(0);

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
                            <Feather name="image" size={80} color="black" />
                        </View>

                        {/* tên sự kiện, đánh giá trung bình */}
                        <View style={styles.detailInfoContainer}>
                            <Text style={styles.detailInfoName}>Sĩ đẹp trai vl hehehe</Text>
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
                                    selectedTag === tag && styles.activeTagText
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
                        <TouchableOpacity style={styles.imageUploadButton}>
                            <Feather name="image" size={60} color="black" />
                        </TouchableOpacity>

                        {/* Luôn hiển thị ô comment */}
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
                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }}>Đánh giá</Text>
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
        flex: 2,
        height: 80,
        borderRadius: 10,
        justifyContent:'center',
        alignItems:'center'
    },

    // Khung chứa thông tin chi tiết như tên, ngày, v.v.
    detailInfoContainer: {
        flex: 8,
        height: 80,
        marginLeft: 10,
        borderRadius: 10,
        justifyContent: 'center'
    },

    // Tên sự kiện
    detailInfoName: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    detailInfoRate: {
        fontSize: 18
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
        backgroundColor: '#22C55E',
        padding: 15,
        borderRadius: 50,
        width: 200,
        alignItems: 'center',
    },
    activeTag: {
        backgroundColor: '#22C55E', // màu nền tag khi chọn
    },

    activeTagText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    tagText: {
        color: '#111827', // màu mặc định
    },

})

