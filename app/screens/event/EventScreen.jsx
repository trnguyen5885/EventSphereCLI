import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, Image, RefreshControl, Animated, TextInput } from 'react-native'
import React from 'react'
import { useState } from 'react'
import { useEffect, useRef } from 'react';
import { AxiosInstance } from '../../services';
import { InputComponent, TextComponent } from '../../components';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../../constants/appColors';

// Skeleton Placeholder Component
const SkeletonPlaceholder = ({ width, height, borderRadius = 8, style, showIcon = false }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const animationRef = useRef(null);

    useEffect(() => {
        const animate = () => {
            animationRef.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 800, // Giảm từ 1000ms xuống 800ms
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 800, // Giảm từ 1000ms xuống 800ms
                        useNativeDriver: false,
                    }),
                ])
            );
            animationRef.current.start();
        };
        animate();

        // Cleanup animation khi component unmount
        return () => {
            if (animationRef.current) {
                animationRef.current.stop();
            }
        };
    }, []);

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#E1E9EE', '#F2F8FC'],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    backgroundColor,
                    borderRadius,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                style,
            ]}
        >
            {showIcon && (
                <Animated.Image
                    source={require('../../../assets/images/icon.png')}
                    style={{
                        width: 28,
                        height: 28,
                        opacity: 0.2,
                        resizeMode: 'contain',
                    }}
                />
            )}
        </Animated.View>
    );
};


// Skeleton Card Component
const SkeletonTicketCard = () => (
    <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Avatar skeleton: có icon */}
            <SkeletonPlaceholder width={60} height={60} borderRadius={8} showIcon />

            <View style={{ flex: 1, marginLeft: 12 }}>
                {/* Các dòng text: không icon */}
                <SkeletonPlaceholder width="80%" height={16} style={{ marginBottom: 8 }} />
                <SkeletonPlaceholder width={80} height={20} borderRadius={12} style={{ marginBottom: 8 }} />
                <SkeletonPlaceholder width="60%" height={14} style={{ marginBottom: 4 }} />
                <SkeletonPlaceholder width="50%" height={14} style={{ marginBottom: 4 }} />
                <SkeletonPlaceholder width="40%" height={14} />
            </View>
        </View>

        {/* Button skeleton: không icon */}
        <SkeletonPlaceholder width="100%" height={40} borderRadius={6} style={{ marginTop: 14 }} />
    </View>
);


// Skeleton Loading Component
const SkeletonLoading = () => (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f5f5f5" }}>
        {[1, 2, 3, 4, 5].map((_, index) => (
            <SkeletonTicketCard key={index} />
        ))}
    </View>
);

