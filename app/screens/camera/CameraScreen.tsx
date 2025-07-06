import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
} from 'react-native-vision-camera';

const CameraScreen = () => {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front');

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  useEffect(() => {
    const getPermission = async () => {
      const status = await Camera.getCameraPermissionStatus();

      if (status !== 'granted') {
        const newStatus = await Camera.requestCameraPermission();
        setHasPermission(newStatus === 'granted');
        if (newStatus !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Camera access is required to continue.',
          );
        }
      } else {
        setHasPermission(true);
      }
    };

    getPermission();
  }, []);

  if (hasPermission === null || device == null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#666" />
        <Text>Checking camera permissions...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          Camera permission not granted.
        </Text>
        <Button
          title="Request Permission Again"
          onPress={async () => {
            const newStatus = await Camera.requestCameraPermission();
            setHasPermission(newStatus === 'granted');
          }}
        />
      </View>
    );
  }
  return (
    <Camera
      ref={cameraRef}
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      photo={true}
    />
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: 'red',
  },
});
