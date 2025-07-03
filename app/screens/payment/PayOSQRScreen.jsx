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
  Share
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

  console.log("Amount", amount);
  console.log("EventName", eventName);
  console.log("UserId", userId);
  console.log("EventId", eventId);
  console.log("BookingType", bookingType);
  console.log("BookingId", bookingIds);
  console.log("TotalPrice", totalPrice);
  console.log("ShowtimeId", showtimeId);

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

        // Android 11+ (API 30+) sử dụng Scoped Storage
        if (apiLevel >= 30) {
          // Với Android 11+, không cần WRITE_EXTERNAL_STORAGE cho việc lưu vào Pictures/Downloads
          // Scoped Storage tự động cho phép truy cập
          console.log('Sử dụng Scoped Storage cho Android 11+');
          return true;
        } else {
          // Android 10 và thấp hơn vẫn cần quyền cũ
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
          // Android 11+ - Sử dụng nhiều phương pháp
          console.log('Lưu file cho Android 11+');

          // Phương pháp 1: Lưu vào Pictures directory (public)
          try {
            const picturesPath = RNFS.PicturesDirectoryPath || `${RNFS.ExternalStorageDirectoryPath}/Pictures`;
            const qrCodesPath = `${picturesPath}/QRCodes`;

            // Tạo thư mục QRCodes nếu chưa tồn tại
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
          // Android 10 và thấp hơn - sử dụng phương pháp cũ
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
          'Thành công',
          `Mã QR đã được lưu vào thư mục ${folderName}\n\nTên file: ${fileName}`,
          [
            { text: 'OK' },
            { text: 'Mở Thư mục', onPress: () => FileViewer.open(savedPath) }

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
      {/* Header */}
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
        {/* Payment Info Card */}
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
              {amount?.toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>

          <View style={styles.orderInfoContainer}>
            <Text style={styles.orderInfoText}>Mã đơn hàng: {orderCode || 'Đang tạo...'}</Text>
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Quét mã để thanh toán</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={appColors.primary} />
              <Text style={styles.loadingText}>Đang tạo mã QR...</Text>
            </View>
          ) : (
            <ViewShot ref={qrRef} options={{ format: "png", quality: 1.0 }}>
              <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                  {qrData && <QRCode value={qrData} size={220} />}
                </View>
                <Text style={styles.qrSubtitle}>
                  Mở app ngân hàng và quét mã QR này để thanh toán
                </Text>
              </View>
            </ViewShot>
          )}

          {/* Status Indicator */}
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor() + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
            {paymentStatus === 'CHECKING' && (
              <ActivityIndicator size="small" color={getStatusColor()} style={{ marginLeft: 8 }} />
            )}
          </View>

          {/* Action Buttons */}
          {qrData && !loading && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={downloadQRCode}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialIcons name="file-download" size={20} color="white" />
                )}
                <Text style={styles.downloadButtonText}>
                  {isDownloading ? 'Đang tải...' : 'Tải mã QR'}
                </Text>
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

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Hướng dẫn thanh toán</Text>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <Text style={styles.instructionText}>Mở ứng dụng ngân hàng trên điện thoại</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <Text style={styles.instructionText}>Chọn tính năng "Quét mã QR" hoặc "Chuyển khoản QR"</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>3</Text>
            </View>
            <Text style={styles.instructionText}>Quét mã QR trên màn hình này</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>4</Text>
            </View>
            <Text style={styles.instructionText}>Xác nhận thông tin và hoàn tất thanh toán</Text>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.supportContainer}>
          <Text style={styles.supportTitle}>Cần hỗ trợ?</Text>
          <Text style={styles.supportText}>
            Nếu gặp vấn đề trong quá trình thanh toán, vui lòng liên hệ bộ phận hỗ trợ khách hàng:
            <Text style={styles.phoneNumber} onPress={() => Linking.openURL('tel:0349535063')}>0349535063</Text>
          </Text>
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
  paymentCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  paymentHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  logoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  merchantName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: appColors.primary,
  },
  orderInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderInfoText: {
    fontSize: 14,
    color: '#666',
  },
  qrSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 12,
    minWidth: 140,
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: appColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 140,
    justifyContent: 'center',
  },
  regenerateButtonText: {
    color: appColors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  supportContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  phoneNumber: {
    color: appColors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

});

export default PayOSQRScreen;