import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useSelector} from 'react-redux';
import {AxiosInstance} from '../../services';
import {appColors} from '../../constants/appColors';
import {globalStyles} from '../../constants/globalStyles';
import {formatDate} from '../../services/utils/date';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CommonModal from '../../modals/CommonModal';
import {useCommonModal} from '../../hooks/useCommonModal';

interface Order {
  _id: string;
  eventId: {
    _id: string;
    name: string;
    location: string;
    timeStart: string;
    timeEnd: string;
    image: string;
  };
  totalPrice: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  ticketCount: number;
  tickets: any[];
}

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalSpent: number;
}

const OrderHistoryScreen = ({navigation}: any) => {
  const userId = useSelector((state: any) => state.auth.userId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const {visible: modalVisible, modalConfig, showError, hideModal} = useCommonModal();

  useEffect(() => {
    if (userId) {
      fetchOrderHistory();
      fetchOrderStats();
    }
  }, [userId]);

  const fetchOrderHistory = async (page = 1, isRefresh = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await AxiosInstance().get(
        `/orders/user/${userId}/history?page=${page}&limit=10`
      );

      if (response.data.status) {
        const newOrders = response.data.data.orders;
        const pagination = response.data.data.pagination;

        if (page === 1 || isRefresh) {
          setOrders(newOrders);
        } else {
          setOrders(prev => [...prev, ...newOrders]);
        }

        setCurrentPage(pagination.currentPage);
        setHasNextPage(pagination.hasNextPage);
      }
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
      showError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await AxiosInstance().get(`/orders/user/${userId}/stats`);
      if (response.data.status) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thống kê đơn hàng:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrderHistory(1, true);
    fetchOrderStats();
  };

  const loadMore = () => {
    if (hasNextPage && !loadingMore) {
      fetchOrderHistory(currentPage + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Đang xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const renderOrderItem = ({item}: {item: Order}) => {
    // Kiểm tra xem sự kiện đã diễn ra chưa
    const eventTime = new Date(item.eventId.timeStart);
    const now = new Date();
    const isPastEvent = eventTime < now;
    
    return (
      <TouchableOpacity
        style={styles.orderItem}
        onPress={() => navigation.navigate('OrderDetail', {orderId: item._id})}>
        <View style={styles.orderHeader}>
          <Image
            source={
              item.eventId.image
                ? {uri: item.eventId.image}
                : require('../../../assets/images/default-event.png')
            }
            style={styles.eventImage}
          />
          <View style={styles.orderInfo}>
            <Text style={styles.eventName} numberOfLines={2}>
              {item.eventId.name}
            </Text>
            <View style={styles.eventDetails}>
              <Ionicons name="location" size={14} color="#6B7280" />
              <Text style={styles.eventLocation} numberOfLines={1}>
                {item.eventId.location}
              </Text>
            </View>
            <View style={styles.eventDetails}>
              <Ionicons 
                name={isPastEvent ? "time" : "calendar"} 
                size={14} 
                color={isPastEvent ? "#EF4444" : "#6B7280"} 
              />
                             <Text style={[
                 styles.eventTime,
                 isPastEvent && { color: '#EF4444' }
               ]}>
                 {isPastEvent ? 'Đã diễn ra' : 'Sắp diễn ra'}: {formatDate(item.eventId.timeStart)}
               </Text>
            </View>
          </View>
          <View style={styles.orderStatus}>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: getStatusColor(item.status)},
              ]}>
              <Text style={styles.statusText}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.orderMeta}>
                         <Text style={styles.orderDate}>
               Đặt vé: {formatDate(item.createdAt)}
             </Text>
            <Text style={styles.ticketCount}>
              {item.ticketCount} vé
            </Text>
          </View>
          <Text style={styles.orderPrice}>
            {item.totalPrice.toLocaleString('vi-VN')} VND
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Thống kê đơn hàng</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Tổng đơn hàng</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, {color: '#10B981'}]}>
              {stats.completedOrders}
            </Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, {color: '#F59E0B'}]}>
              {stats.pendingOrders}
            </Text>
            <Text style={styles.statLabel}>Đang xử lý</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, {color: '#EF4444'}]}>
              {stats.cancelledOrders}
            </Text>
            <Text style={styles.statLabel}>Đã hủy</Text>
          </View>
        </View>
        <View style={styles.totalSpent}>
          <Text style={styles.totalSpentLabel}>Tổng chi tiêu:</Text>
          <Text style={styles.totalSpentAmount}>
            {stats.totalSpent.toLocaleString('vi-VN')} VND
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color="#CBD5E0" />
      <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
      <Text style={styles.emptySubtitle}>
        Bạn chưa có đơn hàng nào. Hãy khám phá các sự kiện thú vị!
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Explore')}>
        <Text style={styles.exploreButtonText}>Khám phá sự kiện</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={appColors.primary} />
        <Text style={styles.loadingText}>Đang tải lịch sử đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        
        {/* Stats Section */}
        {renderStats()}

        {/* Orders List */}
        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
          
          {orders.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={orders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              ListFooterComponent={
                hasNextPage && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={loadMore}
                    disabled={loadingMore}>
                    {loadingMore ? (
                      <ActivityIndicator size="small" color={appColors.primary} />
                    ) : (
                      <Text style={styles.loadMoreText}>Tải thêm</Text>
                    )}
                  </TouchableOpacity>
                )
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Common Modal */}
      <CommonModal
        visible={modalVisible}
        title={modalConfig?.title}
        message={modalConfig?.message || ''}
        type={modalConfig?.type}
        showCancelButton={modalConfig?.showCancelButton}
        cancelText={modalConfig?.cancelText}
        confirmText={modalConfig?.confirmText}
        onConfirm={modalConfig?.onConfirm}
        onCancel={modalConfig?.onCancel}
        onClose={hideModal}
        showIcon={modalConfig?.showIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7FAFC',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: appColors.primary,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  totalSpent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalSpentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalSpentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.primary,
  },
  ordersSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  orderItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  eventTime: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  orderStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderMeta: {
    flex: 1,
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  ticketCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.primary,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  loadMoreText: {
    color: appColors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  exploreButton: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OrderHistoryScreen;
