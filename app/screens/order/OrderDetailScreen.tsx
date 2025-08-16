import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
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

interface OrderDetail {
  _id: string;
  eventId: {
    _id: string;
    name: string;
    location: string;
    timeStart: string;
    timeEnd: string;
    image: string;
    description: string;
  };
  userId: {
    _id: string;
    username: string;
    email: string;
    phone: string;
    fullName: string;
    avatar: string;
  };
  giftRecipientUserId?: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    avatar: string;
  };
  totalPrice: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  bookingType: string;
  giftMessage?: string;
  tickets: any[];
  stats: {
    totalTickets: number;
    totalAmount: number;
    orderDate: string;
    status: string;
  };
}

const OrderDetailScreen = ({navigation, route}: any) => {
  const {orderId} = route.params;
  const userId = useSelector((state: any) => state.auth.userId);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const {visible: modalVisible, modalConfig, showError, hideModal} = useCommonModal();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await AxiosInstance().get(
        `/orders/detail/${orderId}?userId=${userId}`
      );

      if (response.data.status) {
        setOrderDetail(response.data.data.order);
      } else {
        showError('Không thể tải chi tiết đơn hàng');
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
      showError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
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

  const getBookingTypeText = (type: string) => {
    switch (type) {
      case 'seat':
        return 'Ghế ngồi';
      case 'zone':
        return 'Khu vực';
      case 'none':
        return 'Không chọn chỗ';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={appColors.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (!orderDetail) {
    return (
      <View style={[globalStyles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Không tìm thấy đơn hàng</Text>
        <Text style={styles.errorSubtitle}>
          Đơn hàng này có thể đã bị xóa hoặc bạn không có quyền xem.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(orderDetail.status)},
            ]}>
            <Text style={styles.statusText}>
              {getStatusText(orderDetail.status)}
            </Text>
          </View>
          <Text style={styles.orderId}>Mã đơn hàng: {orderDetail._id}</Text>
        </View>

        {/* Event Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin sự kiện</Text>
          <View style={styles.eventCard}>
            <Image
              source={
                orderDetail.eventId.image
                  ? {uri: orderDetail.eventId.image}
                  : require('../../../assets/images/default-event.png')
              }
              style={styles.eventImage}
            />
            <View style={styles.eventInfo}>
              <Text style={styles.eventName}>{orderDetail.eventId.name}</Text>
              <View style={styles.eventDetails}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={styles.eventLocation}>
                  {orderDetail.eventId.location}
                </Text>
              </View>
              <View style={styles.eventDetails}>
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text style={styles.eventTime}>
                  {formatDate(orderDetail.eventId.timeStart)} -{' '}
                  {formatDate(orderDetail.eventId.timeEnd)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
          <View style={styles.orderInfoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày đặt:</Text>
              <Text style={styles.infoValue}>
                {formatDate(orderDetail.createdAt, 'dd/MM/yyyy HH:mm')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Loại đặt:</Text>
              <Text style={styles.infoValue}>
                {getBookingTypeText(orderDetail.bookingType)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số lượng vé:</Text>
              <Text style={styles.infoValue}>
                {orderDetail.stats.totalTickets} vé
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tổng tiền:</Text>
              <Text style={styles.totalPrice}>
                {orderDetail.totalPrice.toLocaleString('vi-VN')} VND
              </Text>
            </View>
          </View>
        </View>

        {/* Gift Information */}
        {orderDetail.giftRecipientUserId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin tặng quà</Text>
            <View style={styles.giftCard}>
              <View style={styles.recipientInfo}>
                <Image
                  source={
                    orderDetail.giftRecipientUserId.avatar
                      ? {uri: orderDetail.giftRecipientUserId.avatar}
                      : require('../../../assets/images/icon-avatar.png')
                  }
                  style={styles.recipientAvatar}
                />
                <View style={styles.recipientDetails}>
                  <Text style={styles.recipientName}>
                    {orderDetail.giftRecipientUserId.fullName}
                  </Text>
                  <Text style={styles.recipientEmail}>
                    {orderDetail.giftRecipientUserId.email}
                  </Text>
                </View>
              </View>
              {orderDetail.giftMessage && (
                <View style={styles.giftMessage}>
                  <Text style={styles.giftMessageLabel}>Lời nhắn:</Text>
                  <Text style={styles.giftMessageText}>
                    {orderDetail.giftMessage}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Tickets Information */}
        {orderDetail.tickets && orderDetail.tickets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin vé</Text>
            <View style={styles.ticketsCard}>
              {orderDetail.tickets.map((ticket, index) => (
                <View key={ticket._id || index} style={styles.ticketItem}>
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketNumber}>Vé #{index + 1}</Text>
                    <Text style={styles.ticketId}>
                      {ticket._id?.slice(-8) || 'N/A'}
                    </Text>
                  </View>
                  {ticket.seatInfo && (
                    <View style={styles.ticketDetails}>
                      <Text style={styles.ticketDetail}>
                        Ghế: {ticket.seatInfo.seatNumber}
                      </Text>
                      <Text style={styles.ticketDetail}>
                        Khu vực: {ticket.seatInfo.zoneName}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <View style={styles.customerCard}>
            <View style={styles.customerInfo}>
              <Image
                source={
                  orderDetail.userId.avatar
                    ? {uri: orderDetail.userId.avatar}
                    : require('../../../assets/images/icon-avatar.png')
                }
                style={styles.customerAvatar}
              />
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>
                  {orderDetail.userId.fullName || orderDetail.userId.username}
                </Text>
                <Text style={styles.customerEmail}>
                  {orderDetail.userId.email}
                </Text>
                {orderDetail.userId.phone && (
                  <Text style={styles.customerPhone}>
                    {orderDetail.userId.phone}
                  </Text>
                )}
              </View>
            </View>
          </View>
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
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
  statusContainer: {
    margin: 16,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  orderId: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  orderInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.primary,
  },
  giftCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  recipientEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  giftMessage: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  giftMessageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  giftMessageText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  ticketsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ticketItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  ticketId: {
    fontSize: 12,
    color: '#6B7280',
  },
  ticketDetails: {
    marginTop: 4,
  },
  ticketDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  customerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  customerEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default OrderDetailScreen;
