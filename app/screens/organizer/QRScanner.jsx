import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Vibration,
  BackHandler,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import AxiosInstance from '../../services/api/AxiosInstance';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../../../app/constants/appColors';

const {width, height} = Dimensions.get('window');

export default function QRScanner({route, navigation}) {
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const scanned = useRef(false);
  
  // States
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const [lastScannedCode, setLastScannedCode] = useState('');
  
  // Animation values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const cornerAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Lấy eventId từ route params
  const {eventId, eventName} = route.params || {};
  console.log('Event ID:', eventId, 'Event Name:', eventName);

  // Animation cho đường scan
  useEffect(() => {
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    scanAnimation.start();
    return () => scanAnimation.stop();
  }, []);

  // Animation cho góc khung
  useEffect(() => {
    const cornerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(cornerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    cornerAnimation.start();
    return () => cornerAnimation.stop();
  }, []);

  // Animation pulse khi quét thành công
  const startPulseAnimation = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Xử lý back button
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        '🔙 Thoát quét QR',
        'Bạn có chắc chắn muốn thoát?',
        [
          {text: 'Không', style: 'cancel'},
          {text: 'Có', onPress: () => navigation.goBack()},
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const verifyTicket = async (ticketId) => {
    try {
      setIsScanning(false);
      const axiosJWT = AxiosInstance();
      const response = await axiosJWT.post('tickets/verify-ticket', {
        ticketId: ticketId,
        // eventId: eventId
      });
      console.log('Xác thực vé:', response.data);

      if (response.data.success === true) {
        // Hiệu ứng thành công
        Vibration.vibrate([100, 100, 100]);
        startPulseAnimation();
        setScanCount(prev => prev + 1);
        setLastScannedCode(ticketId);

        Alert.alert(
          '✅ Xác thực thành công',
          `${response.data.message || 'Vé hợp lệ'}\n\nMã vé: ${ticketId}\nSố vé đã quét: ${scanCount + 1}`,
          [
            {
              text: 'Quét tiếp',
              onPress: () => {
                setTimeout(() => {
                  scanned.current = false;
                  setIsScanning(true);
                }, 1000);
              },
            },
            {
              text: 'Hoàn thành',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // Hiệu ứng thất bại
        Vibration.vibrate([200, 100, 200]);
        
        Alert.alert(
          '❌ Xác thực thất bại',
          `${response.data.message || 'Vé không hợp lệ'}\n\nMã vé: ${ticketId}`,
          [
            {
              text: 'Thử lại',
              onPress: () => {
                setTimeout(() => {
                  scanned.current = false;
                  setIsScanning(true);
                }, 1000);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Lỗi khi xác thực vé:', error);
      Vibration.vibrate([200, 100, 200, 100, 200]);
      
      Alert.alert(
        '⚠️ Lỗi kết nối',
        'Không thể xác thực vé. Vui lòng kiểm tra kết nối mạng và thử lại.',
        [
          {
            text: 'Thử lại',
            onPress: () => {
              setTimeout(() => {
                scanned.current = false;
                setIsScanning(true);
              }, 1000);
            },
          },
        ]
      );
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      if (scanned.current || !isScanning) return;
      scanned.current = true;

      for (const code of codes) {
        if (code.value) {
          // Kiểm tra không quét trùng mã trong 30 giây
          if (lastScannedCode === code.value) {
            Alert.alert(
              '⚠️ Mã đã quét',
              'Mã QR này vừa được quét. Vui lòng quét mã khác.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setTimeout(() => {
                      scanned.current = false;
                      setIsScanning(true);
                    }, 1000);
                  },
                },
              ]
            );
            return;
          }
          
          // Hiệu ứng âm thanh/rung khi quét
          Vibration.vibrate(100);
          verifyTicket(code.value);
        } else {
          Alert.alert('❌ Lỗi', 'Không đọc được mã QR', [
            {
              text: 'OK',
              onPress: () => {
                setTimeout(() => {
                  scanned.current = false;
                  setIsScanning(true);
                }, 1000);
              },
            },
          ]);
        }
      }
    },
  });

  useEffect(() => {
    requestPermission();
  }, []);

  // Kiểm tra xem có eventId không
  useEffect(() => {
    if (!eventId) {
      Alert.alert('⚠️ Lỗi', 'Không tìm thấy thông tin sự kiện');
    }
  }, [eventId]);

  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn);
  };

  const pauseScanning = () => {
    setIsScanning(!isScanning);
  };

  if (!hasPermission || !device) {
    return (
      <View style={styles.center}>
        <Icon name="camera-alt" size={60} color="#ccc" />
        <Text style={styles.permissionText}>
          🔒 Cần cấp quyền camera hoặc không tìm thấy thiết bị
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={isScanning ? codeScanner : undefined}
        torch={isFlashOn ? 'on' : 'off'}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quét vé</Text>
        <TouchableOpacity style={styles.headerButton} onPress={toggleFlash}>
          <Icon name={isFlashOn ? 'flash-on' : 'flash-off'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Overlay khung QR */}
      <View style={styles.overlay}>
        <Animated.View style={[styles.frame, {transform: [{scale: pulseAnim}]}]}>
          {/* Đường scan */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [
                  {
                    translateY: scanLineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, FRAME_SIZE - 4],
                    }),
                  },
                ],
              },
            ]}
          />
          
          {/* Các góc khung */}
          <Animated.View
            style={[
              styles.corner,
              styles.topLeft,
              {transform: [{scale: cornerAnim}]},
            ]}
          />
          <Animated.View
            style={[
              styles.corner,
              styles.topRight,
              {transform: [{scale: cornerAnim}]},
            ]}
          />
          <Animated.View
            style={[
              styles.corner,
              styles.bottomLeft,
              {transform: [{scale: cornerAnim}]},
            ]}
          />
          <Animated.View
            style={[
              styles.corner,
              styles.bottomRight,
              {transform: [{scale: cornerAnim}]},
            ]}
          />
        </Animated.View>

        {/* Thông tin hướng dẫn */}
        <View style={styles.infoContainer}>
          <Text style={styles.hint}>
            {isScanning ? '📷 Đưa mã QR vào giữa khung' : '⏸️ Đã tạm dừng quét'}
          </Text>
          {eventName && (
            <Text style={styles.eventInfo}>
              🎫 Sự kiện: {eventName}
            </Text>
          )}
          {scanCount > 0 && (
            <Text style={styles.scanCount}>
              ✅ Đã quét: {scanCount} vé
            </Text>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isScanning ? styles.pauseButton : styles.playButton]}
          onPress={pauseScanning}>
          <Icon name={isScanning ? 'pause' : 'play-arrow'} size={24} color="#fff" />
          <Text style={styles.controlButtonText}>
            {isScanning ? 'Tạm dừng' : 'Tiếp tục'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.flashButton]}
          onPress={toggleFlash}>
          <Icon name={isFlashOn ? 'flash-on' : 'flash-off'} size={24} color="#fff" />
          <Text style={styles.controlButtonText}>
            {isFlashOn ? 'Tắt đèn' : 'Bật đèn'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const FRAME_SIZE = 260;
const CORNER_SIZE = 30;
const BORDER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: appColors.primary,
    shadowColor: appColors.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  corner: {
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    position: 'absolute',
    borderColor: appColors.primary,
    shadowColor: appColors.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderBottomRightRadius: 8,
  },
  infoContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  hint: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#000',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  eventInfo: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 5,
    textShadowColor: '#000',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  scanCount: {
    color: '#00FF00',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    zIndex: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pauseButton: {
    backgroundColor: appColors.primary,
  },
  playButton: {
    backgroundColor: 'rgba(0,255,0,0.8)',
  },
  flashButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
});