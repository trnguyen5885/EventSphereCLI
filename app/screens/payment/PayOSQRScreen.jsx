import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import createPaymentQRCode from '../../services/createPaymentQRCode';
import checkPaymentStatus from '../../services/checkPaymentStatus';
import {AxiosInstance} from '../../services';


const PayOSQRScreen = ({ route, navigation }) => {
  const { amount, eventName, userId, eventId } = route.params;
  const [qrData, setQrData] = useState(null);
  const [orderCode, setOrderCode] = useState(null);
  const [loading, setLoading] = useState(false);

  // Kiểm tra thanh toán định kỳ mỗi 5 giây
  useEffect(() => {
    let interval;
    if (orderCode) {
      interval = setInterval(async () => {
        try {
          const { status, fullResponse } = await checkPaymentStatus(orderCode);
          console.log("📡 Trạng thái đơn hàng:", status);

          if (status === 'PAID') {
            clearInterval(interval);

             const bodyOrder = {
             eventId: eventId,
             userId: userId,
             amount: amount,
            };

           const responseOrder = await AxiosInstance().post('orders/createOrder',bodyOrder);

           const bodyOrderTicket = {
            orderId: responseOrder.data,
            paymentId: "67bbc5a3ac06033b9e2ab3e9",
          };

          const responseOrderTicket = await AxiosInstance().post('orders/createTicket',bodyOrderTicket);

            

            // ✅ Log toàn bộ response khi đã thanh toán
            console.log('✅ Thông tin đơn hàng sau thanh toán:', fullResponse);
            console.log('Tạo vé thành công', responseOrderTicket.data)

            Alert.alert('✅ Thành công', 'Bạn đã thanh toán thành công!', [
               {
                text: 'OK',
                onPress: () => {
                  // Chỉ quay lại khi người dùng bấm OK
                  navigation.navigate('Drawer');
                },
              },
            ]);
          }
        } catch (err) {
          console.log('❌ Lỗi khi kiểm tra đơn hàng:', err);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [orderCode]);


  const handleGenerateQR = async () => {
    try {
       setLoading(true);
    const result = await createPaymentQRCode(amount, eventName);

    setLoading(false);

    if (result && result.qrImage) {
      setQrData(result.qrImage); // chuỗi QR
      setOrderCode(result.orderCode); // cần để check status
    } else {
      Alert.alert('Lỗi', 'Không tạo được mã QR thanh toán.');
    }
    } catch(e) {
      console.log(e)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán bằng mã QR</Text>
      <Button title="Tạo mã QR" onPress={handleGenerateQR} />
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      {qrData && (
        <View style={styles.qrContainer}>
          <QRCode value={qrData} size={250} />
          <Text style={{ marginTop: 10 }}>Quét mã QR để thanh toán</Text>
        </View>
      )}
    </View>
  );
};

export default PayOSQRScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  qrContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
});
