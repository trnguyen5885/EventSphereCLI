import React, { useEffect, useState } from 'react';
import { View, Switch, Text, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appColors } from '../../constants/appColors';
import { Lock, Sms } from 'iconsax-react-native';
import {
  ContainerComponent,
  SectionComponent,
  TextComponent,
  RowComponent,
  ButtonComponent,
  SpaceComponent,
  InputComponent,
} from '../../components/index';
import LoadingModal from '../../modals/LoadingModal';
import { AxiosInstance } from '../../services';
import { HandleNotification } from '../../utils/handleNotification';
import { saveTokens } from '../../../app/token/authTokens';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, setRememberMe, setSavedCredentials } from '../../redux/slices/authSlice';
import { loginUser } from '../../services/authService';

const LoginScreen = ({ navigation }) => {
  const [useId, setUseId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isRemember, setIsRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  // 🔹 Load email & password nếu "Remember Me" đã được bật
  useEffect(() => {
    const autoLoginIfRemembered = async () => {
      if (auth.rememberMe && auth.savedCredentials) {
        const { email, password } = auth.savedCredentials;
        setEmail(email);
        setPassword(password);
        setIsRemember(true);

        // Tự động đăng nhập
        setIsLoading(true);
        try {
          const response = await loginUser(email, password);
          if (response.status === 200 && response.data.role === 3) {
            dispatch(
              loginSuccess({
                userId: response.data.id,
                userData: response.data,
              })
            );
            navigation.reset({
              index: 0,
              routes: [{ name: 'Drawer' }],
            });
          }
        } catch (e) {
          console.log("Auto login failed:", e.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    autoLoginIfRemembered();
  }, []);

  const validateInputs = () => {
    let isValid = true;
    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Email không hợp lệ');
        isValid = false;
      } else {
        setEmailError('');
      }
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
      const res = await loginUser(email, password); // 👈 sử dụng loginUser
      const { id, token, refreshToken, role, ...userData } = res.data;

      dispatch(
        loginSuccess({
          userId: id,
          userData,
          role,
        }),
      );

      if (isRemember) {
        dispatch(setRememberMe(true));
        dispatch(setSavedCredentials({ email, password }));
      } else {
        dispatch(setRememberMe(false));
        dispatch(setSavedCredentials(null));
      }

      navigation.navigate('Drawer'); // hoặc navigation.reset(...)
    } catch (e) {
      console.log(e);
      setPasswordError('Email hoặc mật khẩu không chính xác');
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
        navigation.navigate('OtpForgetPassword', { email }); // 👈 Truyền email sang màn hình OTP
      } else {
        alert(res.message || 'Đã xảy ra lỗi');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        Alert.alert('Thông báo', error.response.data.message); // Hiển thị thông báo như "Email chưa đăng ký"
      } else {
        Alert.alert('Thông báo', 'Email bạn nhập không đúng hoặc đã xảy ra lỗi, vui lòng thử lại!');
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
            source={require('../../../assets/images/icon-avatar.png')}
          />
        </RowComponent>
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
        {passwordError ? (
          <TextComponent color="red" text={passwordError} />
        ) : null}
        <SpaceComponent height={5} />
        <RowComponent justify="space-between">
          <RowComponent onPress={() => setIsRemember(!isRemember)}>
            <Switch
              trackColor={{ true: appColors.primary }}
              thumbColor={appColors.white}
              value={isRemember}
              onChange={() => setIsRemember(!isRemember)}
            />
            <TextComponent text="Ghi nhớ tài khoản" />
          </RowComponent>
          <ButtonComponent
            text="Quên mật khẩu?"
            onPress={handleForgotPassword}
            type="text"
          />

        </RowComponent>
      </SectionComponent>
      <SpaceComponent height={16} />
      <SectionComponent>
        <ButtonComponent onPress={handleLogin} text="ĐĂNG NHẬP" type="primary" />
      </SectionComponent>
      {/* <SocialLogin /> */}
      <SectionComponent>
        <RowComponent justify="center">
          <TextComponent text="Chưa có tài khoản?" />
          <ButtonComponent
            type="link"
            text=" Đăng ký ngay"
            onPress={() => navigation.navigate('Register')}
          />
        </RowComponent>
      </SectionComponent>
      <LoadingModal visible={isLoading} />
    </ContainerComponent>
  );
};

export default LoginScreen;
