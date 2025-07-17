import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import AxiosInstance from '../../../services/api/AxiosInstance';

const OrdersTab = ({ eventData }) => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const api = AxiosInstance();
            const res = await api.get(`/orders/event/${eventData?._id}`);
            if (res.success) {
                setOrders(res.data);
                setFilteredOrders(res.data);
            }
        } catch (err) {
            console.error('❌ Lỗi khi fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        const keyword = searchKeyword.toLowerCase();
        const filtered = orders.filter(order =>
            order?.userId?.username?.toLowerCase().includes(keyword)
        );
        setFilteredOrders(filtered);
    }, [searchKeyword, orders]);

    const renderOrderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.rowBetween}>
                <Text style={styles.username}>{item?.userId?.username}</Text>
                <Text style={styles.date}>
                    {new Date(item?.createdAt).toLocaleDateString('vi-VN')}
                </Text>
            </View>

            <View style={styles.rowItem}>
                <Text style={styles.label}>📦 Mã đơn hàng:</Text>
                <Text style={styles.value}>{item?._id}</Text>
            </View>

            <View style={styles.rowItem}>
                <Text style={styles.label}>📧 Email:</Text>
                <Text style={styles.value}>{item?.userId?.email}</Text>
            </View>

            <View style={styles.rowItem}>
                <Text style={styles.label}>🎫 Số vé:</Text>
                <Text style={styles.value}>{item?.amount}</Text>
            </View>

            <View style={styles.rowItem}>
                <Text style={styles.label}>💰 Tổng tiền:</Text>
                <Text style={[styles.value, { color: '#5669FF', fontWeight: 'bold' }]}>
                    {item?.totalPrice?.toLocaleString()} VNĐ
                </Text>
            </View>
        </View>
    );


    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3399FF" />
                <Text>Đang tải đơn hàng...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Tìm theo tên người dùng..."
                value={searchKeyword}
                onChangeText={setSearchKeyword}
            />

            <Text style={styles.resultCount}>
                Đã tìm thấy {filteredOrders.length} đơn hàng
            </Text>

            <FlatList
                data={filteredOrders}
                keyExtractor={(item, index) => item._id + index}
                renderItem={renderOrderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
            />
        </View>
    );
};

export default OrdersTab;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        flex: 1,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 12,
        marginBottom: 12,
    },
    resultCount: {
        marginBottom: 12,
        fontWeight: '500',
        color: '#444',
    },
    card: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#fff',
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: '#3399FF',
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    username: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },

    date: {
        fontSize: 13,
        color: '#888',
    },

    rowItem: {
        flexDirection: 'row',
        marginTop: 4,
    },

    label: {
        width: 110,
        color: '#555',
        fontWeight: '600',
    },

    value: {
        color: '#333',
        flex: 1,
        flexWrap: 'wrap',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

});
