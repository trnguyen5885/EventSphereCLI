import { RowComponent } from '../../components';
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const ListTicket = ({ navigation, route }) => {
    const { event, user } = route.params;
    const ticket = event?.tickets?.[0] || {};

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Thông tin vé sự kiện</Text>
            <View style={styles.ticket}>
                <Text style={styles.cinemaName}>{event.location}</Text>
                <Text style={styles.movieTitle}>{event.name}</Text>
                <Image
                    source={{ uri: event?.avatar }}
                    style={styles.movieImage}
                />
                <RowComponent justify={'space-between'} styles={{ width: '100%', alignItems: 'flex-start' }}>
                    <View>
                        <Text style={styles.ticketCodeLabel}>Mã đặt vé:</Text>
                        <Text style={styles.ticketCode}>{ticket.ticketNumber || 'N/A'}</Text>
                        <Text style={styles.timeLabel}>Thời gian bắt đầu:</Text>
                        <Text style={styles.time}>{new Date(event.timeStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        <Text style={styles.date}>{new Date(event.timeStart).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
                        <Text style={styles.timeLabel}>Thời gian kết thúc:</Text>
                        <Text style={styles.time}>{new Date(event.timeEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        <Text style={styles.date}>{new Date(event.timeEnd).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
                    </View>
                    <View>
                    <Image
                        source={{ uri: ticket.qrCode || '' }}
                        style={styles.qrCode}
                    />
                    </View>
                </RowComponent>
                <View style={styles.details}>
                    <Text>Số vé: {ticket.amount || 'N/A'}</Text>
                </View>
                <Text style={styles.instruction}>
                    Đưa mã này cho nhân viên soát vé để nhận vé vào sự kiện
                </Text>
            </View>
            <View style={styles.recipientInfo}>
                <Text style={styles.recipientHeader}>Thông tin người nhận</Text>
                <View style={styles.recipientDetail}>
                    <Text>Họ và tên</Text>
                    <Text>{user.username}</Text>
                </View>
                <View style={styles.recipientDetail}>
                    <Text>Số điện thoại</Text>
                    <Text>0349535063</Text>
                </View>
                <View style={styles.recipientDetail}>
                    <Text>Email</Text>
                    <Text>{user.email}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
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
        height: 150,
    },
    ticketCodeLabel: {
        marginTop: 10,
        fontSize: 20,
        color: '#888',
    },
    ticketCode: {
        fontSize: 24,
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
        width: 200,
        height: 200,
    },
    recipientInfo: {
        marginTop: 16,
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