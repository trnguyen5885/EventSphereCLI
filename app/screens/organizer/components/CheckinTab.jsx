import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CircularProgress from './CircularProgress';
import { appColors } from '../../../constants/appColors';
import { styles } from './EventDetailStyles';
import AxiosInstance from '../../../services/api/AxiosInstance';

const CheckinTab = ({ eventData }) => {
    const [ticketStats, setTicketStats] = useState({ used: 0, issued: 1 });
    const soldTickets = eventData?.soldTickets || 0;

    useEffect(() => {
        if (!eventData?._id) return;
        console.log('Fetching ticket count for event:', eventData._id);


        const fetchTicketCount = async () => {
            try {
                const api = AxiosInstance();
                const res = await api.get(`tickets/count/${eventData._id}`);
                if (res.data) {
                    console.log('Ticket count fetched successfully:', res.data);

                    setTicketStats(res.data);
                }
            } catch (err) {
                console.error('Error fetching ticket count:', err);
            }
        };

        fetchTicketCount();
    }, [eventData?._id]);


    const { used, issued } = ticketStats;
    const checkinPercentage = soldTickets > 0 ? Math.round((used / soldTickets) * 100) : 0;

    const renderCheckinSummary = () => (
        <View style={styles.checkinSummary}>
            <View style={styles.summaryRow}>
                <View style={styles.summaryInfo}>
                    <Text style={styles.summaryLabel}>Đã check-in</Text>
                    <Text style={styles.summaryValue}>{used} vé</Text>
                    <Text style={styles.summaryTotal}>Tổng số vé {soldTickets}</Text>
                </View>
                <CircularProgress percentage={checkinPercentage} color={appColors.primary} />
            </View>
        </View>
    );

    const renderTicketDetails = () => {
        if (eventData?.typeBase === 'none') {
            return (
                <Text style={[styles.sectionTitle, { color: 'gray', textAlign: 'center', marginTop: 20 }]}>Sự kiện này không có thông tin vé để check-in</Text>
            );
        }

        if (eventData?.showtimes?.length === 0) {
            return (
                <Text style={[styles.sectionTitle, { color: 'gray', textAlign: 'center', marginTop: 20 }]}>Sự kiện chưa có suất chiếu cụ thể</Text>
            );
        }

        return (
            <>
                <Text style={styles.sectionTitle}>Suất chiếu</Text>
                {eventData.showtimes.map((showtime, index) => {
                    const sold = showtime.soldTickets || 0;
                    const total = showtime.totalTickets || 1;
                    const percent = Math.round((sold / total) * 100);

                    return (
                        <View key={showtime._id} style={styles.ticketTypeCard}>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryInfo}>
                                    <Text style={styles.ticketTypeName}>Suất #{index + 1}</Text>
                                    <Text style={styles.summaryValue}>{sold} vé</Text>
                                    <Text style={styles.summaryTotal}>Tổng: {total}</Text>
                                </View>
                                <CircularProgress percentage={percent} color={appColors.primary} size={60} />
                            </View>
                        </View>
                    );
                })}
            </>
        );
    };

    return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {renderCheckinSummary()}
            {renderTicketDetails()}
        </ScrollView>
    );
};

export default CheckinTab;
