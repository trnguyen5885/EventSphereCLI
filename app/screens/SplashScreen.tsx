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
  const { userData } = useSelector(state => state.auth);

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
          if (userData) {
            if (userData.role === 3) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Drawer' }],
              });
            } else if (userData.role === 2) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginOrganizer' }],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          } else {
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
          routes: [{ name: 'Login' }],
        });
      }
    };

    checkFirstLaunchAndNavigate();
  }, [navigation, userData]);

  return (
    <ImageBackground
      source={require('../../assets/images/splash-img.png')}
      style={styles.background}
      imageStyle={{ flex: 1 }}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
      />
      <SpaceComponent height={16} />
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
