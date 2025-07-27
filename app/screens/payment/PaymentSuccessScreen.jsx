import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    Animated,
    ScrollView,
    StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../../constants/appColors';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');

const PaymentSuccessScreen = ({ route, navigation }) => {
    const {
        amount,
        eventName,
        orderCode,
        transactionId,
        paymentMethod = 'QR Code PayOS',
        timestamp = Date.now(),
        orderId,
        ticketId,
        totalPrice,
        bookingType,
        showtimeId,
        isVirtualPayment = false
    } = route.params || {};

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const checkmarkScale = useRef(new Animated.Value(0)).current;
    const confettiAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const sparkleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Status bar styling
        StatusBar.setBarStyle('light-content', true);
        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor(appColors.primary, true);
        }

        // Animation sequence
        const animationSequence = Animated.sequence([
            // Initial fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            // Checkmark animation
            Animated.spring(checkmarkScale, {
                toValue: 1,
                tension: 100,
                friction: 3,
                useNativeDriver: true,
            }),
            // Content slide up
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
        ]);

        // Start main animation
        animationSequence.start();

        // Continuous pulse animation
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseAnimation.start();

        // Sparkle animation
        const sparkleAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(sparkleAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(sparkleAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        sparkleAnimation.start();

        // Confetti animation
        Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }).start();

        return () => {
            pulseAnimation.stop();
            sparkleAnimation.stop();
        };
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('Drawer');
                return true; // chặn behavior mặc định
            };

            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress
            );

            return () => backHandler.remove(); // chuẩn mới
        }, [navigation])
    );



    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatAmount = (amount) => {
        return amount?.toLocaleString('vi-VN') || '0';
    };

    const ConfettiParticle = ({ delay }) => {
        const animValue = useRef(new Animated.Value(0)).current;
        const rotateValue = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            const animation = Animated.loop(
                Animated.parallel([
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: 3000,
                        delay: delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateValue, {
                        toValue: 1,
                        duration: 2000,
                        delay: delay,
                        useNativeDriver: true,
                    }),
                ])
            );
            animation.start();
            return () => animation.stop();
        }, []);

        const translateY = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, height + 100],
        });

        const rotate = rotateValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });

        return (
            <Animated.View
                style={[
                    styles.confettiParticle,
                    {
                        transform: [{ translateY }, { rotate }],
                        left: Math.random() * width,
                    },
                ]}
            />
        );
    };

    const SparkleEffect = ({ style }) => {
        return (
            <Animated.View
                style={[
                    styles.sparkle,
                    style,
                    {
                        opacity: sparkleAnim,
                        transform: [
                            {
                                scale: sparkleAnim.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: [0, 1.2, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <Ionicons name="sparkles" size={12} color="#FFD700" />
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Confetti Animation */}
            {Array.from({ length: 20 }).map((_, index) => (
                <ConfettiParticle key={index} delay={index * 100} />
            ))}

            {/* Background Gradient Circles */}
            <View style={styles.backgroundCircle1} />
            <View style={styles.backgroundCircle2} />
            <View style={styles.backgroundCircle3} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View
                    style={[
                        styles.header,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Drawer')}
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thanh toán</Text>
                    <View style={styles.placeholder} />
                </Animated.View>

                {/* Success Icon with Animation */}
                <Animated.View
                    style={[
                        styles.successIconContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: pulseAnim }],
                        },
                    ]}
                >
                    {/* Pulse Rings */}
                    <Animated.View
                        style={[
                            styles.pulseRing,
                            styles.pulseRing1,
                            {
                                opacity: pulseAnim.interpolate({
                                    inputRange: [1, 1.1],
                                    outputRange: [0.3, 0],
                                }),
                                transform: [{ scale: pulseAnim }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.pulseRing,
                            styles.pulseRing2,
                            {
                                opacity: pulseAnim.interpolate({
                                    inputRange: [1, 1.1],
                                    outputRange: [0.2, 0],
                                }),
                                transform: [
                                    {
                                        scale: pulseAnim.interpolate({
                                            inputRange: [1, 1.1],
                                            outputRange: [1.2, 1.4],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    />

                    {/* Main Success Circle */}
                    <Animated.View
                        style={[
                            styles.successCircle,
                            {
                                transform: [{ scale: checkmarkScale }],
                            },
                        ]}
                    >
                        <Ionicons name="checkmark" size={48} color="white" />
                    </Animated.View>

                    {/* Sparkle Effects */}
                    <SparkleEffect style={styles.sparkle1} />
                    <SparkleEffect style={styles.sparkle2} />
                    <SparkleEffect style={styles.sparkle3} />
                    <SparkleEffect style={styles.sparkle4} />
                </Animated.View>

                {/* Success Message */}
                <Animated.View
                    style={[
                        styles.messageContainer,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { scale: scaleAnim },
                                { translateY: slideAnim },
                            ],
                        },
                    ]}
                >
                    <Text style={styles.successTitle}>Thanh toán thành công!</Text>
                    <Text style={styles.successSubtitle}>
                        {isVirtualPayment
                            ? 'Giao dịch thử nghiệm đã được xử lý thành công'
                            : 'Giao dịch của bạn đã được xử lý thành công'
                        }
                    </Text>
                </Animated.View>

                {/* Transaction Details Card */}
                <Animated.View
                    style={[
                        styles.detailsCard,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { scale: scaleAnim },
                                { translateY: slideAnim },
                            ],
                        },
                    ]}
                >
                    {/* Amount Section */}
                    <View style={styles.amountSection}>
                        <View style={styles.amountHeader}>
                            <View style={styles.amountIconContainer}>
                                <MaterialIcons name="payments" size={24} color={appColors.primary} />
                            </View>
                            <Text style={styles.amountLabel}>Số tiền đã thanh toán</Text>
                        </View>
                        <Text style={styles.amountValue}>
                            {formatAmount(totalPrice || amount)} VNĐ
                        </Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Transaction Info */}
                    <View style={styles.transactionInfo}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="receipt-outline" size={16} color="#666" />
                                <Text style={styles.infoLabel}>Mã đơn hàng</Text>
                            </View>
                            <Text style={styles.infoValue}>{orderCode || 'N/A'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="card-outline" size={16} color="#666" />
                                <Text style={styles.infoLabel}>Phương thức</Text>
                            </View>
                            <Text style={styles.infoValue}>{paymentMethod}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="calendar-outline" size={16} color="#666" />
                                <Text style={styles.infoLabel}>Thời gian</Text>
                            </View>
                            <Text style={styles.infoValue}>{formatDate(timestamp)}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="business-outline" size={16} color="#666" />
                                <Text style={styles.infoLabel}>Sự kiện</Text>
                            </View>
                            <Text style={styles.infoValue} numberOfLines={2}>
                                {eventName || 'N/A'}
                            </Text>
                        </View>

                        {transactionId && (
                            <View style={styles.infoRow}>
                                <View style={styles.infoLeft}>
                                    <Ionicons name="finger-print-outline" size={16} color="#666" />
                                    <Text style={styles.infoLabel}>Mã giao dịch</Text>
                                </View>
                                <Text style={styles.infoValue}>{transactionId}</Text>
                            </View>
                        )}
                    </View>

                    {/* Success Badge */}
                    <View style={styles.successBadge}>
                        <View style={styles.successBadgeIcon}>
                            <Ionicons
                                name={isVirtualPayment ? "flask" : "shield-checkmark"}
                                size={16}
                                color={isVirtualPayment ? "#FF8800" : "#00C851"}
                            />
                        </View>
                        <Text style={[
                            styles.successBadgeText,
                            { color: isVirtualPayment ? "#FF8800" : "#00C851" }
                        ]}>
                            {isVirtualPayment ? 'Giao dịch thử nghiệm' : 'Giao dịch được bảo mật'}
                        </Text>
                    </View>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View
                    style={[
                        styles.buttonContainer,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { scale: scaleAnim },
                                { translateY: slideAnim },
                            ],
                        },
                    ]}
                >
                    {/* My Tickets Button - Primary */}
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => {
                            navigation.navigate('Drawer', {
                                screen: 'Home',
                                params: {
                                    screen: 'Vé của tôi',
                                },
                            });
                        }}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <View style={styles.buttonIconContainer}>
                                <Ionicons name="ticket" size={20} color="white" />
                            </View>
                            <View style={styles.buttonTextContainer}>
                                <Text style={styles.primaryButtonText}>Vé của tôi</Text>
                                <Text style={styles.buttonSubtext}>Xem chi tiết vé đã mua</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </View>
                    </TouchableOpacity>

                    {/* Back Button - Secondary */}
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Drawer')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <View style={[styles.buttonIconContainer, styles.secondaryIcon]}>
                                <Ionicons name="home" size={20} color={appColors.primary} />
                            </View>
                            <View style={styles.buttonTextContainer}>
                                <Text style={styles.secondaryButtonText}>Trở về</Text>
                                <Text style={[styles.buttonSubtext, styles.secondarySubtext]}>
                                    Về trang chủ
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={appColors.primary} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Footer Message */}
                <Animated.View
                    style={[
                        styles.footerMessage,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.footerIcon}>
                        <Ionicons name="information-circle" size={16} color="#7f8c8d" />
                    </View>
                    <Text style={styles.footerText}>
                        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!{'\n'}
                        Vé sẽ được gửi qua email và có thể xem trong mục "Vé của tôi"
                    </Text>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: appColors.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // Background Effects
    backgroundCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -50,
        right: -50,
    },
    backgroundCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        bottom: 100,
        left: -30,
    },
    backgroundCircle3: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        top: '30%',
        left: '80%',
    },

    // Confetti
    confettiParticle: {
        position: 'absolute',
        width: 8,
        height: 8,
        backgroundColor: '#FFD700',
        borderRadius: 4,
        zIndex: 1000,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        // backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    placeholder: {
        width: 40,
    },

    // Success Icon
    successIconContainer: {
        alignItems: 'center',
        marginVertical: 40,
        position: 'relative',
    },
    pulseRing: {
        position: 'absolute',
        borderRadius: 80,
        borderWidth: 2,
        borderColor: '#00C851',
    },
    pulseRing1: {
        width: 160,
        height: 160,
    },
    pulseRing2: {
        width: 200,
        height: 200,
    },
    successCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#00C851',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#00C851',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },

    // Sparkles
    sparkle: {
        position: 'absolute',
    },
    sparkle1: {
        top: 20,
        left: 30,
    },
    sparkle2: {
        top: 40,
        right: 20,
    },
    sparkle3: {
        bottom: 30,
        left: 20,
    },
    sparkle4: {
        bottom: 20,
        right: 40,
    },

    // Message
    messageContainer: {
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    successSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 24,
    },

    // Details Card
    detailsCard: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
    },

    // Amount Section
    amountSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    amountHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    amountIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: appColors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    amountLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    amountValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: appColors.primary,
        letterSpacing: 0.5,
    },

    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 20,
    },

    // Transaction Info
    transactionInfo: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#2c3e50',
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },

    // Success Badge
    successBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00C851' + '15',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#00C851' + '30',
    },
    successBadgeIcon: {
        marginRight: 8,
    },
    successBadgeText: {
        fontSize: 14,
        color: '#00C851',
        fontWeight: '600',
    },

    // Buttons
    buttonContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    primaryButton: {
        backgroundColor: 'white',
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    buttonIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: appColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    secondaryIcon: {
        backgroundColor: 'white',
    },
    buttonTextContainer: {
        flex: 1,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: appColors.primary,
        marginBottom: 2,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
        marginBottom: 2,
    },
    buttonSubtext: {
        fontSize: 12,
        color: '#666',
    },
    secondarySubtext: {
        color: 'rgba(255, 255, 255, 0.7)',
    },

    // Footer
    footerMessage: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginHorizontal: 20,
        marginTop: 32,
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    footerIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    footerText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 20,
        flex: 1,
    },
});

export default PaymentSuccessScreen;