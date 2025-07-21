import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import CircularProgress from './CircularProgress';
import { appColors } from '../../../constants/appColors';
import { styles } from './EventDetailStyles';
import AxiosInstance from '../../../services/api/AxiosInstance';

const RevenueTab = ({ eventData }) => {
    const [estimatedRevenue, setEstimatedRevenue] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
    };

    const totalRevenue = eventData?.eventTotalRevenue || 0;
    const totalTickets = eventData?.totalTicketsEvent || 1;
    const soldTickets = eventData?.soldTickets || 0;
    const eventId = eventData?._id;

    console.log('🎯 RevenueTab - eventId:', eventId);
    console.log('💰 RevenueTab - eventData:', {
        totalRevenue,
        totalTickets,
        soldTickets,
        eventName: eventData?.name
    });

    // Gọi API để lấy estimatedRevenue
    const fetchEstimatedRevenue = async () => {
        if (!eventId) {
            console.log('⚠️ RevenueTab - No eventId provided');
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            console.log('📡 RevenueTab - Fetching estimated revenue for eventId:', eventId);
            const api = AxiosInstance();
            const response = await api.get(`/events/getEstimatedRevenue/${eventId}`);
            
            console.log('📊 RevenueTab - API Response:', response);
            
            if (response.status) {
                setEstimatedRevenue(response.estimatedRevenue);
                console.log('✅ RevenueTab - Estimated revenue:', response.estimatedRevenue);
            } else {
                const errorMsg = 'Không thể lấy dữ liệu doanh thu dự kiến';
                setError(errorMsg);
                console.log('❌ RevenueTab - API returned false status:', response);
            }
        } catch (err) {
            console.error('❌ RevenueTab - Error fetching estimated revenue:', err);
            const errorMsg = err.response?.data?.message || 'Lỗi khi tải dữ liệu doanh thu dự kiến';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component mount hoặc eventId thay đổi
    useEffect(() => {
        if (eventId) {
            fetchEstimatedRevenue();
        }
    }, [eventId]);

    // Tính phần trăm doanh thu dựa trên estimatedRevenue
    const revenuePercentage = estimatedRevenue > 0 ? Math.min(100, Math.round((totalRevenue / estimatedRevenue) * 100)) : 0;
    const ticketPercentage = totalTickets > 0 ? Math.min(100, Math.round((soldTickets / totalTickets) * 100)) : 0;

    const renderEstimatedRevenue = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={appColors.primary} />
                    <Text style={styles.loadingText}>Đang tải doanh thu dự kiến...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchEstimatedRevenue} style={styles.retryButton}>
                        <Text style={styles.retryText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (estimatedRevenue !== null) {
            return (
                <Text style={styles.summaryTotal}>
                    Dự kiến: {formatCurrency(estimatedRevenue)}
                </Text>
            );
        }

        return (
            <Text style={styles.summaryTotal}>
                Dự kiến: Đang cập nhật...
            </Text>
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
                            {renderEstimatedRevenue()}
                        </View>
                        <CircularProgress 
                            percentage={revenuePercentage} 
                            color={appColors.primary}
                            label={`${revenuePercentage}%`}
                        />
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryInfo}>
                            <Text style={styles.summaryLabel}>Số lượng vé đã bán</Text>
                            <Text style={styles.summaryValue}>{soldTickets} vé</Text>
                            <Text style={styles.summaryTotal}>Tổng: {totalTickets} vé</Text>
                        </View>
                        <CircularProgress 
                            percentage={ticketPercentage} 
                            color={appColors.primary}
                            label={`${ticketPercentage}%`}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                            <Text style={styles.legendText}>Thực tế: {formatCurrency(totalRevenue)}</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                            <Text style={styles.legendText}>Vé bán: {soldTickets}/{totalTickets}</Text>
                        </View>
                        {estimatedRevenue !== null && (
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                                <Text style={styles.legendText}>Dự kiến: {formatCurrency(estimatedRevenue)}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default RevenueTab;