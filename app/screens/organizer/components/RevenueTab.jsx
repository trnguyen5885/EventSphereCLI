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

    // Dữ liệu mẫu cho biểu đồ cột
    const chartData = [
        { day: '20Th10', revenue: 30000000, tickets: 300 },
        { day: '21', revenue: 75000000, tickets: 450 },
        { day: '22', revenue: 45000000, tickets: 350 },
        { day: '23', revenue: 90000000, tickets: 600 },
        { day: '24', revenue: 120000000, tickets: 700 },
        { day: '25', revenue: 65000000, tickets: 400 },
        { day: '26Th10', revenue: 20000000, tickets: 150 },
    ];

    const renderChart = () => {
        return (
            <View style={styles.chart}>
                {chartData.map((item, index) => {
                    const maxRevenue = Math.max(...chartData.map(d => d.revenue));
                    const heightPercentage = (item.revenue / maxRevenue) * 100;

                    return (
                        <View key={index} style={styles.chartColumn}>
                            <View style={styles.chartBar}>
                                <View
                                    style={[
                                        styles.revenueBar,
                                        { height: `${heightPercentage}%`, backgroundColor: '#8B5CF6' }
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.ticketBar,
                                        { height: `${(item.tickets / 700) * 100}%`, backgroundColor: '#10B981' }
                                    ]}
                                />
                            </View>
                            <Text style={styles.chartLabel}>{item.day}</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

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

            <View style={styles.filterButtons}>
                <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
                    <Text style={[styles.filterButtonText, styles.activeFilterText]}>30 ngày</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                    <Text style={styles.filterButtonText}>24 giờ</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                            <Text style={styles.legendText}>Doanh thu: {formatCurrency(500000000)}</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                            <Text style={styles.legendText}>Vé bán: 700 vé</Text>
                        </View>
                    </View>
                </View>
                {renderChart()}
            </View>
        </ScrollView>
    );
};

export default RevenueTab;