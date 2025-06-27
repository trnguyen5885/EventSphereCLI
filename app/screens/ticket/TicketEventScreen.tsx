/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  NativeModules,
  Alert,
} from 'react-native';
import {CardComponent, RowComponent} from '../../components';
import {appColors} from '../../constants/appColors';
import {globalStyles} from '../../constants/globalStyles';
import {AxiosInstance} from '../../services';
import {formatDate} from '../../services/utils/date';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadingModal from '../../modals/LoadingModal';
import {UserModel} from '@/app/models/user/UserModel';
import {EventModel} from '@/app/models';
import {useSelector} from 'react-redux';

const {ZaloPayModule} = NativeModules;

const TicketEventScreen = ({navigation, route}: any) => {
  const {id, typeBase, totalPrice, quantity, bookingId} = route.params;
  const [userInfo, setUserInfo] = useState<UserModel | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState({minutes: 11, seconds: 31});
  const userId = useSelector(state => state.auth.userId);

  const [eventInfo, setEventInfo] = useState<EventModel | null>(null);
  const [formData, setFormData] = useState<any>({
    fullName: '',
    phone: '',
    email: '',
    tickets: {
      normal: 0,
      vip: 0,
    },
    paymentMethod: '',
  });

  const ticketTypes = {
    normal: {
      name: 'Vé Thường',
      price: 100,
    },
    vip: {
      name: 'Vé VIP',
      price: 100,
    },
  };

  useEffect(() => {
    if (!userId || !id) return;
    const getInfoEvent = async () => {
      try {
        const response = await AxiosInstance().get<EventModel>(
          `events/detail/${id}`,
        );
        const responseUser = await AxiosInstance().get<UserModel>(
          `users/getUser/${userId}`,
        );
        setEventInfo(response.data);
        setUserInfo(responseUser.data);
      } catch (error) {
        console.log('Lỗi khi fetch event/user:', error);
      }
    };

    getInfoEvent();

    return () => {
      setEventInfo(null);
    };
  }, [userId, id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 Màn hình TicketEvent được focus lại');
      setIsLoading(false);
    });

    return unsubscribe;
  }, [navigation]);

  const updateTicketQuantity = (type: string, change: number) => {
    const newQuantity = formData.tickets[type] + change;
    if (newQuantity >= 0 && newQuantity <= 10) {
      setFormData({
        ...formData,
        tickets: {
          ...formData.tickets,
          [type]: newQuantity,
        },
      });
    }
  };

  const calculateTotal = () => {
    return (
      formData.tickets.normal * ticketTypes.normal.price +
      formData.tickets.vip * ticketTypes.vip.price
    );
  };

  const isFormValid = () => {
    return (
      (formData.tickets.normal > 0 || formData.tickets.vip > 0) &&
      formData.paymentMethod !== ''
    );
  };

  const handleNavigation = () => {
    navigation.goBack();
  };

  const confirmOrder = async () => {
    setIsLoading(true);

    try {
      if (formData.paymentMethod === 'zalo') {
        const totalAmount = calculateTotal();
        const bodyPayment = {
          amount: typeBase === undefined ? totalAmount : quantity,
          urlCalbackSuccess:
            'https://gamesphereapi.onrender.com/payments/callback',
          dataSave: 'save',
          description: eventInfo?.name,
          nameUser: userInfo?.username,
        };
        const response = await AxiosInstance().post('/payments', bodyPayment);
        ZaloPayModule.payOrder(response.data.zp_trans_token);

        const bodyOrder = {
          eventId: id,
          userId: userInfo?._id,
          bookingType: typeBase ?? 'none',
          amount:
            typeBase === undefined || typeBase === null || typeBase === 'none'
              ? formData.tickets.normal
              : quantity,
          ...((typeBase !== undefined ||
            typeBase !== null ||
            typeBase !== 'none') && {bookingId: bookingId}),
          totalPrice:
            typeBase === undefined || typeBase === null || typeBase === 'none'
              ? calculateTotal()
              : totalPrice,
        };

        const responseOrder = await AxiosInstance().post(
          'orders/createOrder',
          bodyOrder,
        );

        const bodyOrderTicket = {
          orderId: responseOrder.data,
          paymentId: response.data.zp_trans_token,
        };
        const responseOrderTicket = await AxiosInstance().post(
          'orders/createTicket',
          bodyOrderTicket,
        );

        if (responseOrder.data && responseOrderTicket.data) {
          setTimeout(() => setIsLoading(false), 8000);
          setTimeout(() => {
            Alert.alert('Thành công', 'Thanh toán đã được xử lý thành công!', [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Drawer');
                },
              },
            ]);
          }, 8000);
        } else {
          console.log('Thanh toán không thánh công');
          setIsLoading(false);
        }
      }

      if (formData.paymentMethod === 'banking') {
        setIsLoading(false);
        navigation.navigate('PaymentQRCode', {
          amount: eventInfo?.ticketPrice,
        });
      }

      if (formData.paymentMethod === 'payos') {
        const totalAmount = calculateTotal();
        setIsLoading(false);
        navigation.navigate('PayOSQRScreen', {
          eventName: eventInfo?.name || 'Thanh toán vé',
          eventId: id,
          userId: userInfo?._id,
          amount:
            typeBase === undefined || typeBase === null || typeBase === 'none'
              ? totalAmount
              : totalPrice,
          bookingType: typeBase,
          bookingId:
            typeBase === undefined || typeBase === null || typeBase === 'none'
              ? null
              : bookingId,
          totalPrice:
            typeBase === undefined || typeBase === null || typeBase === 'none'
              ? calculateTotal()
              : totalPrice,
        });
      }
    } catch (error) {
      console.log('Lỗi khi thanh toán:', error);
      setIsLoading(false);
      Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình thanh toán');
    }
  };

  if (isLoading) {
    return <LoadingModal visible={true} />;
  }

  return (
    <View style={[globalStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <RowComponent onPress={handleNavigation} styles={{columnGap: 25}}>
          <Ionicons name="chevron-back" size={26} color="white" />
          <Text style={styles.headerTitle}>Thanh toán</Text>
        </RowComponent>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Event Information */}
        <View style={styles.eventInfoContainer}>
          <Text style={styles.eventName}>{eventInfo?.name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#fff" />
            <Text style={styles.eventLocation}>{eventInfo?.location}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text style={styles.eventTime}>
              {eventInfo?.timeStart ? formatDate(eventInfo.timeStart) : ''} -{' '}
              {eventInfo?.timeEnd ? formatDate(eventInfo.timeEnd) : ''}
            </Text>
          </View>
        </View>

        {/* Ticket Information */}
        <View style={styles.ticketInfoContainer}>
          <Text style={styles.sectionTitle}>Thông tin nhận vé</Text>
          <Text style={styles.ticketInfoText}>
            Vé điện tử sẽ được hiển thị trong mục "Vé của tôi" của tài khoản
          </Text>
          <Text style={styles.userEmail}>
            {userInfo?.email || 'trungnguyenk4.it@gmail.com'}
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsContainer}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

          {/* VNPAY */}
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              formData.paymentMethod === 'vnpay' && styles.selectedPayment,
            ]}
            onPress={() => setFormData({...formData, paymentMethod: 'vnpay'})}>
            <View style={styles.paymentMethodContent}>
              <View style={styles.radioButton}>
                {formData.paymentMethod === 'vnpay' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentText}>VNPAY/Ứng dụng ngân hàng</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* VietQR */}
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              formData.paymentMethod === 'vietqr' && styles.selectedPayment,
            ]}
            onPress={() => setFormData({...formData, paymentMethod: 'vietqr'})}>
            <View style={styles.paymentMethodContent}>
              <View style={styles.radioButton}>
                {formData.paymentMethod === 'vietqr' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentText}>VietQR</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* ShopeePay */}
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              formData.paymentMethod === 'shopeepay' && styles.selectedPayment,
            ]}
            onPress={() =>
              setFormData({...formData, paymentMethod: 'shopeepay'})
            }>
            <View style={styles.paymentMethodContent}>
              <View style={styles.radioButton}>
                {formData.paymentMethod === 'shopeepay' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentText}>ShopeePay</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Credit/Debit Card */}
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              formData.paymentMethod === 'card' && styles.selectedPayment,
            ]}
            onPress={() => setFormData({...formData, paymentMethod: 'card'})}>
            <View style={styles.paymentMethodContent}>
              <View style={styles.radioButton}>
                {formData.paymentMethod === 'card' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentText}>Thẻ ghi nợ/Thẻ tín dụng</Text>
                <View style={styles.cardLogos}>
                  <Text style={styles.cardLogo}>VISA</Text>
                  <Text style={styles.cardLogo}>MC</Text>
                  <Text style={styles.cardLogo}>JCB</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummaryContainer}>
          <View style={styles.orderSummaryHeader}>
            <Text style={styles.orderSummaryTitle}>Thông tin đặt vé</Text>
            <TouchableOpacity>
              <Text style={styles.changeTicketText}>Chọn lại vé</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ticketDetailContainer}>
            <View style={styles.ticketDetailHeader}>
              <Text style={styles.ticketTypeText}>Loại vé</Text>
              <Text style={styles.ticketQuantityText}>Số lượng</Text>
            </View>

            <View style={styles.ticketDetailRow}>
              <Text style={styles.ticketDetailName}>
                Hạng Regular (Không dành cho trẻ dưới 16 tuổi)
              </Text>
              <Text style={styles.ticketDetailQuantity}>01</Text>
            </View>

            <View style={styles.ticketPriceRow}>
              <Text style={styles.ticketPrice}>250.000 đ</Text>
              <Text style={styles.ticketTotalPrice}>250.000 đ</Text>
            </View>

            <View style={styles.ticketTag}>
              <Text style={styles.ticketTagText}>M-1</Text>
            </View>
          </View>

          <View style={styles.orderInfoContainer}>
            <Text style={styles.orderInfoTitle}>Thông tin đơn hàng</Text>

            <View style={styles.orderInfoRow}>
              <Text style={styles.orderInfoLabel}>Tạm tính</Text>
              <Text style={styles.orderInfoValue}>250.000 đ</Text>
            </View>

            <View style={styles.orderTotalRow}>
              <Text style={styles.orderTotalLabel}>Tổng tiền</Text>
              <Text style={styles.orderTotalValue}>250.000 đ</Text>
            </View>

            <Text style={styles.agreementText}>
              Bằng việc tiến hành đặt mua, bạn đã đồng ý với{' '}
              <Text style={styles.linkText}>Điều Kiện Giao Dịch Chung</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Payment Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng tiền</Text>
          <Text style={styles.totalAmount}>250.000 đ</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            !formData.paymentMethod && styles.paymentButtonDisabled,
          ]}
          disabled={!formData.paymentMethod}
          onPress={confirmOrder}>
          <Text style={styles.paymentButtonText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TicketEventScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === 'ios' ? 66 : 32,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  countdownContainer: {
    backgroundColor: appColors.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  countdownText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000',
  },
  eventInfoContainer: {
    backgroundColor: '#1a1a1a',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  eventName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventLocation: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTime: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  ticketInfoContainer: {
    backgroundColor: '#333',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    color: appColors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  ticketInfoText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  userEmail: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentMethodsContainer: {
    backgroundColor: '#333',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  paymentMethod: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: appColors.primary,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentText: {
    color: 'white',
    fontSize: 14,
  },
  cardLogos: {
    flexDirection: 'row',
    marginTop: 4,
  },
  cardLogo: {
    color: '#666',
    fontSize: 12,
    marginRight: 8,
    backgroundColor: '#555',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedPayment: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  promoContainer: {
    backgroundColor: '#333',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promoButton: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderStyle: 'dashed',
  },
  promoButtonText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  orderSummaryContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  changeTicketText: {
    color: '#007AFF',
    fontSize: 14,
  },
  ticketDetailContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  ticketDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  ticketQuantityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  ticketDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketDetailName: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  ticketDetailQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  ticketPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketPrice: {
    fontSize: 14,
    color: '#666',
  },
  ticketTotalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  ticketTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ticketTagText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  orderInfoContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderInfoValue: {
    fontSize: 14,
    color: '#000',
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 16,
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.primary,
  },
  agreementText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  linkText: {
    color: '#007AFF',
  },
  bottomContainer: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    color: 'white',
    fontSize: 16,
  },
  totalAmount: {
    color: appColors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  paymentButton: {
    backgroundColor: appColors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentButtonDisabled: {
    backgroundColor: '#555',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
