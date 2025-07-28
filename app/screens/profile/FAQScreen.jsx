import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    LayoutAnimation,
    Platform,
    UIManager
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { appColors } from '../../constants/appColors';

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqData = [
    {
        category: 'Các câu hỏi về mua vé',
        questions: [
            {
                question: 'Làm sao để mua vé trên EventSphere?',
                answer:
                    'Bạn có thể chọn sự kiện muốn tham gia, chọn loại vé và thanh toán trực tuyến bằng các phương thức được hỗ trợ.'
            },
            {
                question: 'Tôi có thể thanh toán bằng những hình thức nào?',
                answer:
                    'Chúng tôi hỗ trợ thanh toán qua thẻ tín dụng, ví điện tử và chuyển khoản ngân hàng.'
            },
            {
                question: 'Làm sao để kiểm tra vé đã mua?',
                answer:
                    'Bạn có thể xem lịch sử mua vé trong phần "Tài khoản" hoặc kiểm tra email xác nhận.'
            }
        ]
    },
    {
        category: 'Các câu hỏi về việc tạo sự kiện',
        questions: [
            {
                question: 'Làm sao để tạo sự kiện mới?',
                answer:
                    'Đăng nhập vào tài khoản ban tổ chức và chọn “Tạo sự kiện”. Điền thông tin chi tiết và nhấn “Đăng sự kiện”.'
            },
            {
                question: 'Tôi có thể giới hạn số lượng vé bán ra không?',
                answer:
                    'Có. Khi tạo sự kiện, bạn có thể thiết lập số lượng vé theo nhu cầu.'
            }
        ]
    },
    {
        category: 'Các câu hỏi về tài khoản',
        questions: [
            {
                question: 'Tôi quên mật khẩu, làm sao để lấy lại?',
                answer:
                    'Nhấn vào “Quên mật khẩu” trên màn hình đăng nhập và làm theo hướng dẫn để khôi phục mật khẩu.'
            },
            {
                question: 'Tôi có thể cập nhật thông tin tài khoản không?',
                answer:
                    'Có. Bạn vào mục "Tài khoản", sau đó chọn chỉnh sửa thông tin cá nhân.'
            }
        ]
    }
];

const FAQScreen = ({ navigation }) => {
    const [expandedSections, setExpandedSections] = useState({});
    const [expandedQuestions, setExpandedQuestions] = useState({});

    const toggleSection = (index) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSections((prev) => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const toggleQuestion = (categoryIndex, questionIndex) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const key = `${categoryIndex}-${questionIndex}`;
        setExpandedQuestions((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={20} color="white" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Giải đáp thắc mắc</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.introBox}>
                    <Text style={styles.introTitle}>Đây là gì?</Text>
                    <Text style={styles.introText}>
                        EventSphere giúp bạn có thể mua vé các sự kiện dễ dàng và an toàn nhất.
                        Dưới đây là một số câu hỏi khách hàng thường hỏi chúng tôi.
                    </Text>
                </View>

                {faqData.map((section, sectionIndex) => (
                    <View key={sectionIndex}>
                        <TouchableOpacity
                            style={styles.sectionHeader}
                            onPress={() => toggleSection(sectionIndex)}
                        >
                            <Text style={styles.sectionHeaderText}>{section.category}</Text>
                            <Ionicons
                                name={expandedSections[sectionIndex] ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#555"
                            />
                        </TouchableOpacity>

                        {expandedSections[sectionIndex] && (
                            <View style={styles.questionList}>
                                {section.questions.map((item, questionIndex) => {
                                    const key = `${sectionIndex}-${questionIndex}`;
                                    return (
                                        <View key={questionIndex}>
                                            <TouchableOpacity
                                                style={styles.questionItem}
                                                onPress={() => toggleQuestion(sectionIndex, questionIndex)}
                                            >
                                                <Text style={styles.questionText}>{item.question}</Text>
                                                <Ionicons
                                                    name={expandedQuestions[key] ? 'remove' : 'add'}
                                                    size={20}
                                                    color="#555"
                                                />
                                            </TouchableOpacity>
                                            {expandedQuestions[key] && (
                                                <Text style={styles.answerText}>{item.answer}</Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        backgroundColor: appColors.primary,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 16,
    },

    backButton: {
        width: 30,
        height: 30,
        borderRadius: 20,
        // backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 40, // Để cân bằng với back button
    },
    content: {
        flex: 1
    },
    introBox: {
        backgroundColor: '#f9f9f9',
        padding: 16
    },
    introTitle: {
        color: appColors.primary,
        fontWeight: 'bold',
        marginBottom: 10
    },
    introText: {
        fontSize: 14,
        color: '#333'
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#f5f5f5'
    },
    sectionHeaderText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    questionList: {
        paddingHorizontal: 16,
        paddingBottom: 12
    },
    questionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    questionText: {
        fontSize: 15,
        flex: 1,
        color: '#333'
    },
    answerText: {
        paddingVertical: 8,
        fontSize: 14,
        color: '#555'
    }
});

export default FAQScreen;
