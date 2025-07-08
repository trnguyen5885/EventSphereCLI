import { RowComponent } from '../../components';
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { appColors } from '../../constants/appColors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ListTicket = ({ navigation, route }) => {
    const { event, user } = route.params;
    const tickets = event?.tickets || [];

    const handleNavigation = () => {
        navigation.goBack();
    };

    return (
        <ScrollView
        showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.headerRow, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleNavigation}
                        >
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Thông tin vé của tôi</Text>
                        <View style={{ width: 26 }} />
                    </View>

                </View>
                <View style={styles.recipientInfo}>
                    <Text style={styles.recipientHeader}>Thông tin người nhận</Text>
                    <View style={styles.recipientDetail}>
                        <Text>Họ và tên</Text>
                        <Text>{user.username}</Text>
                    </View>
                    <View style={styles.recipientDetail}>
                        <Text>Số điện thoại</Text>
                        <Text>{user.phoneNumber || 'N/A'}</Text>
                    </View>
                    <View style={styles.recipientDetail}>
                        <Text>Email</Text>
                        <Text>{user.email}</Text>
                    </View>
                </View>
                {tickets.map((ticket, idx) => (
                    <View style={styles.ticket} key={ticket._id || idx}>
                        <Text style={styles.cinemaName}>{event.location}</Text>
                        <Text style={styles.movieTitle}>{event.name}</Text>
                        <Image
                            source={{ uri: event.avatar }}
                            style={styles.movieImage}
                            resizeMode="cover"
                        />
                        <RowComponent justify="space-between" styles={{ width: '100%', alignItems: 'flex-start' }}>
                            <View>
                                <Text style={styles.ticketCodeLabel}>Mã đặt vé:</Text>
                                <Text style={styles.ticketCode}>{ticket.ticketId || 'N/A'}</Text>
                                <Text style={styles.timeLabel}>Thời gian bắt đầu:</Text>
                                <Text style={styles.time}>
                                    {ticket.showtimeId?.startTime
                                        ? new Date(ticket.showtimeId.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : '--:--'}
                                </Text>
                                <Text style={styles.date}>
                                    {ticket.showtimeId?.startTime
                                        ? new Date(ticket.showtimeId.startTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                        : 'N/A'}
                                </Text>
                                <Text style={styles.timeLabel}>Thời gian kết thúc:</Text>
                                <Text style={styles.time}>
                                    {ticket.showtimeId?.endTime
                                        ? new Date(ticket.showtimeId.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : '--:--'}
                                </Text>
                                <Text style={styles.date}>
                                    {ticket.showtimeId?.endTime
                                        ? new Date(ticket.showtimeId.endTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                        : 'N/A'}
                                </Text>
                            </View>
                            <View>
                                {/* Hiển thị QR code base64 hoặc url */}
                                {ticket.qrCode && ticket.qrCode.startsWith('data:image') ? (
                                    <Image
                                        source={{ uri: ticket.qrCode }}
                                        style={styles.qrCode}
                                    />
                                ) : (
                                    <View style={[styles.qrCode, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text>Không có mã QR</Text>
                                    </View>
                                )}
                            </View>
                        </RowComponent>
                        <View style={styles.details}>
                            <Text>Số vé: {ticket.ticketNumber || 'N/A'}</Text>
                            {event.typeBase === 'seat' ? (
                                <Text>Số ghế: {ticket.seat?.seatName || ticket.seat?._id || 'N/A'}</Text>
                            ) : (
                                <Text>Khu vực: {ticket.zone?.zoneName || 'N/A'}</Text>
                            )}
                        </View>
                        <Text style={styles.instruction}>
                            Đưa mã này cho nhân viên soát vé để nhận vé vào sự kiện
                        </Text>
                        <View style={{
                            height: 1,
                            backgroundColor: '#E2E8F0',
                            width: '100%',
                            alignSelf: 'stretch',
                            marginVertical: 12,
                        }} />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: appColors.primary,
        paddingTop: Platform.OS === 'ios' ? 30 : 10,
        paddingBottom: 15,
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRow: {
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    ticket: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    cinemaName: {
        fontSize: 12,
    },
    movieTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
    },
    movieImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10
    },
    ticketCodeLabel: {
        marginTop: 10,
        fontSize: 20,
        color: '#888',
    },
    ticketCode: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    timeLabel: {
        fontSize: 14,
        color: '#888',
    },
    time: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e91e63',
    },
    date: {
        fontSize: 16,
        marginVertical: 4,
    },
    instruction: {
        fontSize: 12,
        color: '#888',
        marginVertical: 8,
        textAlign: 'center',
    },
    details: {
        marginVertical: 8,
    },
    qrCode: {
        width: 160,
        height: 160,
        marginTop: 12,
        borderRadius: 8
    },
    recipientInfo: {
        marginVertical: 20,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    recipientHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    recipientDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
});

export default ListTicket;
