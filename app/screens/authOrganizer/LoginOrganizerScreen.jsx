import React, { useEffect, useState } from 'react';
import {
  View, Switch, Image
} from 'react-native';

import {
  ContainerComponent, SectionComponent, TextComponent, RowComponent,
  ButtonComponent, SpaceComponent, InputComponent
} from '../../components';
import { Lock, Sms } from 'iconsax-react-native';
import LoadingModal from '../../modals/LoadingModal';
import { appColors } from '../../constants/appColors';
import { loginOrganizer } from '../../services/authService';

import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, setRememberMe, setSavedCredentials } from '../../redux/slices/authSlice';


const LoginOrganizerScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const [isRemember, setIsRemember] = useState(false);
  const [res, setRes] = useState({});


  useEffect(() => {
    if (auth.rememberMe && auth.savedCredentials) {
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
      const response = await loginOrganizer(email, password); // Gọi API đăng nhập

      if (response.status === 200) {
        const { id, token, refreshToken, role } = response.data;

        if (role !== 2) {
          setPasswordError('Tài khoản không phải nhà tổ chức');
          return;
        }

        // Lưu dữ liệu người dùng vào redux
        dispatch(
          loginSuccess({
            userId: id,
            userData: response.data,
          })
        );

        // Lưu thông tin ghi nhớ tài khoản nếu cần
        if (isRemember) {
          dispatch(setRememberMe(true));
          dispatch(setSavedCredentials({ email, password }));
        } else {
          dispatch(setRememberMe(false));
          dispatch(setSavedCredentials({ email: '', password: '' }));
        }

        // Điều hướng sang màn hình chính
        navigation.navigate('OrganizerTabs');
      } else {
        setPasswordError('Đăng nhập thất bại');
      }
    } catch (error) {
      setPasswordError(error.message || 'Đăng nhập thất bại');
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
        <TextComponent size={24} title text="Organizer Sign in" />
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
        {passwordError ? <TextComponent color="red" text={passwordError} /> : null}
        <RowComponent onPress={() => {
          setIsRemember(!isRemember);
          dispatch(setRememberMe(!isRemember));
        }}>
          <Switch
            trackColor={{ true: appColors.primary }}
            thumbColor={appColors.white}
            value={isRemember}
            onChange={() => {
              const newVal = !isRemember;
              setIsRemember(newVal);
              dispatch(setRememberMe(newVal));
            }}
          />
          <TextComponent text="Remember me" />
        </RowComponent>
        <SpaceComponent height={16} />
        <ButtonComponent onPress={handleLogin} text="SIGN IN" type="primary" />
      </SectionComponent>
      <SectionComponent>
        <RowComponent justify="center">
          <TextComponent text="Don't have an account?" />
          <ButtonComponent
            type="link"
            text=" Sign up"
            onPress={() => navigation.navigate('RegisterOrganizer')}
          />
        </RowComponent>
      </SectionComponent>
      <LoadingModal visible={isLoading} />
    </ContainerComponent>
  );
};

export default LoginOrganizerScreen;
