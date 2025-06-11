import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Platform,
    Alert
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { AxiosInstance } from '../../services';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const EventDetailOrganizer = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { eventId } = route.params;

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [eventStats, setEventStats] = useState({
        totalTicketsSold: 0,
        totalRevenue: 0,
        attendanceRate: 0,
    });

    const formatDate = (timestamp) => {
        const date = new Date(
            timestamp.toString().length === 13 ? timestamp : timestamp * 1000
        );
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getEventStatus = (timeStart, timeEnd) => {
        const now = new Date();
        const start = new Date(timeStart.toString().length === 13 ? timeStart : timeStart * 1000);
        const end = new Date(timeEnd.toString().length === 13 ? timeEnd : timeEnd * 1000);
        
        if (now < start) return { status: 'upcoming', text: 'Sắp diễn ra', color: '#FF9800' };
        if (now >= start && now <= end) return { status: 'ongoing', text: 'Đang diễn ra', color: '#4CAF50' };
        return { status: 'ended', text: 'Đã kết thúc', color: '#757575' };
    };

    const calculateProgress = () => {
        if (!event) return 0;
        return Math.round((eventStats.totalTicketsSold / event.ticketQuantity) * 100);
    };

    const fetchEventDetail = async () => {
        try {
            console.log('Fetching event details for ID:', eventId);
            const res = await AxiosInstance().get(`events/detail/${eventId}`);
            setEvent(res.data);
            
            // Mock data cho thống kê - trong thực tế sẽ gọi API riêng
            setEventStats({
                totalTicketsSold: Math.floor(Math.random() * res.data.ticketQuantity),
                totalRevenue: Math.floor(Math.random() * 50000000),
                attendanceRate: Math.floor(Math.random() * 100),
            });
            
            console.log('Event details fetched successfully:', res.data);
        } catch (err) {
            console.error('Failed to fetch event details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditEvent = () => {
        navigation.navigate('EditEvent', { eventId, event });
    };

    const handleViewAttendees = () => {
        navigation.navigate('EventAttendees', { eventId });
    };

    const handleViewAnalytics = () => {
        navigation.navigate('EventAnalytics', { eventId });
    };

    const handlePromoteEvent = () => {
        navigation.navigate('PromoteEvent', { eventId });
    };

    useFocusEffect(
        useCallback(() => {
            fetchEventDetail();
        }, [eventId])
    );

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#5669FF" />
            </View>
        );
    }

    if (!event) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.error}>Không thể tải chi tiết sự kiện.</Text>
            </SafeAreaView>
        );
    }

    const eventStatusInfo = getEventStatus(event.timeStart, event.timeEnd);
    const progressPercentage = calculateProgress();

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý sự kiện</Text>
                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => {
                        // Show more options menu
                    }}
                >
                    <MaterialIcons name="more-vert" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Banner with status overlay */}
                <View style={styles.bannerContainer}>
                    <Image source={{ uri: event.banner }} style={styles.banner} />
                    <View style={styles.bannerOverlay} />
                    <View style={[styles.statusBadge, { backgroundColor: eventStatusInfo.color }]}>
                        <Text style={styles.statusText}>{eventStatusInfo.text}</Text>
                    </View>
                </View>

                {/* Event Basic Info */}
                <View style={styles.contentContainer}>
                    <View style={styles.eventHeaderRow}>
                        <Image source={{ uri: event.avatar }} style={styles.avatar} />
                        <View style={styles.eventTitleContainer}>
                            <Text style={styles.title}>{event.name}</Text>
                            <Text style={styles.eventId}>ID: {event.id || eventId}</Text>
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.quickStatsContainer}>
                        <View style={styles.statItem}>
                            <MaterialIcons name="confirmation-number" size={20} color="#4CAF50" />
                            <Text style={styles.statNumber}>{eventStats.totalTicketsSold}</Text>
                            <Text style={styles.statLabel}>Vé đã bán</Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <FontAwesome5 name="money-bill-wave" size={20} color="#FF9800" />
                            <Text style={styles.statNumber}>{formatCurrency(eventStats.totalRevenue)}</Text>
                            <Text style={styles.statLabel}>Doanh thu</Text>
                        </View>
                    </View>

                    {/* Sales Progress */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressTitle}>Tiến độ bán vé</Text>
                            <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                        </View>
                        <Text style={styles.progressText}>
                            {eventStats.totalTicketsSold} / {event.ticketQuantity} vé
                        </Text>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.quickActionsContainer}>
                        
                        <TouchableOpacity style={styles.secondaryAction} onPress={handleViewAttendees}>
                            <MaterialIcons name="people-outline" size={20} color="#5669FF" />
                            <Text style={styles.secondaryActionText}>Người tham gia</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Management Options */}
                    <View style={styles.managementSection}>
                        <Text style={styles.sectionTitle}>Quản lý & Thống kê</Text>
                        
                        <TouchableOpacity style={styles.managementItem} onPress={handleViewAnalytics}>
                            <MaterialIcons name="analytics" size={24} color="#5669FF" />
                            <View style={styles.managementItemContent}>
                                <Text style={styles.managementItemTitle}>Thống kê chi tiết</Text>
                                <Text style={styles.managementItemDesc}>Xem báo cáo doanh thu, tỷ lệ tham gia</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.managementItem} onPress={handlePromoteEvent}>
                            <MaterialCommunityIcons name="bullhorn" size={24} color="#5669FF" />
                            <View style={styles.managementItemContent}>
                                <Text style={styles.managementItemTitle}>Quảng bá sự kiện</Text>
                                <Text style={styles.managementItemDesc}>Tạo mã giảm giá, chia sẻ trên mạng xã hội</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.managementItem}>
                            <MaterialIcons name="email" size={24} color="#5669FF" />
                            <View style={styles.managementItemContent}>
                                <Text style={styles.managementItemTitle}>Gửi thông báo</Text>
                                <Text style={styles.managementItemDesc}>Gửi email/SMS cho người tham gia</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.managementItem}>
                            <MaterialCommunityIcons name="qrcode-scan" size={24} color="#5669FF" />
                            <View style={styles.managementItemContent}>
                                <Text style={styles.managementItemTitle}>Check-in</Text>
                                <Text style={styles.managementItemDesc}>Quét QR code để check-in người tham gia</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
                        </TouchableOpacity>
                    </View>

                    {/* Event Details */}
                    <View style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Thông tin sự kiện</Text>
                        
                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <Ionicons name="time-outline" size={18} color="#5669FF" style={styles.infoIcon} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Thời gian</Text>
                                    <Text style={styles.infoText}>Bắt đầu: {formatDate(event.timeStart)}</Text>
                                    <Text style={styles.infoText}>Kết thúc: {formatDate(event.timeEnd)}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="location-outline" size={18} color="#5669FF" style={styles.infoIcon} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Địa điểm</Text>
                                    <Text style={styles.infoText}>{event.location}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="ticket-outline" size={18} color="#5669FF" style={styles.infoIcon} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Thông tin vé</Text>
                                    <Text style={styles.infoText}>Giá: {event.ticketPrice}</Text>
                                    <Text style={styles.infoText}>Tổng số lượng: {event.ticketQuantity}</Text>
                                    <Text style={styles.infoText}>Còn lại: {event.ticketQuantity - eventStats.totalTicketsSold}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mô tả</Text>
                        <Text style={styles.description}>{event.description}</Text>
                    </View>

                    {/* Tags */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thể loại</Text>
                        <View style={styles.tagContainer}>
                            {event.tags.map((tag, index) => (
                                <Text key={index} style={styles.tag}>{tag}</Text>
                            ))}
                        </View>
                    </View>

                    {/* Images */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hình ảnh</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.imagesScroll}
                        >
                            {event.images.map((img, i) => (
                                <Image key={i} source={{ uri: img }} style={styles.image} />
                            ))}
                        </ScrollView>
                    </View>

                    
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    errorContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    error: {
        textAlign: 'center',
        marginTop: 20,
        color: '#e03131',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    moreButton: {
        padding: 10,
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    bannerContainer: {
        position: 'relative',
        height: 200,
    },
    banner: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    statusBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    contentContainer: {
        padding: 16,
        marginTop: -30,
    },
    eventHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: '#fff',
        backgroundColor: '#fff',
    },
    eventTitleContainer: {
        flex: 1,
        marginLeft: 16,
        marginTop: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    eventId: {
        fontSize: 12,
        color: '#666',
    },
    
    // Quick Stats
    quickStatsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
    
    // Progress
    progressContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    progressPercentage: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#5669FF',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E5E5',
        borderRadius: 4,
        marginBottom: 8,
    },
    progressFill: {
        height: 8,
        backgroundColor: '#5669FF',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    
    // Quick Actions
    quickActionsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12,
    },
    secondaryAction: {
        flex: 1,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#5669FF',
    },
    secondaryActionText: {
        color: '#5669FF',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    
    // Management Section
    managementSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    managementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    managementItemContent: {
        flex: 1,
        marginLeft: 12,
    },
    managementItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    managementItemDesc: {
        fontSize: 12,
        color: '#666',
    },
    
    // Details Section
    detailsSection: {
        marginBottom: 20,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    infoIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#333',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    
    // Other sections
    section: {
        marginBottom: 20,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#E8F5E8',
        color: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        fontSize: 13,
        fontWeight: '500',
    },
    imagesScroll: {
        marginTop: 8,
    },
    image: {
        width: 160,
        height: 120,
        borderRadius: 10,
        marginRight: 12,
    },
});

export default EventDetailOrganizer;