import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect} from 'react';
import {globalStyles} from '../../constants/globalStyles';
import {SpaceComponent} from '../../components';
import {appColors} from '../../constants/appColors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WelcomeScreen = ({navigation}) => {
  useEffect(() => {
    const checkAppStatus = async () => {
      try {
        const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');

        setTimeout(() => {
          if (!isFirstLaunch) {
            // Nếu là lần đầu tiên
            navigation.replace('Onbroading');
          } else if (token) {
            // Nếu đã đăng nhập trước đó
            navigation.replace('Drawer');
          } else {
            // Nếu chưa đăng nhập
            navigation.replace('Login');
          }
        }, 3000);
      } catch (error) {
        console.log('Lỗi kiểm tra trạng thái app:', error);
        navigation.replace('Login'); // fallback nếu lỗi
      }
    };

    checkAppStatus();
  }, [navigation]);

  return (
    <ImageBackground
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: appColors.white,
      }}
      source={require('../../../assets/images/splash-img.png')}
      imageStyle={{flex: 1}}>
      <Image
        source={require('../../../assets/images/logo.png')}
        style={{
          width: Dimensions.get('window').width * 0.7,
          resizeMode: 'contain',
        }}
      />
      <SpaceComponent height={20} />
      <ActivityIndicator color={appColors.gray} size={22} />
    </ImageBackground>
  );
};

export default WelcomeScreen;
