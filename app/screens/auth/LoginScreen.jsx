import React, {useEffect, useState} from 'react';
import {View, Switch, Text, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {appColors} from '../../constants/appColors';
import {Lock, Sms} from 'iconsax-react-native';
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
import {AxiosInstance} from '../../services';
import { HandleNotification } from '../../utils/handleNotification';
import { saveTokens } from '../../../app/token/authTokens';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, setRememberMe, setSavedCredentials } from '../../redux/slices/authSlice';
import { loginUser } from '../../services/authService';
import SocialLogin from './Components/SocialLogin';

const LoginScreen = ({navigation}) => {
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
      if (auth?.rememberMe && auth?.savedCredentials) {
        setEmail(auth.savedCredentials.email);
        setPassword(auth.savedCredentials.password);
        setIsRemember(true);
      }
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

  return (
    <ContainerComponent isImageBackground isScroll>
      <SectionComponent>
        <RowComponent>
          <Image
            style={{width: 162, height: 114}}
            source={require('../../../assets/images/icon-avatar.png')}
          />
        </RowComponent>
        <TextComponent size={24} title text="Sign in" />
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
          placeholder="Password"
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
              trackColor={{true: appColors.primary}}
              thumbColor={appColors.white}
              value={isRemember}
              onChange={() => setIsRemember(!isRemember)}
            />
            <TextComponent text="Remember me" />
          </RowComponent>
          <ButtonComponent
            text="Forgot Password?"
            onPress={() => navigation.navigate('ForgotPassword')}
            type="text"
          />
        </RowComponent>
      </SectionComponent>
      <SpaceComponent height={16} />
      <SectionComponent>
        <ButtonComponent onPress={handleLogin} text="SIGN IN" type="primary" />
      </SectionComponent>
      <SocialLogin navigation={navigation} />
      <SectionComponent>
        <RowComponent justify="center">
          <TextComponent text="Don't have an account?" />
          <ButtonComponent
            type="link"
            text=" Sign up"
            onPress={() => navigation.navigate('Register')}
          />
        </RowComponent>
      </SectionComponent>
      <LoadingModal visible={isLoading} />
    </ContainerComponent>
  );
};

export default LoginScreen;
