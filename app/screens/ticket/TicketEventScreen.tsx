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
  Image,
  Switch,
  TextInput,
} from 'react-native';
import {RowComponent} from '../../components';
import {appColors} from '../../constants/appColors';
import {globalStyles} from '../../constants/globalStyles';
import {AxiosInstance} from '../../services';
import {formatDate} from '../../services/utils/date';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadingModal from '../../modals/LoadingModal';
import CommonModal from '../../modals/CommonModal';
import {useCommonModal} from '../../hooks/useCommonModal';
import {UserModel} from '@/app/models/user/UserModel';
import {EventModel} from '@/app/models';
import {useSelector} from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const {ZaloPayModule} = NativeModules;

interface GiftRecipient {
  userId: string;
  email: string;
  username: string;
  fullName: string;
  avatar: string;
}

const TicketEventScreen = ({navigation, route}: any) => {
  const {id, typeBase, totalPrice, quantity, bookingIds, showtimeId, zones} =
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
    paymentMethod: '',
  });

  // Gift functionality states
  const [isGiftMode, setIsGiftMode] = useState(false);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [giftRecipient, setGiftRecipient] = useState<GiftRecipient | null>(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);

  // Common Modal Hook
  const {visible: modalVisible, modalConfig, showError, showSuccess, showConfirm, hideModal} = useCommonModal();

  // const ticketTypes = {
  //   normal: {
  //     name: 'Vé Thường',
  //     price: eventInfo ? eventInfo?.showtimes[0].ticketPrice : 0,
  //   },
  //   vip: {
  //     name: 'Vé VIP',
  //     price: eventInfo ? eventInfo?.showtimes[0].ticketPrice : 0,
  //   },
  // };

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
        console.log(response.data);
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

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Search user for gift functionality
  const searchUser = async (query: string) => {
    if (!query.trim()) {
      setGiftRecipient(null);
      return;
    }

    // Only search if email format is valid
    if (!isValidEmail(query)) {
      setGiftRecipient(null);
      return;
    }

    setIsSearchingUser(true);
    try {
      const response = await AxiosInstance().get(`/users/search?query=${query}`);
      if (response.data && response.data.length > 0) {
        const foundUser = response.data[0];
        
        // Kiểm tra xem có phải chính user hiện tại không
        if (foundUser._id === userId) {
          setGiftRecipient(null);
          showError(
            'Bạn không thể tặng vé cho chính mình. Vui lòng nhập email của người khác.',
            'Không thể tặng cho chính mình'
          );
          return;
        }
        
        setGiftRecipient(foundUser);
      } else {
        // User not found - clear recipient and show error
        setGiftRecipient(null);
        showError(
          'Email này chưa được đăng ký trong hệ thống. Vui lòng nhập email của người dùng đã đăng ký.',
          'Không tìm thấy'
        );
      }
    } catch (error) {
      console.log('Lỗi khi tìm kiếm người dùng:', error);
      setGiftRecipient(null);
      showError('Không thể tìm kiếm người dùng. Vui lòng thử lại.', 'Lỗi');
    } finally {
      setIsSearchingUser(false);
    }
  };

  // Debounced search - only trigger when email is valid
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (giftEmail.trim() && isValidEmail(giftEmail)) {
        searchUser(giftEmail);
      } else {
        setGiftRecipient(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [giftEmail]);

  // const updateTicketQuantity = (type: string, change: number) => {
  //   const newQuantity = formData.tickets[type] + change;
  //   if (newQuantity >= 0 && newQuantity <= 10) {
  //     setFormData({
  //       ...formData,
  //       tickets: {
  //         ...formData.tickets,
  //         [type]: newQuantity,
  //       },
  //     });
  //   }
  // };

  // const calculateTotal = () => {
  //   return (
  //     formData.tickets.normal * ticketTypes.normal.price +
  //     formData.tickets.vip * ticketTypes.vip.price
  //   );
  // };

  // const isFormValid = () => {
  //   return (
  //     (formData.tickets.normal > 0 || formData.tickets.vip > 0) &&
  //     formData.paymentMethod !== ''
  //   );
  // };

  const handleNavigation = () => {
    navigation.goBack();
  };

  const confirmOrder = async () => {
    // Validate gift mode
    if (isGiftMode && !giftRecipient) {
      showError('Vui lòng chọn người nhận quà', 'Lỗi');
      return;
    }

    // Validate email format for gift mode
    if (isGiftMode && giftRecipient && !isValidEmail(giftRecipient.email)) {
      showError('Vui lòng nhập email hợp lệ', 'Lỗi');
      return;
    }

    setIsLoading(true);

    try {
      if (formData.paymentMethod === 'zalo') {
        // const totalAmount = calculateTotal();
        const bodyPayment = {
          amount: totalPrice,
          urlCalbackSuccess:
            'https://gamesphereapi.onrender.com/payments/callback',
          dataSave: 'save',
          description: eventInfo?.name,
          nameUser: userInfo?.username,
        };
        const response = await AxiosInstance().post('/payments', bodyPayment);
        console.log(bodyPayment);
        try {
          // ✅ Đợi kết quả từ Native Module
          const result = await ZaloPayModule.payOrder(
            response.data.zp_trans_token,
          );

          if (result.status === 'success') {
            // ===== Thanh toán thành công =====
            let reservations = [];
            if (typeBase === 'zone') {
              const requestData = {
                eventId: id,
                zones,
                showtimeId,
                quantity,
              };
              const zoneRes = await AxiosInstance().post(
                '/zones/reserveZoneTicket',
                requestData,
              );
              reservations = zoneRes.reservations;
            }

            const bodyOrder = {
              eventId: id,
              userId: userInfo?._id,
              bookingType: typeBase ?? 'none',
              totalAmount: quantity,
              bookingIds:
                typeBase === 'zone'
                  ? reservations.map((r: any) => r.bookingId)
                  : bookingIds,
              totalPrice,
              showtimeId,
              // Add gift information if in gift mode
              ...(isGiftMode && giftRecipient && {
                giftRecipientUserId: giftRecipient.userId,
                giftMessage: giftMessage || 'Chúc bạn có một buổi tối tuyệt vời!',
              }),
            };

            const responseOrder = await AxiosInstance().post(
              '/orders/createOrder',
              bodyOrder,
            );

            const bodyOrderTicket = {
              orderId: responseOrder.data,
              paymentId: result.transToken, // dùng transToken từ ZaloPay
            };
            const responseOrderTicket = await AxiosInstance().post(
              'orders/createTicket',
              bodyOrderTicket,
            );

            setIsLoading(false);
            // Alert.alert('Thành công', 'Thanh toán đã được xử lý thành công!', [
            //   {
            //     text: 'OK',
            //     onPress: () =>
            //       navigation.navigate('Drawer', {
            //         screen: 'Home',
            //         params: {screen: 'Vé của tôi'},
            //       }),
            //   },
            // ]);
            setTimeout(() => {
              navigation.navigate('PaymentSuccess', {
                amount: totalPrice,
                eventName: eventInfo?.name,
                orderCode: responseOrder.data,
                transactionId: response.data.zp_trans_token || null,
                paymentMethod: 'Zalo Pay',
                timestamp: Date.now(),
                orderId: responseOrder.data,
                ticketId: responseOrderTicket.data,
                totalPrice: totalPrice,
                bookingType: typeBase,
                showtimeId: showtimeId,
              });
            }, 500);
          }
                 } catch (error: any) {
           // ❌ Huỷ hoặc lỗi
           setIsLoading(false);
           if (error.code === 'PAYMENT_CANCELLED') {
             showError('Bạn đã huỷ thanh toán.', 'Thanh toán bị hủy');
           } else if (error.code === 'PAYMENT_ERROR') {
             showError('Có lỗi khi xử lý thanh toán.', 'Thanh toán thất bại');
           } else {
             showError('Không thể thực hiện thanh toán.', 'Lỗi');
           }
           console.log('Chi tiết lỗi ZaloPay:', error);
         }
      }

      if (formData.paymentMethod === 'banking') {
        console.log('PayOS Showtime', showtimeId);
        // const totalAmount = calculateTotal();
        setIsLoading(false);
        navigation.navigate('PayOSQRScreen', {
          eventName: eventInfo?.name || 'Thanh toán vé',
          eventId: id,
          userId: userInfo?._id,
          amount: quantity,
          typeBase: typeBase,
          bookingType: typeBase,
          bookingIds: typeBase === 'none' ? [] : bookingIds,
          totalPrice: totalPrice,
          showtimeId: showtimeId,
          zones: zones,
          // Add gift information if in gift mode
          ...(isGiftMode && giftRecipient && {
            giftRecipientUserId: giftRecipient.userId,
            giftMessage: giftMessage || 'Chúc bạn có một buổi tối tuyệt vời!',
          }),
        });
      }
         } catch (error) {
       console.log('Lỗi khi thanh toán:', error);
       setIsLoading(false);
       showError('Có lỗi xảy ra trong quá trình thanh toán', 'Lỗi');
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Event Information */}
        <View style={styles.eventInfoContainer}>
          <Text style={styles.eventName}>{eventInfo?.name}</Text>
          <View style={styles.timeContainer}>
            <Ionicons name="calendar" size={20} color={appColors.primary} />
            <Text style={styles.eventTime}>
              {eventInfo?.timeStart ? formatDate(eventInfo.timeStart) : ''} -{' '}
              {eventInfo?.timeEnd ? formatDate(eventInfo.timeEnd) : ''}
            </Text>
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color={appColors.primary} />
            <Text style={styles.eventLocation}>{eventInfo?.location}</Text>
          </View>
        </View>

        {/* Gift Mode Switch */}
        <View style={styles.giftContainer}>
          <View style={styles.giftHeader}>
            <View style={styles.giftTitleContainer}>
              <Ionicons name="gift" size={24} color={appColors.primary} />
              <Text style={styles.giftTitle}>Tặng vé cho bạn bè</Text>
            </View>
            <Switch
              value={isGiftMode}
              onValueChange={setIsGiftMode}
              trackColor={{false: '#CBD5E0', true: appColors.primary}}
              thumbColor={isGiftMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          
          {isGiftMode && (
            <View style={styles.giftFormContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email người nhận</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    giftEmail && userInfo?.username === giftEmail && styles.errorInput
                  ]}
                  placeholder="Nhập email người nhận"
                  value={giftEmail}
                  onChangeText={setGiftEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {isSearchingUser && (
                  <Text style={styles.searchingText}>Đang tìm kiếm...</Text>
                )}
                {giftEmail && userInfo?.email === giftEmail && (
                  <Text style={styles.errorText}>
                    ⚠️ Bạn không thể tặng vé cho chính mình
                  </Text>
                )}
              </View>

                                            {/* Recipient Info */}
                {giftRecipient && (
                  <View style={styles.recipientContainer}>
                    <View style={styles.recipientInfo}>
                      <Image
                        source={
                          giftRecipient.avatar 
                            ? {uri: giftRecipient.avatar}
                            : require('../../../assets/images/icon-avatar.png')
                        }
                        style={styles.recipientAvatar}
                      />
                      <View style={styles.recipientDetails}>
                        <Text style={styles.recipientName}>{giftRecipient.fullName}</Text>
                        <Text style={styles.recipientEmail}>{giftRecipient.email}</Text>
                      </View>
                    </View>
                    <View style={styles.recipientCheck}>
                      <Ionicons 
                        name="checkmark-circle" 
                        size={24} 
                        color={appColors.primary} 
                      />
                    </View>
                  </View>
                )}

              {/* Gift Message */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Lời nhắn (tùy chọn)</Text>
                <TextInput
                  style={[styles.textInput, styles.messageInput]}
                  placeholder="Viết lời nhắn cho người nhận..."
                  value={giftMessage}
                  onChangeText={setGiftMessage}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          )}
        </View>

        {/* Ticket Information */}
        <View style={styles.ticketInfoContainer}>
          <Text style={styles.sectionTitle}>
            {isGiftMode ? 'Thông tin nhận vé (người nhận)' : 'Thông tin nhận vé'}
          </Text>
          <Text style={styles.ticketInfoText}>
            Vé điện tử sẽ được hiển thị trong mục "Vé của tôi" của tài khoản
          </Text>
          <Text style={styles.userEmail}>
            {isGiftMode && giftRecipient 
              ? giftRecipient.email 
              : userInfo?.username || 'trungnguyenk4.it@gmail.com'
            }
          </Text>
        </View>

        {/* Ticket Selection */}

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
                <Image
                  style={{width: 30, height: 30, resizeMode: 'cover'}}
                  source={require('../../../assets/images/zalopay-logo.png')}
                />
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
              <FontAwesome name="bank" size={25} color={appColors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Payment Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng tiền</Text>
          <Text style={styles.totalAmount}>
            {totalPrice.toLocaleString('vi-VN')}
            VND
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            (!formData.paymentMethod || 
             (isGiftMode && !giftRecipient) || 
             (isGiftMode && giftEmail && userInfo?.username === giftEmail)) && styles.paymentButtonDisabled,
          ]}
          disabled={!formData.paymentMethod || 
                   (isGiftMode && !giftRecipient) || 
                   (isGiftMode && giftEmail && userInfo?.username === giftEmail)}
          onPress={confirmOrder}>
          <Text style={styles.paymentButtonText}>
            {isGiftMode ? 'Tặng vé' : 'Thanh toán'}
          </Text>
                 </TouchableOpacity>
       </View>

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
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    textAlign: 'center',
    color: '#2D3748',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
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
  // Gift container styles
  giftContainer: {
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
  giftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  giftTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftTitle: {
    color: '#2D3748',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  giftFormContainer: {
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#2D3748',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2D3748',
    backgroundColor: '#FFFFFF',
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  searchingText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    color: '#2D3748',
    fontSize: 14,
    fontWeight: '600',
  },
  recipientEmail: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  recipientCheck: {
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
    marginBottom: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  errorInput: {
    borderColor: '#E53E3E',
    backgroundColor: '#FED7D7',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
