import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, Image, RefreshControl, Animated, TextInput } from 'react-native'
import React from 'react'
import { useState } from 'react'
import { useEffect, useRef } from 'react';
import { AxiosInstance } from '../../services';
import { InputComponent, TextComponent } from '../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
    const [statusTab, setStatusTab] = useState('all');
    const [searchText, setSearchText] = useState('');

    const fetchTickets = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const tickets = await AxiosInstance().get(`/tickets/getTicket/${userId}`);
            setUserData(tickets.data.user);
            const eventsData = tickets.data.events;
            console.log("Tickets data:", tickets.data);

            const eventsWithDetails = await Promise.all(
                eventsData.map(async (event) => {
                    try {
                        const eventDetail = await AxiosInstance().get(`/events/detail/${event._id}`);
                        return {
                            ...event,
                            timeStart: eventDetail.data.timeStart,
                            timeEnd: eventDetail.data.timeEnd,
                            showtimes: eventDetail.data.showtimes || []
                        };
                    } catch (error) {
                        console.log(`Lỗi khi lấy chi tiết sự kiện ${event._id}:`, error);
                        return event;
                    }
                })
            );

            // Update state ngay khi có data
            setEvents(eventsWithDetails);

            // Set loading state ngay sau khi update data
            if (isRefresh) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        } catch (e) {
            console.log("Lấy vé thất bại: ", e);
            // Set loading state ngay khi có lỗi
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

    const now = Date.now();
    const filteredEvents = events.filter(event =>
        (event.name || '').toLowerCase().includes((searchText || '').toLowerCase())
    );



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

    const getEventStatus = (event) => {
        const now = Date.now();

        if (event.timeStart && event.timeEnd) {
            const startTime = typeof event.timeStart === 'number' ? event.timeStart : new Date(event.timeStart).getTime();
            const endTime = typeof event.timeEnd === 'number' ? event.timeEnd : new Date(event.timeEnd).getTime();

            if (startTime > now) return 'upcoming';
            if (startTime <= now && endTime > now) return 'ongoing';
            if (endTime <= now) return 'ended';
        } else if (event.showtimes && event.showtimes.length > 0) {
            const hasUpcoming = event.showtimes.some(showtime => {
                const startTime = typeof showtime.startTime === 'number' ? showtime.startTime : new Date(showtime.startTime).getTime();
                return startTime > now;
            });

            const hasOngoing = event.showtimes.some(showtime => {
                const startTime = typeof showtime.startTime === 'number' ? showtime.startTime : new Date(showtime.startTime).getTime();
                const endTime = typeof showtime.endTime === 'number' ? showtime.endTime : new Date(showtime.endTime).getTime();
                return startTime <= now && endTime > now;
            });

            if (hasOngoing) return 'ongoing';
            if (hasUpcoming) return 'upcoming';
            return 'ended';
        }

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
            default:
                return { text: 'Chưa xác định', color: '#757575', backgroundColor: '#EEEEEE' };
        }
    };

    return (
        <View style={{ flex: 1, padding: 0, backgroundColor: "#f5f5f5" }}>
            {/* Header */}
            <View style={{ backgroundColor: '#5669FF', paddingTop: 20, paddingBottom: 16, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Vé của tôi</Text>
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
                        let eventDate = item.eventDate;

                        if (!eventDate && item.timeStart) {
                            const startTime = typeof item.timeStart === 'number' ? item.timeStart : new Date(item.timeStart).getTime();
                            const date = new Date(startTime);
                            eventDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        }

                        if (!eventDate && item.showtimes && item.showtimes.length > 0) {
                            const firstShowtime = item.showtimes[0];
                            const startTime = typeof firstShowtime.startTime === 'number' ? firstShowtime.startTime : new Date(firstShowtime.startTime).getTime();
                            const date = new Date(startTime);
                            eventDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        }

                        const statusBadge = getStatusBadge(item);

                        return (
                            <View style={styles.card}>
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
                                        <Text style={styles.ticketCount}>🎟 Số vé: {item.tickets ? item.tickets.length : 0}</Text>
                                        {eventDate && (
                                            <Text style={styles.eventDate}>📅 {eventDate}</Text>
                                        )}
                                        {item.showtimes && item.showtimes.length > 0 && (
                                            <Text style={styles.showtimeCount}>⏰ Có {item.showtimes.length} suất chiếu</Text>
                                        )}
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.detailButton}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate("ListTicket", { event: item, user: userData })}
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
        backgroundColor: '#5669FF',
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
})