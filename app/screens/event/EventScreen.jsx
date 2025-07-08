import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, Image, RefreshControl } from 'react-native'
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react';
import { AxiosInstance } from '../../services';
import { TextComponent } from '../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

const UserTicketsScreen = ({navigation, route}) => {
    const [userData, setUserData] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // Thêm state cho pull-to-refresh
    const userId = useSelector(state => state.auth.userId);
    const [statusTab, setStatusTab] = useState('all'); // all, success, processing, canceled
    const [timeTab, setTimeTab] = useState('upcoming'); // upcoming, ongoing, ended
    const suggestedEvents = [
        {
            _id: 'suggest1',
            name: 'YÊN ẤM MERCHANDISE',
            image: 'https://res.cloudinary.com/deoqppiun/image/upload/v1750255690/ol5cbr0aoexpj06vvqwd.jpg',
        },
        {
            _id: 'suggest2',
            name: 'PHẬT BẢO NGHIÊM TRẬN - TRIỂN LÃM',
            image: 'https://res.cloudinary.com/deoqppiun/image/upload/v1750846407/p5uul3jpk2ob6koenkm7.png',
        },
    ];

    // Tách logic gọi API thành function riêng để dùng chung
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
            
            // Gọi API detail cho từng event để lấy timeStart và timeEnd
            const eventsWithDetails = await Promise.all(
                eventsData.map(async (event) => {
                    try {
                        const eventDetail = await AxiosInstance().get(`/events/detail/${event._id}`);
                        return {
                            ...event,
                            timeStart: eventDetail.data.data.timeStart,
                            timeEnd: eventDetail.data.data.timeEnd,
                            showtimes: eventDetail.data.data.showtimes || []
                        };
                    } catch (error) {
                        console.log(`Lỗi khi lấy chi tiết sự kiện ${event._id}:`, error);
                        return event; // Trả về event gốc nếu có lỗi
                    }
                })
            );
            
            setEvents(eventsWithDetails);
        } catch (e) {
            console.log("Lấy vé thất bại: ", e);
        } finally {
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

    // Hàm xử lý pull-to-refresh
    const onRefresh = () => {
        fetchTickets(true);
    };

    // Lọc vé theo tab
    const now = Date.now();
    const filteredEvents = events.filter(event => {
        let statusMatch = statusTab === 'all' || event.status === statusTab;
        let timeMatch = true;
        
        if (event.timeStart && event.timeEnd) {
            const startTime = typeof event.timeStart === 'number' ? event.timeStart : new Date(event.timeStart).getTime();
            const endTime = typeof event.timeEnd === 'number' ? event.timeEnd : new Date(event.timeEnd).getTime();
            
            switch (timeTab) {
                case 'upcoming':
                    timeMatch = startTime > now;
                    break;
                case 'ongoing':
                    timeMatch = startTime <= now && endTime > now;
                    break;
                case 'ended':
                    timeMatch = endTime <= now;
                    break;
                default:
                    timeMatch = true;
            }
        } else if (event.timeEnd) {
            // Fallback cho trường hợp chỉ có timeEnd
            const endTime = typeof event.timeEnd === 'number' ? event.timeEnd : new Date(event.timeEnd).getTime();
            switch (timeTab) {
                case 'upcoming':
                    timeMatch = endTime > now;
                    break;
                case 'ongoing':
                    timeMatch = endTime > now;
                    break;
                case 'ended':
                    timeMatch = endTime <= now;
                    break;
                default:
                    timeMatch = true;
            }
        } else if (event.showtimes && event.showtimes.length > 0) {
            // Sử dụng showtimes nếu có
            const showtimesInRange = event.showtimes.filter(showtime => {
                const startTime = typeof showtime.startTime === 'number' ? showtime.startTime : new Date(showtime.startTime).getTime();
                const endTime = typeof showtime.endTime === 'number' ? showtime.endTime : new Date(showtime.endTime).getTime();
                
                switch (timeTab) {
                    case 'upcoming':
                        return startTime > now;
                    case 'ongoing':
                        return startTime <= now && endTime > now;
                    case 'ended':
                        return endTime <= now;
                    default:
                        return true;
                }
            });
            timeMatch = showtimesInRange.length > 0;
        }
        
        return statusMatch && timeMatch;
    });

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    // Component hiển thị khi không có vé
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

    // Hàm để lấy trạng thái event
    const getEventStatus = (event) => {
        const now = Date.now();
        
        if (event.timeStart && event.timeEnd) {
            const startTime = typeof event.timeStart === 'number' ? event.timeStart : new Date(event.timeStart).getTime();
            const endTime = typeof event.timeEnd === 'number' ? event.timeEnd : new Date(event.timeEnd).getTime();
            
            if (startTime > now) return 'upcoming';
            if (startTime <= now && endTime > now) return 'ongoing';
            if (endTime <= now) return 'ended';
        } else if (event.showtimes && event.showtimes.length > 0) {
            // Sử dụng showtimes để xác định status
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

    // Hàm để lấy badge status
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
            
            {/* Tab con */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 12 }}>
                {[
                    { label: 'Sắp diễn ra', value: 'upcoming' },
                    { label: 'Đang diễn ra', value: 'ongoing' },
                    { label: 'Đã kết thúc', value: 'ended' }
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.value}
                        style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderBottomWidth: 2,
                            borderBottomColor: timeTab === tab.value ? '#5669FF' : 'transparent',
                            marginHorizontal: 4,
                        }}
                        onPress={() => setTimeTab(tab.value)}
                    >
                        <Text style={{ 
                            color: timeTab === tab.value ? '#5669FF' : '#000', 
                            fontWeight: timeTab === tab.value ? 'bold' : 'normal', 
                            fontSize: 14 
                        }}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            {/* Danh sách vé hoặc gợi ý */}
            {filteredEvents.length === 0 ? (
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
                            colors={['#5669FF']} // Android
                            tintColor={'#5669FF'} // iOS
                            title="Đang tải lại..." // iOS
                            titleColor={'#5669FF'} // iOS
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        let eventDate = item.eventDate;
                        
                        // Ưu tiên lấy từ timeStart
                        if (!eventDate && item.timeStart) {
                            const startTime = typeof item.timeStart === 'number' ? item.timeStart : new Date(item.timeStart).getTime();
                            const date = new Date(startTime);
                            eventDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        }
                        
                        // Nếu không có timeStart, lấy từ showtime đầu tiên
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
                                    <Text style={styles.detailButtonText}>Xem chi tiết</Text>
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
        backgroundColor: '#007BFF',
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
    // Styles cho empty state
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