// ScanQRCodeScreen.js
import React, { useEffect, useState } from 'react';
// import { RNCamera } from 'react-native-camera';
import { View, Text, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền truy cập camera',
            message: 'Ứng dụng cần quyền truy cập camera để quét mã QR',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          },
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasPermission(true);
      }
    })();
  }, []);

  const onBarCodeRead = ({ data }) => {
    Alert.alert('QR Data', data);
  };

  if (!hasPermission) {
    return (
      <View style={styles.overlay}>
        <Text style={styles.centerText}>Ứng dụng chưa có quyền camera.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <RNCamera
        style={StyleSheet.absoluteFill}
        onBarCodeRead={onBarCodeRead}
        captureAudio={false}
      >
        <View style={styles.overlay}>
          <Text style={styles.centerText}>Đưa mã QR vào giữa khung camera để quét.</Text>
        </View>
      </RNCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center'
  },
  centerText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default CameraScreen;
