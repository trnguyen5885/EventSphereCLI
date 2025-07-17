import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import CircularProgress from './CircularProgress';
import { appColors } from '../../../constants/appColors';
import { styles } from './EventDetailStyles';

const RevenueTab = ({ eventData }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    };

    const totalRevenue = eventData?.eventTotalRevenue || 0;
    const totalTickets = eventData?.totalTicketsEvent || 1;
    const soldTickets = eventData?.soldTickets || 0;

    const revenuePercentage = totalTickets > 0 ? Math.round((totalRevenue / (totalTickets * 500000)) * 100) : 0;
    const ticketPercentage = totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0;


    return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryInfo}>
                            <Text style={styles.summaryLabel}>Doanh thu</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)}</Text>
                            <Text style={styles.summaryTotal}>Tổng: {formatCurrency(totalTickets * 500000)}</Text>
                        </View>
                        <CircularProgress percentage={revenuePercentage} color={appColors.primary} />
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryInfo}>
                            <Text style={styles.summaryLabel}>Số lượng vé đã bán</Text>
                            <Text style={styles.summaryValue}>{soldTickets} vé</Text>
                            <Text style={styles.summaryTotal}>Tổng: {totalTickets} vé</Text>
                        </View>
                        <CircularProgress percentage={ticketPercentage} color={appColors.primary} />
                    </View>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                            <Text style={styles.legendText}>Doanh thu: {formatCurrency(totalRevenue)}</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                            <Text style={styles.legendText}>Vé bán: {soldTickets}</Text>
                        </View>
                    </View>
                </View>
                
            </View>
        </ScrollView>
    );
};

export default RevenueTab;