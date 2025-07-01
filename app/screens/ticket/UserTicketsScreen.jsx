import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
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
    const userId = useSelector(state => state.auth.userId);
    const [statusTab, setStatusTab] = useState('all'); // all, success, processing, canceled
    const [timeTab, setTimeTab] = useState('upcoming'); // upcoming, ended
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

    useEffect(()=>{
        const getTickets = async() =>{
            try{
                const tickets = await AxiosInstance().get(`/tickets/getTicket/${userId}`);
                setUserData(tickets.data.user);
                setEvents(tickets.data.events);
                setLoading(false);
            }catch(e){
                console.log("Lấy vé thất bại: ", e);
            }
        };
        getTickets();
    }, []);

    // Lọc vé theo tab
    const now = Date.now();
    const filteredEvents = events.filter(event => {
        let statusMatch = statusTab === 'all' || event.status === statusTab;
        let timeMatch = true;
        if (event.timeEnd) {
            timeMatch = timeTab === 'upcoming' ? event.timeEnd > now : event.timeEnd <= now;
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
                onPress={() => navigation.navigate('Explore')}
                activeOpacity={0.8}
            >
                <Text style={styles.buyTicketButtonText}>Mua vé ngay</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{ flex: 1, padding: 0, backgroundColor: "#f5f5f5" }}>
            {/* Header */}
            <View style={{ backgroundColor: '#22c55e', paddingTop: 36, paddingBottom: 16, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Vé của tôi</Text>
                {/* Tab trạng thái */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18 }}>
                    {['Tất cả', 'Thành công', 'Đang xử lý', 'Đã hủy'].map((label, idx) => {
                        const value = ['all', 'success', 'processing', 'canceled'][idx];
                        return (
                            <TouchableOpacity
                                key={value}
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 18,
                                    borderRadius: 20,
                                    backgroundColor: statusTab === value ? '#fff' : '#22c55e',
                                    marginHorizontal: 4,
                                    borderWidth: 1,
                                    borderColor: statusTab === value ? '#22c55e' : '#22c55e',
                                }}
                                onPress={() => setStatusTab(value)}
                            >
                                <Text style={{ color: statusTab === value ? '#22c55e' : '#fff', fontWeight: 'bold' }}>{label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
            {/* Tab con */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', backgroundColor: '#000', paddingVertical: 12 }}>
                {['Sắp diễn ra', 'Đã kết thúc'].map((label, idx) => {
                    const value = ['upcoming', 'ended'][idx];
                    return (
                        <TouchableOpacity
                            key={value}
                            style={{
                                paddingVertical: 6,
                                paddingHorizontal: 18,
                                borderBottomWidth: 2,
                                borderBottomColor: timeTab === value ? '#22c55e' : 'transparent',
                                marginHorizontal: 8,
                            }}
                            onPress={() => setTimeTab(value)}
                        >
                            <Text style={{ color: timeTab === value ? '#22c55e' : '#fff', fontWeight: 'bold', fontSize: 16 }}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {/* Danh sách vé hoặc gợi ý */}
            {filteredEvents.length === 0 ? (
                <EmptyState />
            ) : (
                <FlatList
                    data={filteredEvents}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => {
                        let eventDate = item.eventDate;
                        if (!eventDate && item.timeStart) {
                            const date = new Date(item.timeStart);
                            eventDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        }
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
                                        <Text style={styles.eventName}>{item.name}</Text>
                                        <Text style={styles.ticketCount}>🎟 Số vé: {item.tickets.length}</Text>
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 2,
    },
    eventDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    ticketCount: {
        fontSize: 14,
        color: '#888',
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
        backgroundColor: '#f5f5f5',
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
        backgroundColor: '#22c55e',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 25,
        shadowColor: '#22c55e',
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