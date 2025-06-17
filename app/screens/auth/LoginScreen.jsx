import React, { useState } from 'react';
import {
  View, Image,
  Alert
} from 'react-native';

import {
  ContainerComponent, SectionComponent, TextComponent, RowComponent,
  ButtonComponent, SpaceComponent, InputComponent
} from '../../components';
import { Lock, Sms } from 'iconsax-react-native';
import LoadingModal from '../../modals/LoadingModal';
import { appColors } from '../../constants/appColors';
import { loginUser } from '../../services/authService';
import { AxiosInstance } from '../../services';

import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import SocialLogin from './Components/SocialLogin';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const validateInputs = () => {
    let isValid = true;
    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Email không hợp lệ');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);

    try {
      const response = await loginUser(email, password);

      if (response.status === 200) {
        const { id, token, refreshToken, role } = response.data;

        if (role !== 3) {
          setPasswordError('Tài khoản không phải người dùng');
          return;
        }

        // Lưu dữ liệu người dùng vào redux
        dispatch(
          loginSuccess({
            userId: id,
            userData: response.data,
          })
        );

        // Điều hướng sang màn hình chính
        navigation.reset({
          index: 0,
          routes: [{ name: 'Drawer' }],
        });
      } else {
        setPasswordError('Đăng nhập thất bại');
      }
    } catch (error) {
      setPasswordError(error.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Thông báo!', 'Bạn vui lòng nhập email cần đổi mật khẩu');
      return;
    }

    try {
      setIsLoading(true);
      const res = await AxiosInstance().post('users/forgotPassword/request', {
        email,
      });

      if (res.message === 'Đã gửi OTP về email') {
        navigation.navigate('OtpForgetPassword', { email });
      } else {
        alert(res.message || 'Đã xảy ra lỗi');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        Alert.alert('Thông báo', error.response.data.message);
      } else {
        Alert.alert('Thông báo','Email bạn nhập không đúng hoặc đã xảy ra lỗi, vui lòng thử lại!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContainerComponent isImageBackground isScroll>
      <SectionComponent>
        <RowComponent>
          <Image
            style={{ width: 162, height: 114 }}
            source={require('../../../assets/images/EventSphere.png')}
          />
        </RowComponent>
        <SpaceComponent height={16} />
        <TextComponent size={24} title text="Đăng nhập" />
        <SpaceComponent height={16} />
        <InputComponent
          value={email}
          placeholder="Email"
          onChange={val => {
            setEmail(val);
            setEmailError('');
          }}
          allowClear
          affix={<Sms size={22} color={appColors.gray} />}
        />
        {emailError ? <TextComponent color="red" text={emailError} /> : null}
        <SpaceComponent height={5} />
        <InputComponent
          value={password}
          placeholder="Mật khẩu"
          onChange={val => {
            setPassword(val);
            setPasswordError('');
          }}
          isPassword
          allowClear
          affix={<Lock size={22} color={appColors.gray} />}
        />
        {passwordError ? <TextComponent color="red" text={passwordError} /> : null}
        <RowComponent justify="flex-end">
          <ButtonComponent
            text="Quên mật khẩu?"
            onPress={handleForgotPassword}
            type="text"
          />
        </RowComponent>
        <SpaceComponent height={16} />
        <ButtonComponent onPress={handleLogin} text="ĐĂNG NHẬP" type="primary" />
      </SectionComponent>
      <SpaceComponent height={16} />
      <SectionComponent>
        <SocialLogin navigation={navigation} />
      </SectionComponent>
      
      <SectionComponent>
        <RowComponent justify="center">
          <TextComponent text="Chưa có tài khoản?" />
          <ButtonComponent
            type="link"
            text=" Đăng ký ngay"
            onPress={() => navigation.navigate('RegisterOrganizer')}
          />
        </RowComponent>
      </SectionComponent>
      
      <LoadingModal visible={isLoading} />
    </ContainerComponent>
  );
};

export default LoginScreen;