import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import createPaymentQRCode from '../../services/createPaymentQRCode';
import checkPaymentStatus from '../../services/checkPaymentStatus';
import { AxiosInstance } from '../../services';
import { RowComponent } from '../../components';
import { appColors } from '../../constants/appColors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../../constants/globalStyles';

const PayOSQRScreen = ({ route, navigation }) => {
  const { amount, eventName, userId, eventId, bookingType, bookingId, totalPrice } = route.params;
  const [qrData, setQrData] = useState(null);
  const [orderCode, setOrderCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING, CHECKING, PAID, ERROR
  const [intervalRef, setIntervalRef] = useState(null); // Lưu reference của interval
  
  console.log("Amount", amount);
  console.log("EventName", eventName)
  console.log("UserId", userId)
  console.log("EventId", eventId)
  console.log("BookingType", bookingType)
  console.log("BookingId", bookingId)


  

  // Hàm tạo QR Code
  const handleGenerateQR = async () => {
    try {
      setLoading(true);
      const result = await createPaymentQRCode(amount, eventName);

      setLoading(false);

      if (result && result.qrImage) {
        setQrData(result.qrImage); // chuỗi QR
        setOrderCode(result.orderCode); // cần để check status
        setPaymentStatus('PENDING');
        console.log("✅ Tạo QR thành công, orderCode:", result.orderCode);
      } else {
        setPaymentStatus('ERROR');
        Alert.alert('Lỗi', 'Không tạo được mã QR thanh toán.');
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Tự động tạo QR khi component mount
  useEffect(() => {
    handleGenerateQR();
  }, []);

  // Kiểm tra thanh toán định kỳ mỗi 5 giây
  useEffect(() => {
    let interval;
    if (orderCode) {
      console.log("🔄 Bắt đầu kiểm tra trạng thái đơn hàng:", orderCode);

      interval = setInterval(async () => {
        try {
          console.log("🔍 Đang kiểm tra trạng thái...");
          setPaymentStatus('CHECKING');

          const { status, fullResponse } = await checkPaymentStatus(orderCode);
          console.log("📡 Trạng thái đơn hàng:", status);
          console.log("📋 Full response:", JSON.stringify(fullResponse, null, 2));

          if (status === 'PAID') {
            console.log("✅ Phát hiện đơn hàng đã thanh toán!");
            setPaymentStatus('PAID');
            clearInterval(interval);
            setIntervalRef(null);

            setTimeout(() => {
                Alert.alert(
                  '✅ Thành công',
                  'Bạn đã thanh toán thành công!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        console.log("👆 User đã nhấn OK, chuyển về Drawer");
                        navigation.navigate('Drawer');
                      },
                    },
                  ],
                  { cancelable: false } // Không cho phép đóng bằng cách tap bên ngoài
                );
              }, 100);

            // Tạo đơn hàng và vé sau khi thanh toán thành công
            try {
              console.log("🏗️ Đang tạo đơn hàng...");
              const bodyOrder = {
                eventId: eventId,
                userId: userId,
                amount: amount,
                bookingType: bookingType ?? 'none',
                ...((bookingType !== undefined || bookingType !== null || bookingType !== 'none') && {bookingId: bookingId}),
                totalPrice: totalPrice
              };

              const responseOrder = await AxiosInstance().post('orders/createOrder', bodyOrder);
              console.log("📦 Tạo đơn hàng thành công:", responseOrder.data);

              const bodyOrderTicket = {
                orderId: responseOrder.data,
                paymentId: "67bbc5a3ac06033b9e2ab3e9",
              };

              const responseOrderTicket = await AxiosInstance().post('orders/createTicket', bodyOrderTicket);
              console.log("🎫 Tạo vé thành công:", responseOrderTicket.data);

              // ✅ Log toàn bộ response khi đã thanh toán
              console.log('✅ Thông tin đơn hàng sau thanh toán:', fullResponse);

              console.log("🎉 Chuẩn bị hiển thị Alert...");

              // Đảm bảo Alert được gọi trên UI thread
              setTimeout(() => {
                Alert.alert(
                  '✅ Thành công',
                  'Bạn đã thanh toán thành công!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        console.log("👆 User đã nhấn OK, chuyển về Drawer");
                        navigation.navigate('Drawer');
                      },
                    },
                  ],
                  { cancelable: false } // Không cho phép đóng bằng cách tap bên ngoài
                );
              }, 100);

            } catch (orderError) {
              console.log('❌ Lỗi khi tạo đơn hàng/vé:', orderError);
              setPaymentStatus('ERROR');
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng liên hệ hỗ trợ.');
            }
          } else {
            console.log("⏳ Đơn hàng chưa được thanh toán, trạng thái:", status);
            setPaymentStatus('PENDING');
          }
        } catch (err) {
          console.log('❌ Lỗi khi kiểm tra đơn hàng:', err);
          setPaymentStatus('ERROR');
        }
      }, 5000);

      setIntervalRef(interval);
    } else {
      console.log("⚠️ Không có orderCode để kiểm tra");
    }

    return () => {
      if (interval) {
        console.log("🛑 Dừng kiểm tra trạng thái đơn hàng");
        clearInterval(interval);
        setIntervalRef(null);
      }
    };
  }, [orderCode]);

  // Cleanup khi component unmount hoặc navigation
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      console.log("🚪 User đang rời khỏi màn hình PayOS");

      // Dừng interval nếu đang chạy
      if (intervalRef) {
        clearInterval(intervalRef);
        setIntervalRef(null);
        console.log("🛑 Đã dừng interval khi rời màn hình");
      }

      // Reset các state
      setLoading(false);
      setPaymentStatus('PENDING');
    });

    return unsubscribe;
  }, [navigation, intervalRef]);

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <RowComponent onPress={() => navigation.goBack()} styles={{ columnGap: 25 }}>
          <Ionicons name="chevron-back" size={26} color="white" />
          <Text style={styles.headerTitle}>Thanh toán PayOS</Text>
        </RowComponent>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Quét mã QR để thanh toán</Text>
        <Text style={styles.amount}>
          Số tiền: {amount?.toLocaleString('vi-VN')} VND
        </Text>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={appColors.primary} />
            <Text style={styles.loadingText}>Đang tạo mã QR...</Text>
          </View>
        )}

        {qrData && !loading && (
          <View style={styles.qrContainer}>
            <QRCode value={qrData} size={250} />
            <Text style={styles.instruction}>Quét mã QR để thanh toán</Text>

            {/* Hiển thị trạng thái thanh toán */}
            {paymentStatus === 'PENDING' && (
              <Text style={[styles.statusText, { color: '#ff9500' }]}>
                ⏳ Đang chờ thanh toán...
              </Text>
            )}
            {paymentStatus === 'CHECKING' && (
              <Text style={[styles.statusText, { color: '#007aff' }]}>
                🔍 Đang kiểm tra thanh toán...
              </Text>
            )}
            {paymentStatus === 'PAID' && (
              <Text style={[styles.statusText, { color: '#34c759' }]}>
                ✅ Đã thanh toán thành công!
              </Text>
            )}
          </View>
        )}

        {/* Nút tạo lại QR nếu cần */}
        {!loading && (
          <Button
            title="Tạo lại mã QR"
            onPress={handleGenerateQR}
            color={appColors.primary}
          />
        )}
      </View>
    </View>
  );
};

export default PayOSQRScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === "ios" ? 66 : 22
  },
  headerTitle: {
    color: appColors.white2,
    fontSize: 22,
    fontWeight: "500"
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    color: appColors.primary,
    marginBottom: 30,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  qrContainer: {
    marginTop: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  instruction: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});