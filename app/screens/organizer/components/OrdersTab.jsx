import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from '@react-native-vector-icons/ant-design';
import { styles } from './EventDetailStyles';

const OrdersTab = () => {
    const [searchText, setSearchText] = useState('');
    const [activeOrderFilter, setActiveOrderFilter] = useState('all');

    // Dữ liệu mẫu cho đơn hàng
    const sampleOrders = [
        {
            id: 1,
            customerName: 'Hoàng Trung',
            orderId: '123454',
            email: 'h***05@gmail.com',
            phone: '+84353***166',
            status: 'completed'
        },
        {
            id: 2,
            customerName: 'Phong Nguyen',
            orderId: '123455',
            email: 'p***05@gmail.com',
            phone: '+84353***167',
            status: 'checkedin'
        },
        {
            id: 3,
            customerName: 'Thuat Nguyen',
            orderId: '123456',
            email: 't***05@gmail.com',
            phone: '+84353***168',
            status: 'pending'
        }
    ];

    const filteredOrders = sampleOrders.filter(order => {
        const matchesSearch = order.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
            order.orderId.includes(searchText);

        if (activeOrderFilter === 'all') return matchesSearch;
        if (activeOrderFilter === 'checkedin') return matchesSearch && order.status === 'checkedin';
        if (activeOrderFilter === 'pending') return matchesSearch && order.status === 'pending';

        return matchesSearch;
    });

    const OrderItem = ({ order }) => (
        <TouchableOpacity style={styles.orderItem}>
            <View style={styles.orderHeader}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <AntDesign name="right" size={16} color="#666" />
            </View>
            <Text style={styles.orderId}>Mã đơn hàng: {order.orderId}</Text>
            <View style={styles.orderDetails}>
                <View style={styles.orderDetailColumn}>
                    <Text style={styles.orderDetailLabel}>Email</Text>
                    <Text style={styles.orderDetailValue}>{order.email}</Text>
                </View>
                <View style={styles.orderDetailColumn}>
                    <Text style={styles.orderDetailLabel}>Số điện thoại</Text>
                    <Text style={styles.orderDetailValue}>{order.phone}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <Text style={styles.searchPlaceholder}>Search orders</Text>
            </View>
        </View>
    );

    const renderOrderFilters = () => (
        <View style={styles.orderFilters}>
            <TouchableOpacity
                style={[styles.orderFilter, activeOrderFilter === 'all' && styles.activeOrderFilter]}
                onPress={() => setActiveOrderFilter('all')}
            >
                <Text style={[styles.orderFilterText, activeOrderFilter === 'all' && styles.activeOrderFilterText]}>
                    Tất cả
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.orderFilter, activeOrderFilter === 'checkedin' && styles.activeOrderFilter]}
                onPress={() => setActiveOrderFilter('checkedin')}
            >
                <Text style={[styles.orderFilterText, activeOrderFilter === 'checkedin' && styles.activeOrderFilterText]}>
                    Đã checkin
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.orderFilter, activeOrderFilter === 'pending' && styles.activeOrderFilter]}
                onPress={() => setActiveOrderFilter('pending')}
            >
                <Text style={[styles.orderFilterText, activeOrderFilter === 'pending' && styles.activeOrderFilterText]}>
                    Chưa checkin
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.tabContent}>
            {renderSearchBar()}
            {renderOrderFilters()}
            
            <Text style={styles.orderCount}>Có {filteredOrders.length}.324 đơn hàng</Text>

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <OrderItem order={item} />}
                showsVerticalScrollIndicator={false}
                style={styles.ordersList}
            />
        </View>
    );
};

export default OrdersTab;