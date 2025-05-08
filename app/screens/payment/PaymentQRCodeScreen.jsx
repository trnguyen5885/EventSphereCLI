import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Image, Platform } from 'react-native';
import { RowComponent } from '../../components';
import { appColors } from '../../constants/appColors';
import  Ionicons  from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../../constants/globalStyles';
import LoadingModal from '../../modals/LoadingModal';

const PaymentQRCodeScreen = ({navigation, route}) => {
    const [qrData, setQrData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(180); // 180 giây = 3 phút
    const [loading, setLoading] = useState(true);
    const {amount} = route.params
  
    // Gọi API để tạo VietQR
    const fetchQR = async () => {
        setLoading(true)
      try {
        const res = await fetch('https://api.vietqr.io/v2/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountNo: '0123456789',
            accountName: 'Công Ty TNHH EVENTSPHERE',
            acqId: '970422',
            amount: amount,
            addInfo: 'Thanh toan don hang 123',
            template: 'compact2',
          }),
        });
  
        const data = await res.json();
        setQrData(data.data.qrDataURL);
        setLoading(false)
      } catch (error) {
        console.error('Error fetching QR:', error);
        setLoading(false)
      } finally {
        setLoading(false);
      }
    };
  
    // Đếm ngược thời gian
    useEffect(() => {
      fetchQR();
  
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 1) {
            fetchQR()
            return 180;
          }
          return prev - 1;
        });
      }, 1000);
  
      return () => clearInterval(timer);
    }, []);
  
    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    if(loading) {
        return <LoadingModal />
    }
  
    return (
        <View style = {globalStyles.container}>
            <View style={styles.header}>
                    <RowComponent onPress={() => navigation.goBack()}  styles = {{columnGap: 25}}>
                        <Ionicons name="chevron-back" size={26} color="white" />  
                        <Text style = {styles.headerTitle} >QR Code</Text>
                    </RowComponent>
                </View>
         <View style={styles.container}>
            <Text style={styles.title}>Quét mã để thanh toán</Text>
            {timeLeft > 0 && qrData ? (
            <>
                <Text style={styles.timer}>Hết hạn sau: {formatTime(timeLeft)}</Text>
                <Image resizeMode='contain' source={{uri: qrData}}  style={styles.imageQr} />
            
            </>
            ) : (
            <Text style={styles.expired}>Mã QR đã hết hạn</Text>
            )}
        </View>
      </View>
    );
}

export default PaymentQRCodeScreen

const styles = StyleSheet.create({
      header: {
             flexDirection: 'row',
             alignItems: "center",
             justifyContent: 'space-between',
             padding: 10,
             backgroundColor: appColors.primary,
             paddingTop: Platform.OS === "ios" ? 66 : 22
            },
            headerTitle: {
            color: appColors.white2,
            fontSize: 22,
            fontWeight: "500" },
            container: {
                
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                backgroundColor: '#fff',
              },
      title: {
        fontSize: 20,
        marginBottom: 20,
      },
      imageQr: {
        width: 450,
        height: 450,
        marginTop: 10,

      },
      timer: {
        fontSize: 16,
        color: '#007aff',
      },
      expired: {
        fontSize: 18,
        color: 'red',
        marginVertical: 20,
      },
})