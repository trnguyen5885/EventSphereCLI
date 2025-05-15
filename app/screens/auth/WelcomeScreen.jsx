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
import {useSelector} from 'react-redux';

const WelcomeScreen = ({navigation}) => {
  const auth = useSelector(state => state.auth);
  useEffect(() => {
    console.log('🏁 WelcomeScreen - auth state:', auth);
    const checkFirstLaunch = async () => {
      const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
      console.log('📦 isFirstLaunch:', isFirstLaunch);

      setTimeout(async () => {
        if (isFirstLaunch === 'false') {
          if (auth.isAuthenticated && auth.rememberMe) {
            if (auth.userRole === 3) {
              console.log(
                'WelcomeScreen 30 | Điều hướng vào Home của người dùng',
              );
              navigation.replace('Drawer');
            } else if (auth.userRole === 2) {
              console.log(
                'WelcomeScreen 33 | Điều hướng vào Home của nhà tổ chức',
              );
              navigation.replace('OrganizerTabs');
            } else {
              console.log(
                'WelcomeScreen 37 | Vai trò không xác định. Điều hướng đến chọn vai trò hoặc Login',
              );
              navigation.replace('RoleSelection');
            }
          } else {
            console.log(
              'WelcomeScreen 42 | Không xác thực hoặc không ghi nhớ đăng nhập',
            );
            navigation.replace('RoleSelection');
          }
        } else {
          console.log('WelcomeScreen 51 | Lần đầu mở app');
          await AsyncStorage.setItem('isFirstLaunch', 'false');
          navigation.replace('Onbroading');
        }
      }, 2000);
    };

    checkFirstLaunch();
  }, [navigation]);
  return (
    <ImageBackground
      style={[
        globalStyles.container,
        {justifyContent: 'center', alignItems: 'center'},
      ]}
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
