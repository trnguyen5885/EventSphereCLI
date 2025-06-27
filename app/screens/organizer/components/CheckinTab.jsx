import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CircularProgress from './CircularProgress';
import { appColors } from '../../../constants/appColors';
import { styles } from './EventDetailStyles';

const CheckinTab = ({ eventData }) => {
    const totalTickets = eventData?.totalTicketsEvent || 1;
    const soldTickets = eventData?.soldTickets || 0;
    const checkedInTickets = Math.floor(soldTickets * 0.87); // 87% đã check-in
    const leftTickets = soldTickets - checkedInTickets;

    const checkinPercentage = soldTickets > 0 ? Math.round((checkedInTickets / soldTickets) * 100) : 0;

    // Dữ liệu mẫu cho loại vé
    const ticketTypes = [
        {
            id: 1,
            name: 'Ticket Type 1',
            sold: 250,
            total: 280,
            percentage: 87
        },
        {
            id: 2,
            name: 'Ticket Type 2',
            sold: 180,
            total: 200,
            percentage: 90
        }
    ];

    const renderEventStats = () => (
        <View style={styles.eventStats}>
            <View style={styles.statItem}>
                <Ionicons name="people" size={24} color="#3B82F6" />
                <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>Trong sự kiện</Text>
                    <Text style={styles.statValue}>1.200</Text>
                </View>
            </View>

            <View style={styles.statItem}>
                <MaterialIcons name="exit-to-app" size={24} color="#EF4444" />
                <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>Đã ra ngoài</Text>
                    <Text style={styles.statValue}>35</Text>
                </View>
            </View>
        </View>
    );

    const renderTicketTypes = () => (
        <>
            <Text style={styles.sectionTitle}>Chi tiết</Text>
            {ticketTypes.map((ticket) => (
                <View key={ticket.id} style={styles.ticketTypeCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryInfo}>
                            <Text style={styles.ticketTypeName}>{ticket.name}</Text>
                            <Text style={styles.summaryValue}>{ticket.sold} vé</Text>
                            <Text style={styles.summaryTotal}>Đã bán {ticket.total}</Text>
                        </View>
                        <CircularProgress percentage={ticket.percentage} color={appColors.primary} size={60} />
                    </View>
                </View>
            ))}
        </>
    );

    return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.checkinButtons}>
                <TouchableOpacity style={[styles.checkinButton, styles.activeCheckinButton]}>
                    <Text style={[styles.checkinButtonText, styles.activeCheckinButtonText]}>Check-in</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkinButton}>
                    <Text style={styles.checkinButtonText}>Redeem</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.checkinSummary}>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryInfo}>
                        <Text style={styles.summaryLabel}>Đã check-in</Text>
                        <Text style={styles.summaryValue}>{checkedInTickets} vé</Text>
                        <Text style={styles.summaryTotal}>Đã bán {soldTickets}</Text>
                    </View>
                    <CircularProgress percentage={checkinPercentage} color={appColors.primary} />
                </View>
            </View>

            {renderEventStats()}
            {renderTicketTypes()}
        </ScrollView>
    );
};

export default CheckinTab;