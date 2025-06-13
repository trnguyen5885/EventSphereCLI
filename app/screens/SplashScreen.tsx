import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { appInfo } from '../constants/appInfos';
import { SpaceComponent } from '../components';
import { appColors } from '../constants/appColors';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { userData, rememberMe } = useSelector(state => state.auth); // ✅ Lấy thêm rememberMe

  useEffect(() => {
    const checkFirstLaunchAndNavigate = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // đợi 2 giây

      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunchedBefore');

        if (!hasLaunched) {
          // Lần đầu mở app
          await AsyncStorage.setItem('hasLaunchedBefore', 'true');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        } else {
          // Không phải lần đầu, kiểm tra đăng nhập
          // ✅ Chỉ tự động đăng nhập khi có userData VÀ rememberMe = true
          if (userData && rememberMe) {
            if (userData.role === 3) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Drawer' }],
              });
            } else if (userData.role === 2) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'OrganizerTabs' }],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          } else {
            // ✅ Nếu không có rememberMe hoặc không có userData thì về Welcome
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    };

    checkFirstLaunchAndNavigate();
  }, [navigation, userData, rememberMe]); // ✅ Thêm rememberMe vào dependency

  return (
    <ImageBackground
      source={require('../../assets/images/splash-img.png')}
      style={styles.background}
      imageStyle={{ flex: 1 }}>
      <Image
        source={require('../../assets/images/EventSphere.png')}
        style={styles.logo}
      />
      <ActivityIndicator color={appColors.gray} size={22} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: appInfo.sizes.WIDTH * 0.7,
    resizeMode: 'contain',
  },
});

export default SplashScreen;