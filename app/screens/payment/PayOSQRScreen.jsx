import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  PermissionsAndroid,
  Linking,
  Share,
  ImageBackground,
  LinearGradient
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import createPaymentQRCode from '../../services/createPaymentQRCode';
import checkPaymentStatus from '../../services/checkPaymentStatus';
import { AxiosInstance } from '../../services';
import { RowComponent } from '../../components';
import { appColors } from '../../constants/appColors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { globalStyles } from '../../constants/globalStyles';
import FileViewer from 'react-native-file-viewer';

const { width, height } = Dimensions.get('window');

const PayOSQRScreen = ({ route, navigation }) => {
  const { amount, eventName, userId, eventId, bookingType, bookingIds, totalPrice, showtimeId } = route.params;
  const [qrData, setQrData] = useState(null);
  const [orderCode, setOrderCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [intervalRef, setIntervalRef] = useState(null);
  const [countdown, setCountdown] = useState(900); // 15 phút = 900 giây
  const [isDownloading, setIsDownloading] = useState(false);
  const qrRef = useRef();

  // Format thời gian countdown
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && paymentStatus === 'PENDING') {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setPaymentStatus('EXPIRED');
      if (intervalRef) {
        clearInterval(intervalRef);
        setIntervalRef(null);
      }
    }
  }, [countdown, paymentStatus]);

  // Hàm xin quyền truy cập storage cải tiến cho Android 11+
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const apiLevel = Platform.Version;
        console.log('Android API Level:', apiLevel);

        if (apiLevel >= 30) {
          console.log('Sử dụng Scoped Storage cho Android 11+');
          return true;
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Quyền truy cập bộ nhớ',
              message: 'Ứng dụng cần quyền truy cập bộ nhớ để lưu mã QR',
              buttonNeutral: 'Hỏi lại sau',
              buttonNegative: 'Hủy',
              buttonPositive: 'Đồng ý',
            },
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              'Cần cấp quyền',
              'Ứng dụng cần quyền truy cập bộ nhớ để lưu ảnh. Vui lòng vào Cài đặt > Ứng dụng > [Tên app] > Quyền để cấp quyền.',
              [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() }
              ]
            );
            return false;
          }
          return true;
        }
      } catch (err) {
        console.warn('Lỗi khi xin quyền:', err);
        return false;
      }
    }
    return true;
  };


  // Hàm tải mã QR với nhiều phương pháp fallback
  const downloadQRCode = async () => {
    if (!qrData) {
      Alert.alert('Lỗi', 'Không có mã QR để tải');
      return;
    }

    setIsDownloading(true);

    try {
      // Chụp ảnh QR code
      const uri = await qrRef.current.capture();
      console.log('URI ảnh QR:', uri);

      // Tạo tên file với timestamp
      const timestamp = new Date().getTime();
      const fileName = `QR_Payment_${orderCode}_${timestamp}.png`;

      const apiLevel = Platform.Version;
      let success = false;
      let savedPath = '';

      if (Platform.OS === 'android') {
        if (apiLevel >= 30) {
          console.log('Lưu file cho Android 11+');

          // Phương pháp 1: Lưu vào Pictures directory (public)
          try {
            const picturesPath = RNFS.PicturesDirectoryPath || `${RNFS.ExternalStorageDirectoryPath}/Pictures`;
            const qrCodesPath = `${picturesPath}/QRCodes`;

            const folderExists = await RNFS.exists(qrCodesPath);
            if (!folderExists) {
              await RNFS.mkdir(qrCodesPath);
              console.log('Tạo thư mục QRCodes thành công');
            }

            const filePath = `${qrCodesPath}/${fileName}`;
            await RNFS.copyFile(uri, filePath);

            savedPath = filePath;
            success = true;
            console.log('Lưu thành công vào Pictures/QRCodes:', filePath);
          } catch (error) {
            console.log('Lỗi lưu vào Pictures:', error);
          }

          // Phương pháp 2: Lưu vào Downloads directory
          if (!success) {
            try {
              const downloadsPath = RNFS.DownloadDirectoryPath || `${RNFS.ExternalStorageDirectoryPath}/Download`;
              const filePath = `${downloadsPath}/${fileName}`;
              await RNFS.copyFile(uri, filePath);

              savedPath = filePath;
              success = true;
              console.log('Lưu thành công vào Downloads:', filePath);
            } catch (error) {
              console.log('Lỗi lưu vào Downloads:', error);
            }
          }

          // Phương pháp 3: Lưu vào Documents directory của app (fallback)
          if (!success) {
            try {
              const documentsPath = RNFS.DocumentDirectoryPath;
              const filePath = `${documentsPath}/${fileName}`;
              await RNFS.copyFile(uri, filePath);

              savedPath = filePath;
              success = true;
              console.log('Lưu thành công vào Documents:', filePath);
            } catch (error) {
              console.log('Lỗi lưu vào Documents:', error);
            }
          }
        } else {
          const hasPermission = await requestStoragePermission();
          if (!hasPermission) {
            setIsDownloading(false);
            return;
          }

          try {
            const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;
            await RNFS.copyFile(uri, downloadDest);

            savedPath = downloadDest;
            success = true;
            console.log('Lưu thành công (Android cũ):', downloadDest);
          } catch (error) {
            console.log('Lỗi lưu file Android cũ:', error);
          }
        }
      } else {
        // iOS - Lưu vào Documents
        try {
          const documentsPath = RNFS.DocumentDirectoryPath;
          const filePath = `${documentsPath}/${fileName}`;
          await RNFS.copyFile(uri, filePath);

          savedPath = filePath;
          success = true;
          console.log('Lưu thành công iOS:', filePath);
        } catch (error) {
          console.log('Lỗi lưu file iOS:', error);
        }
      }

      if (success) {
        const folderName = savedPath.includes('Pictures') ? 'Pictures/QRCodes' :
          savedPath.includes('Download') ? 'Downloads' : 'Documents';

        Alert.alert(
          'Thành công!',
          `Mã QR đã được lưu thành công!\n\n📁 Vị trí: ${folderName}\n📄 Tên file: ${fileName}`,
          [
            { text: 'Đóng', style: 'cancel' },
            { text: 'Mở thư mục', onPress: () => FileViewer.open(savedPath) }
          ]
        );
      } else {
        throw new Error('Không thể lưu ảnh bằng bất kỳ phương pháp nào');
      }

    } catch (error) {
      console.error('Lỗi khi tải mã QR:', error);

      let errorMessage = 'Không thể tải mã QR. ';

      if (Platform.OS === 'android' && Platform.Version >= 30) {
        errorMessage += 'Hãy thử:\n\n' +
          '1. Kiểm tra quyền "File và phương tiện" trong Cài đặt ứng dụng\n' +
          '2. Hoặc sử dụng nút "Chia sẻ" để lưu ảnh\n' +
          '3. Khởi động lại ứng dụng và thử lại';
      } else {
        errorMessage += 'Vui lòng kiểm tra quyền truy cập bộ nhớ trong Cài đặt ứng dụng.';
      }

      Alert.alert('Lỗi', errorMessage, [
        { text: 'OK' },
        { text: 'Thử chia sẻ', onPress: () => shareQRCode() },
        { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() }
      ]);
    } finally {
      setIsDownloading(false);
    }
  };

  // Hàm tạo QR Code
  const handleGenerateQR = async () => {
    try {
      setLoading(true);
      setCountdown(900); // Reset countdown
      const result = await createPaymentQRCode(amount, eventName);

      setLoading(false);

      if (result && result.qrImage) {
        setQrData(result.qrImage);
        setOrderCode(result.orderCode);
        setPaymentStatus('PENDING');
        console.log("✅ Tạo QR thành công, orderCode:", result.orderCode);
      } else {
        setPaymentStatus('ERROR');
        Alert.alert('Lỗi', 'Không tạo được mã QR thanh toán.');
      }
    } catch (e) {
      console.log('Lỗi tạo QR:', e);
      setLoading(false);
      setPaymentStatus('ERROR');
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo mã QR. Vui lòng thử lại.');
    }
  };

  // Tự động tạo QR khi component mount
  useEffect(() => {
    handleGenerateQR();
  }, []);

  // Kiểm tra thanh toán định kỳ mỗi 5 giây
  useEffect(() => {
    let interval;
    if (orderCode && paymentStatus === 'PENDING') {
      console.log("🔄 Bắt đầu kiểm tra trạng thái đơn hàng:", orderCode);

      interval = setInterval(async () => {
        try {
          console.log("🔍 Đang kiểm tra trạng thái...");
          setPaymentStatus('CHECKING');

          const { status, fullResponse } = await checkPaymentStatus(orderCode);
          console.log("📡 Trạng thái đơn hàng:", status);

          if (status === 'PAID') {
            console.log("✅ Phát hiện đơn hàng đã thanh toán!");
            setPaymentStatus('PAID');
            clearInterval(interval);
            setIntervalRef(null);

            // Tạo đơn hàng và vé sau khi thanh toán thành công
            try {
              const bodyOrder = {
                eventId: eventId,
                userId: userId,
                amount: amount,
                bookingType: bookingType ?? 'none',
                ...(bookingType === 'zone' && bookingIds && { bookingIds: bookingIds }),
                totalPrice: totalPrice,
                showtimeId: showtimeId,
              };

              const responseOrder = await AxiosInstance().post('orders/createOrder', bodyOrder);
              console.log("📦 Tạo đơn hàng thành công:", responseOrder.data);

              const bodyOrderTicket = {
                orderId: responseOrder.data,
                paymentId: "67bbc5a3ac06033b9e2ab3e9",
              };

              const responseOrderTicket = await AxiosInstance().post('orders/createTicket', bodyOrderTicket);
              console.log("🎫 Tạo vé thành công:", responseOrderTicket.data);

              setTimeout(() => {
                Alert.alert(
                  '🎉 Thanh toán thành công',
                  'Đơn hàng của bạn đã được xử lý thành công!',
                  [
                    {
                      text: 'Xem đơn hàng',
                      onPress: () => navigation.navigate('Drawer'),
                    },
                  ],
                  { cancelable: false }
                );
              }, 500);

            } catch (orderError) {
              console.log('❌ Lỗi khi tạo đơn hàng/vé:', orderError);
              setPaymentStatus('ERROR');
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng liên hệ hỗ trợ.');
            }
          } else {
            setPaymentStatus('PENDING');
          }
        } catch (err) {
          console.log('❌ Lỗi khi kiểm tra đơn hàng:', err);
          setPaymentStatus('ERROR');
        }
      }, 5000);

      setIntervalRef(interval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        setIntervalRef(null);
      }
    };
  }, [orderCode, paymentStatus]);

  // Tự động tạo đơn hàng sau 5 giây
  // useEffect(() => {
  //   let timeout;

  //   console.log("⏰ Bắt đầu đếm ngược 5 giây để tạo đơn hàng...");

  //   timeout = setTimeout(async () => {
  //     try {
  //       console.log("🚀 Bắt đầu tạo đơn hàng sau 5 giây...");

  //       // Tạo đơn hàng
  //       const bodyOrder = {
  //         eventId: eventId,
  //         userId: userId,
  //         totalAmount: amount,
  //         bookingType: bookingType ?? 'none',
  //         ...(bookingType === 'zone' || bookingType === 'seat'
  //             ? { bookingIds: bookingIds }
  //             : {}),
  //         totalPrice: totalPrice,
  //         showtimeId: showtimeId,
  //       };

  //       console.log("BookingIds: "+bookingIds);
  //       console.log("Body: "+JSON.stringify(bodyOrder));

  //       const responseOrder = await AxiosInstance().post('orders/createOrder', bodyOrder);
  //       console.log("📦 Tạo đơn hàng thành công:", responseOrder.data);

  //       // Tạo vé
  //       const bodyOrderTicket = {
  //         orderId: responseOrder.data,
  //         paymentId: "67bbc5a3ac06033b9e2ab3e9",
  //       };

  //       const responseOrderTicket = await AxiosInstance().post('orders/createTicket', bodyOrderTicket);
  //       console.log("🎫 Tạo vé thành công:", responseOrderTicket.data);

  //       // Hiển thị thông báo thành công
  //       Alert.alert(
  //         '🎉 Tạo đơn hàng thành công',
  //         'Đơn hàng của bạn đã được tạo thành công!',
  //         [
  //           {
  //             text: 'Xem đơn hàng',
  //             onPress: () => navigation.navigate('Drawer', {
  //               screen: 'Home',
  //                   params: {
  //                     screen: 'Vé của tôi',
  //               },
  //             }),
  //           },
  //         ],
  //         { cancelable: false }
  //       );

  //     } catch (error) {
  //       console.log('❌ Lỗi khi tạo đơn hàng/vé:', error);
  //       Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
  //     }
  //   }, 5000); // 5 giây

  //   // Cleanup function
  //   return () => {
  //     if (timeout) {
  //       clearTimeout(timeout);
  //     }
  //   };
  // }, []); // Chỉ chạy 1 lần khi component mount

  // Cleanup khi component unmount
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (intervalRef) {
        clearInterval(intervalRef);
        setIntervalRef(null);
      }
      setLoading(false);
      setPaymentStatus('PENDING');
    });

    return unsubscribe;
  }, [navigation, intervalRef]);

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'PAID': return '#00C851';
      case 'ERROR': return '#FF4444';
      case 'EXPIRED': return '#FF8800';
      case 'CHECKING': return '#0099FF';
      default: return '#FFA500';
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'PAID': return '✅ Thanh toán thành công';
      case 'ERROR': return '❌ Có lỗi xảy ra';
      case 'EXPIRED': return '⏰ Mã QR đã hết hạn';
      case 'CHECKING': return '🔄 Đang xác nhận...';
      default: return '⏳ Chờ thanh toán';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header với gradient */}
      <View style={styles.header}>
        <RowComponent onPress={() => navigation.goBack()} styles={{ columnGap: 15 }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán QR</Text>
        </RowComponent>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={16} color="white" />
          <Text style={styles.timerText}>{formatTime(countdown)}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Payment Info Card với gradient */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>PayOS</Text>
            </View>
            <Text style={styles.merchantName}>{eventName}</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Số tiền thanh toán</Text>
            <Text style={styles.amountValue}>
              {totalPrice?.toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>

          <View style={styles.orderInfoContainer}>
            <View style={styles.orderCodeBadge}>
              <Ionicons name="receipt-outline" size={16} color="#666" />
              <Text style={styles.orderInfoText}>Mã đơn hàng: {orderCode || 'Đang tạo...'}</Text>
            </View>
          </View>
        </View>

        {/* QR Code Section với design mới */}
        <View style={styles.qrSection}>
          <View style={styles.qrTitleContainer}>
            <View style={styles.qrIconContainer}>
              <MaterialIcons name="qr-code-2" size={24} color={appColors.primary} />
            </View>
            <Text style={styles.qrTitle}>Quét mã để thanh toán</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={appColors.primary} />
              <Text style={styles.loadingText}>Đang tạo mã QR...</Text>
            </View>
          ) : (
            <ViewShot ref={qrRef} options={{ format: "png", quality: 1.0 }}>
              <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                  <View style={styles.qrFrame}>
                    {qrData && <QRCode value={qrData} size={200} />}
                  </View>
                  <View style={styles.qrBrandContainer}>
                    <Text style={styles.qrBrandText}>PayOS</Text>
                  </View>
                </View>
                <View style={styles.qrSubtitleContainer}>
                  <Ionicons name="phone-portrait-outline" size={16} color="#666" />
                  <Text style={styles.qrSubtitle}>
                    Mở app ngân hàng và quét mã QR để thanh toán
                  </Text>
                </View>
              </View>
            </ViewShot>
          )}

          {/* Status Indicator với design mới */}
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor() + '15' }]}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
            {paymentStatus === 'CHECKING' && (
              <ActivityIndicator size="small" color={getStatusColor()} />
            )}
          </View>

          {/* Enhanced Action Buttons */}
          {qrData && !loading && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.downloadButton]}
                onPress={downloadQRCode}
                disabled={isDownloading}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.buttonIcon}>
                    {isDownloading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <MaterialIcons name="file-download" size={20} color="white" />
                    )}
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonTitle}>
                      {isDownloading ? 'Đang tải xuống...' : 'Tải xuống'}
                    </Text>
                    <Text style={styles.buttonSubtitle}>
                      Lưu mã QR vào thư viện
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

            </View>
          )}

          {/* Regenerate Button */}
          {(paymentStatus === 'ERROR' || paymentStatus === 'EXPIRED') && (
            <TouchableOpacity
              style={styles.regenerateButton}
              onPress={handleGenerateQR}
              disabled={loading}
            >
              <Ionicons name="refresh" size={20} color={appColors.primary} />
              <Text style={styles.regenerateButtonText}>Tạo mã QR mới</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Enhanced Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="information-circle-outline" size={20} color={appColors.primary} />
            <Text style={styles.instructionsTitle}>Hướng dẫn thanh toán</Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionText}>Mở ứng dụng ngân hàng trên điện thoại</Text>
              <Text style={styles.instructionSubtext}>Hỗ trợ tất cả ngân hàng tại Việt Nam</Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionText}>Chọn tính năng "Quét mã QR" hoặc "Chuyển khoản QR"</Text>
              <Text style={styles.instructionSubtext}>Thường ở trang chủ hoặc menu chuyển khoản</Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>3</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionText}>Quét mã QR trên màn hình này</Text>
              <Text style={styles.instructionSubtext}>Đảm bảo camera có thể nhìn rõ toàn bộ mã QR</Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>4</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionText}>Xác nhận thông tin và hoàn tất thanh toán</Text>
              <Text style={styles.instructionSubtext}>Kiểm tra số tiền và thông tin trước khi xác nhận</Text>
            </View>
          </View>
        </View>

        {/* Enhanced Support Section */}
        <View style={styles.supportContainer}>
          <View style={styles.supportHeader}>
            <View style={styles.supportIcon}>
              <Ionicons name="headset-outline" size={20} color={appColors.primary} />
            </View>
            <Text style={styles.supportTitle}>Cần hỗ trợ?</Text>
          </View>
          <Text style={styles.supportText}>
            Nếu gặp vấn đề trong quá trình thanh toán, vui lòng liên hệ bộ phận hỗ trợ khách hàng 24/7:
          </Text>
          <TouchableOpacity
            style={styles.phoneContainer}
            onPress={() => Linking.openURL('tel:1900 1234')}
          >
            <Ionicons name="call" size={16} color={appColors.primary} />
            <Text style={styles.phoneNumber}>1900 1234</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },

  // Enhanced Payment Card Styles
  paymentCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  paymentHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 12,
    elevation: 4,
    shadowColor: appColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  merchantName: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9ff',
    borderRadius: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: appColors.primary,
    letterSpacing: 0.5,
  },
  orderInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  orderCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderInfoText: {
    fontSize: 14,
    color: '#5a6c7d',
    fontWeight: '500',
    marginLeft: 8,
  },

  // Enhanced QR Section Styles
  qrSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  qrTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  qrIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
    width: '100%',
  },
  qrWrapper: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  qrFrame: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: appColors.primary,
    borderStyle: 'dashed',
  },
  qrBrandContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  qrBrandText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: appColors.primary,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  qrSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },

  // Enhanced Status Container
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    width: '100%',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // Enhanced Button Styles
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  downloadButton: {
    backgroundColor: appColors.primary,
  },
  shareButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: appColors.primary,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  buttonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: appColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    minWidth: 160,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: appColors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  regenerateButtonText: {
    color: appColors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Enhanced Instructions Styles
  instructionsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
    elevation: 2,
    shadowColor: appColors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stepText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionContent: {
    flex: 1,
    paddingTop: 2,
  },
  instructionText: {
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 4,
  },
  instructionSubtext: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // Enhanced Support Section
  supportContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  supportText: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 22,
    marginBottom: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appColors.primary + '30',
  },
  phoneNumber: {
    color: appColors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },

  // Additional Enhancement Styles
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    opacity: 0.05,
  },
  pulseAnimation: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: appColors.primary,
    opacity: 0.1,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: appColors.primary,
    opacity: 0.6,
  },
  cornerDecoration: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: appColors.primary,
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: appColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  breathingDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: appColors.primary,
    opacity: 0.6,
  },
  rippleEffect: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: appColors.primary,
    opacity: 0.3,
  },
});

export default PayOSQRScreen;