const UserTicketsScreen = ({ navigation, route }) => {
    const [userData, setUserData] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const userId = useSelector(state => state.auth.userId);
    const [statusTab, setStatusTab] = useState('upcoming');
    const [searchText, setSearchText] = useState('');
    const [expandedOrders, setExpandedOrders] = useState({});

    const toggleOrderInfo = (eventId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [eventId]: !prev[eventId]
        }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOrderStatusText = (status) => {
        switch (status) {
            case 'paid':
                return { text: 'Đã thanh toán', color: '#4CAF50', backgroundColor: '#E8F5E8' };
            case 'pending':
                return { text: 'Chờ thanh toán', color: '#FFA500', backgroundColor: '#FFF3E0' };
            case 'cancelled':
                return { text: 'Đã hủy', color: '#F44336', backgroundColor: '#FFEBEE' };
            default:
                return { text: 'Không xác định', color: '#9E9E9E', backgroundColor: '#F5F5F5' };
        }
    };

    const fetchTickets = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await AxiosInstance().get(`/tickets/grouped/${userId}`);
            
            // Check if response.data is an array directly or wrapped in status/data
            let dataArray = [];
            
            if (Array.isArray(response.data)) {
                // API returns array directly
                dataArray = response.data;
            } else if (response.data.status && response.data.data && Array.isArray(response.data.data)) {
                // API returns wrapped in status/data object
                dataArray = response.data.data;
            } else {
                dataArray = [];
            }
            
            if (dataArray.length > 0) {
                // Process the grouped tickets data
                const groupedEvents = dataArray.map(item => ({
                    _id: item.eventId,
                    name: item.eventName,
                    avatar: item.eventAvatar,
                    location: item.eventLocation,
                    showtime: item.showtime,
                    order: item.order,
                    tickets: item.tickets,
                    // For backward compatibility
                    timeStart: item.showtime?.startTime,
                    timeEnd: item.showtime?.endTime
                }));

                setEvents(groupedEvents);
            } else {
                setEvents([]);
            }

            // Set loading state after updating data
            if (isRefresh) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        } catch (e) {
            console.log("Lấy vé thất bại: ", e);
            setEvents([]);
            // Set loading state when error occurs
            if (isRefresh) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const onRefresh = () => {
        fetchTickets(true);
    };

    const getEventStatus = (event) => {
        const now = Date.now();

        // Only use showtime data for status determination
        if (event.showtime && event.showtime.startTime && event.showtime.endTime) {
            const startTime = typeof event.showtime.startTime === 'number' ? 
                event.showtime.startTime : new Date(event.showtime.startTime).getTime();
            const endTime = typeof event.showtime.endTime === 'number' ? 
                event.showtime.endTime : new Date(event.showtime.endTime).getTime();

            // Event hasn't started yet
            if (now < startTime) {
                return 'upcoming';
            }
            // Event is currently happening
            else if (now >= startTime && now < endTime) {
                return 'ongoing';
            }
            // Event has ended
            else if (now >= endTime) {
                return 'ended';
            }
        }

        // If showtime data is incomplete or missing, return unknown
        return 'unknown';
    };

    const getStatusBadge = (event) => {
        const status = getEventStatus(event);
        switch (status) {
            case 'upcoming':
                return { text: 'Sắp diễn ra', color: '#FFA500', backgroundColor: '#FFF3E0' };
            case 'ongoing':
                return { text: 'Đang diễn ra', color: '#4CAF50', backgroundColor: '#E8F5E8' };
            case 'ended':
                return { text: 'Đã kết thúc', color: '#9E9E9E', backgroundColor: '#F5F5F5' };
            case 'unknown':
            default:
                return { text: 'Không xác định', color: '#FF6B6B', backgroundColor: '#FFEBEE' };
        }
    };

    const filteredEvents = events.filter(event => {
        // Filter by search text first
        const matchesSearch = (event.name || '').toLowerCase().includes((searchText || '').toLowerCase());
        
        // Filter by status tab
        const status = getEventStatus(event);
        
        let matchesStatus = false;
        
        if (statusTab === 'upcoming') {
            matchesStatus = status === 'upcoming' || status === 'ongoing';
        } else if (statusTab === 'ended') {
            matchesStatus = status === 'ended';
        }
        
        // If status is 'unknown', show it in 'upcoming' tab by default
        if (status === 'unknown' && statusTab === 'upcoming') {
            matchesStatus = true;
        }
        
        return matchesSearch && matchesStatus;
    });


    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <Image
                source={require('../../../assets/images/icon.png')}
                style={styles.emptyIcon}
                resizeMode="contain"
            />
            <Text style={styles.emptyText}>Bạn chưa có vé nào cả!</Text>
            <TouchableOpacity
                style={styles.buyTicketButton}
                onPress={() => navigation.jumpTo('Khám phá')}
                activeOpacity={0.8}
            >
                <Text style={styles.buyTicketButtonText}>Mua vé ngay</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{ flex: 1, padding: 0, backgroundColor: "#f5f5f5" }}>
            {/* Header */}
            <View style={{ backgroundColor: '#5669FF', paddingTop: 20, paddingBottom: 16, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Vé của tôi</Text>
            </View>

            {/* Tab Selector - Right under header */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, statusTab === 'upcoming' && styles.activeTab]}
                    onPress={() => setStatusTab('upcoming')}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.tabText, statusTab === 'upcoming' && styles.activeTabText]}>
                        Sắp diễn ra
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, statusTab === 'ended' && styles.activeTab]}
                    onPress={() => setStatusTab('ended')}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.tabText, statusTab === 'ended' && styles.activeTabText]}>
                        Kết thúc
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 16, paddingTop: 10, backgroundColor: '#fff' }}>
                <InputComponent
                    value={searchText}
                    onChange={text => setSearchText(text)}
                    placeholder="Nhập vé cần tìm..."
                    allowClear
                    customStyles={{ minHeight: 46 }}
                    affix={<MaterialIcons name="search" size={24} color="rgba(0,0,0,0.5)" />}
                />
            </View>

            {/* Skeleton Loading hoặc Content */}
            {loading ? (
                <SkeletonLoading />
            ) : filteredEvents.length === 0 ? (
                <EmptyState />
            ) : (
                <FlatList
                    data={filteredEvents}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#5669FF']}
                            tintColor={'#5669FF'}
                            title="Đang tải lại..."
                            titleColor={'#5669FF'}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        let eventDate = '';

                        // Calculate event date from showtime
                        if (item.showtime && item.showtime.startTime) {
                            const startTime = typeof item.showtime.startTime === 'number' ? 
                                item.showtime.startTime : new Date(item.showtime.startTime).getTime();
                            const date = new Date(startTime);
                            eventDate = date.toLocaleDateString('vi-VN', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric' 
                            });
                        }

                        const statusBadge = getStatusBadge(item);

                        return (
                            <View style={styles.card}>
                                {/* Order Information Section - At top */}
                                {item.order && (
                                    <View style={styles.orderInfoContainer}>
                                        <TouchableOpacity
                                            style={styles.orderInfoHeader}
                                            onPress={() => toggleOrderInfo(item._id)}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.orderInfoHeaderLeft}>
                                                <Text style={styles.orderInfoTitle}>
                                                    Thông tin đơn hàng
                                                </Text>
                                            </View>
                                            <MaterialIcons
                                                name={expandedOrders[item._id] ? "expand_less" : "expand_more"}
                                                size={24}
                                                color="#5669FF"
                                            />
                                        </TouchableOpacity>
                                        {expandedOrders[item._id] && (
                                            <View style={styles.orderInfoContent}>
                                                <View style={styles.orderInfoRow}>
                                                    <Text style={styles.orderInfoLabel}>Tổng tiền:</Text>
                                                    <Text style={[styles.orderInfoValue, styles.priceText]}>
                                                        {item.order.totalPrice.toLocaleString('vi-VN')} VNĐ
                                                    </Text>
                                                </View>
                                                <View style={styles.orderInfoRow}>
                                                    <Text style={styles.orderInfoLabel}>Trạng thái:</Text>
                                                    <View style={[styles.statusBadge, { 
                                                        backgroundColor: getOrderStatusText(item.order.status).backgroundColor 
                                                    }]}>
                                                        <Text style={[styles.statusText, { 
                                                            color: getOrderStatusText(item.order.status).color 
                                                        }]}>
                                                            {getOrderStatusText(item.order.status).text}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View style={styles.orderInfoRow}>
                                                    <Text style={styles.orderInfoLabel}>Ngày tạo:</Text>
                                                    <Text style={styles.orderInfoValue}>{formatDate(item.order.createdAt)}</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Event Information Section */}
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {item.avatar && (
                                        <Image
                                            source={{ uri: item.avatar }}
                                            style={styles.avatar}
                                            resizeMode="cover"
                                        />
                                    )}
                                    <View style={{ flex: 1, marginLeft: item.avatar ? 12 : 0 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                            <Text style={styles.eventName} numberOfLines={2}>{item.name}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: statusBadge.backgroundColor }]}>
                                            <Text style={[styles.statusText, { color: statusBadge.color }]}>
                                                {statusBadge.text}
                                            </Text>
                                        </View>
                                        <Text style={styles.ticketCount}>
                                            🎟 Số vé: {item.tickets ? item.tickets.quantity : 0}
                                        </Text>
                                        {eventDate && (
                                            <Text style={styles.eventDate}>📅 {eventDate}</Text>
                                        )}
                                        {item.location && (
                                            <Text style={styles.eventLocation} numberOfLines={1}>
                                                📍 {item.location}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.detailButton}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate("ListTicket", { 
                                        event: item, 
                                        user: userData,
                                        groupedTicket: true,
                                        userId: userId,
                                        eventId: item._id,
                                        showtimeId: item.showtime?.id,
                                    })}
                                >
                                    <Text style={styles.detailButtonText}>Xem thông tin vé</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    )
}

export default UserTicketsScreen

const styles = StyleSheet.create({
    card: {
        padding: 16,
        backgroundColor: 'white',
        marginBottom: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    eventName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 2,
        flex: 1,
    },
    eventDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    eventLocation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    orderInfo: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
        marginBottom: 2,
    },
    ticketCount: {
        fontSize: 14,
        color: '#888',
        marginBottom: 4,
    },
    showtimeCount: {
        fontSize: 14,
        color: '#888',
        marginBottom: 2,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    detailButton: {
        marginTop: 14,
        paddingVertical: 10,
        backgroundColor: appColors.primary,
        borderRadius: 6,
        alignItems: 'center',
        shadowColor: '#007BFF',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
        elevation: 1,
    },
    detailButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        letterSpacing: 0.5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 120,
        height: 120,
        opacity: 0.3,
        marginBottom: 24,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        fontWeight: '500',
    },
    buyTicketButton: {
        backgroundColor: '#5669FF',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 25,
        shadowColor: '#5669FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buyTicketButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#5669FF',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    tabButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
        alignItems: 'center',
    },
    activeTab: {
        borderBottomColor: '#fff',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
    },
    activeTabText: {
        color: '#fff',
    },
    orderInfoContainer: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 12,
    },
    orderInfoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    orderInfoHeaderLeft: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    orderInfoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    orderPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5669FF',
    },
    orderInfoContent: {
        paddingHorizontal: 4,
        paddingBottom: 10,
    },
    orderInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    orderInfoLabel: {
        fontSize: 13,
        color: '#555',
        fontWeight: '500',
    },
    orderInfoValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
    },
    priceText: {
        color: '#5669FF',
    },
})