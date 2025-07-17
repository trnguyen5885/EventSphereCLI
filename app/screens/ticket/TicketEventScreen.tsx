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
  const {id, typeBase, totalPrice, quantity, bookingIds, showtimeId} =
    route.params;
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
      price: eventInfo ? eventInfo?.showtimes[0].ticketPrice : 0,
    },
    vip: {
      name: 'Vé VIP',
      price: eventInfo ? eventInfo?.showtimes[0].ticketPrice : 0,
    },
  };

  // console.log(eventInfo?.showtimes[0].ticketPrice);

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
          amount: typeBase === 'none' ? totalAmount : quantity,
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
          totalAmount: typeBase === 'none' ? formData.tickets.normal : quantity,
          bookingIds: typeBase === 'none' ? [] : bookingIds,
          totalPrice: typeBase === 'none' ? calculateTotal() : totalPrice,
          showtimeId: showtimeId,
        };

        console.log(bodyOrder);

        const responseOrder = await AxiosInstance().post(
          '/orders/createOrder',
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
                  navigation.navigate('Drawer', {
                    screen: 'Home',
                    params: {
                      screen: 'Vé của tôi',
                    },
                  });
                },
              },
            ]);
          }, 8000);
        } else {
          console.log('Thanh toán không thành công');
          setIsLoading(false);
        }
      }

      if (formData.paymentMethod === 'banking') {
        console.log('PayOS Showtime', showtimeId);
        const totalAmount = calculateTotal();
        setIsLoading(false);
        navigation.navigate('PayOSQRScreen', {
          eventName: eventInfo?.name || 'Thanh toán vé',
          eventId: id,
          userId: userInfo?._id,
          amount:
            typeBase === undefined || typeBase === null || typeBase === 'none'
              ? formData.tickets.normal
              : totalPrice,
          bookingType: typeBase,
          bookingIds:
            typeBase === undefined || typeBase === null || typeBase === 'none'
              ? []
              : bookingIds,
          totalPrice:
            typeBase === undefined || typeBase === null || typeBase === 'none'
              ? calculateTotal()
              : totalPrice,
          showtimeId: showtimeId,
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
    <View style={[globalStyles.container, styles.mainContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <RowComponent onPress={handleNavigation} styles={{columnGap: 25}}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
        </RowComponent>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Event Information */}
        <View style={styles.eventInfoContainer}>
          <Text style={styles.eventName}>{eventInfo?.name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons
              name="location-outline"
              size={16}
              color={appColors.primary}
            />
            <Text style={styles.eventLocation}>{eventInfo?.location}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={appColors.primary}
            />
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

        {/* Ticket Selection */}
        {typeBase === 'none' && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 16,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              elevation: 3,
              borderColor: '#E2E8F0',
              borderWidth: 1,
            }}>
            <Text style={styles.sectionTitle}>Chọn số lượng vé</Text>

            {/* Vé Phổ thông */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
              <Text style={{ fontSize: 16, color: '#2D3748' }}>
                {ticketTypes.normal.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => updateTicketQuantity('normal', -1)}
                  style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 12, fontSize: 16 }}>
                  {formData.tickets.normal}
                </Text>
                <TouchableOpacity
                  onPress={() => updateTicketQuantity('normal', 1)}
                  style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Payment Methods */}
        <View style={styles.paymentMethodsContainer}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

          {/* ZALO PAY */}
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              formData.paymentMethod === 'zalo' && styles.selectedPayment,
            ]}
            onPress={() => setFormData({...formData, paymentMethod: 'zalo'})}>
            <View style={styles.paymentMethodContent}>
              <View style={styles.radioButton}>
                {formData.paymentMethod === 'zalo' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentText}>Zalo Pay</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Banking */}
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              formData.paymentMethod === 'banking' && styles.selectedPayment,
            ]}
            onPress={() =>
              setFormData({...formData, paymentMethod: 'banking'})
            }>
            <View style={styles.paymentMethodContent}>
              <View style={styles.radioButton}>
                {formData.paymentMethod === 'banking' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentText}>Chuyển khoản ngân hàng</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummaryContainer}>
          {/* <View style={styles.orderSummaryHeader}>
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
          </View> */}

          <View style={styles.orderInfoContainer}>
            <Text style={styles.orderInfoTitle}>Thông tin đơn hàng</Text>

            <View style={styles.orderInfoRow}>
              <Text style={styles.orderInfoLabel}>Tạm tính</Text>
              <Text style={styles.orderInfoValue}>
                {typeBase === undefined ||
                typeBase === null ||
                typeBase === 'none'
                  ? calculateTotal().toLocaleString('vi-VN')
                  : totalPrice.toLocaleString('vi-VN')}{' '}
                VND
              </Text>
            </View>

            <View style={styles.orderTotalRow}>
              <Text style={styles.orderTotalLabel}>Tổng tiền</Text>
              <Text style={styles.orderTotalValue}>
                {typeBase === undefined ||
                typeBase === null ||
                typeBase === 'none'
                  ? calculateTotal().toLocaleString('vi-VN')
                  : totalPrice.toLocaleString('vi-VN')}{' '}
                VND
              </Text>
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
          <Text style={styles.totalAmount}>
            {typeBase === undefined || typeBase === null || typeBase === 'none'
              ? calculateTotal().toLocaleString('vi-VN')
              : totalPrice.toLocaleString('vi-VN')}{' '}
            VND
          </Text>
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
  // Main container with white background
  mainContainer: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === 'ios' ? 66 : 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: appColors.white2,
    fontSize: 22,
    fontWeight: '500',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#F7FAFC', // Light gray background for scroll area
  },
  // Enhanced section containers
  eventInfoContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  eventName: {
    color: '#2D3748',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventLocation: {
    color: '#4A5568',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTime: {
    color: '#4A5568',
    fontSize: 14,
    marginLeft: 8,
  },
  ticketInfoContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    color: '#2D3748',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ticketInfoText: {
    color: '#4A5568',
    fontSize: 14,
    marginBottom: 8,
  },
  userEmail: {
    color: '#2D3748',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentMethodsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentMethod: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    borderColor: '#CBD5E0',
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
    color: '#2D3748',
    fontSize: 14,
    fontWeight: '500',
  },
  cardLogos: {
    flexDirection: 'row',
    marginTop: 4,
  },
  cardLogo: {
    color: '#6B7280',
    fontSize: 12,
    marginRight: 8,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedPayment: {
    borderColor: appColors.primary,
  },
  promoContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promoButton: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderStyle: 'dashed',
  },
  promoButtonText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  orderSummaryContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  changeTicketText: {
    color: appColors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  ticketDetailContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  ticketDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  ticketQuantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  ticketDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketDetailName: {
    fontSize: 14,
    color: '#4A5568',
    flex: 1,
    marginRight: 12,
  },
  ticketDetailQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  ticketPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  ticketTotalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  orderInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderInfoValue: {
    fontSize: 14,
    color: '#2D3748',
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 16,
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.primary,
  },
  agreementText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  linkText: {
    color: appColors.primary,
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '500',
  },
  totalAmount: {
    color: appColors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  paymentButton: {
    marginVertical: 10,
    backgroundColor: appColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  paymentButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
});
