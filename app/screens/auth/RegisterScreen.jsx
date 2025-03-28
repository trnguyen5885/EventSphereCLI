import {StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ButtonComponent,
  ContainerComponent,
  InputComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';

import {Lock, Sms, User} from 'iconsax-react-native';
import { appColors } from '../../constants/appColors';
import SocialLogin from './Components/SocialLogin';
import { AxiosInstance } from '../../services';
  
const RegisterScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 🔹 Theo dõi người dùng nhập liệu để ẩn lỗi khi nhập đúng
  useEffect(() => {
    let tempErrors = {...errors};

    if (username.trim()) delete tempErrors.username;
    if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      delete tempErrors.email;
    if (password.trim() && password.length >= 6) delete tempErrors.password;
    if (confirmPassword.trim() && confirmPassword === password)
      delete tempErrors.confirmPassword;

    setErrors(tempErrors);
  }, [username, email, password, confirmPassword]);

  // 🔹 Kiểm tra lỗi đầu vào
  const validateForm = () => {
    let tempErrors = {};
    if (!username.trim()) tempErrors.username = 'Vui lòng nhập Username';
    if (!email.trim()) {
      tempErrors.email = 'Vui lòng nhập Email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) tempErrors.email = 'Email không hợp lệ';
    }

    if (!password.trim()) {
      tempErrors.password = 'Vui lòng nhập Mật khẩu';
    } else if (password.length < 6) {
      tempErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!confirmPassword.trim()) {
      tempErrors.confirmPassword = 'Vui lòng nhập Xác nhận mật khẩu';
    } else if (confirmPassword !== password) {
      tempErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // Trả về true nếu không có lỗi
  };

  // 🔹 Xử lý đăng ký tài khoản
  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const body = { username, email, password };
      const res = await AxiosInstance().post("users/login", body);

      if (res.status === 200 || res.status === 201) {
        navigation.navigate("Login");
      } else if (res.status === 400) {
        console.log("⚠️ Email đã tồn tại!");
      }
    } catch (error) {
      navigation.navigate("Login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ContainerComponent isImageBackground isScroll back>
        <SectionComponent>
          <TextComponent size={24} title text="Sign Up" />
          <SpaceComponent height={21} />
          <InputComponent
            value={username}
            placeholder="Username"
            onChange={val => setUsername(val)}
            allowClear
            affix={<User size={22} color={appColors.gray} />}
          />
          {errors.username && (
            <TextComponent color="red" text={errors.username} />
          )}

          <InputComponent
            value={email}
            placeholder="@abc@gmail.com"
            onChange={val => setEmail(val)}
            allowClear
            affix={<Sms size={22} color={appColors.gray} />}
          />
          {errors.email && <TextComponent color="red" text={errors.email} />}

          <InputComponent
            value={password}
            placeholder="Password"
            onChange={val => setPassword(val)}
            isPassword
            allowClear
            affix={<Lock size={22} color={appColors.gray} />}
          />
          {errors.password && (
            <TextComponent color="red" text={errors.password} />
          )}

          <InputComponent
            value={confirmPassword}
            placeholder="Confirm Password"
            onChange={val => setConfirmPassword(val)}
            isPassword
            allowClear
            affix={<Lock size={22} color={appColors.gray} />}
          />
          {errors.confirmPassword && (
            <TextComponent color="red" text={errors.confirmPassword} />
          )}
        </SectionComponent>
        <SpaceComponent height={16} />
        <SectionComponent>
          <ButtonComponent
            onPress={() => console.log('Hello World')}
            text="SIGN UP"
            type="primary"
          />
        </SectionComponent>

        {/* <SocialLogin /> */}

        <SectionComponent>
          <RowComponent justify="center">
            <TextComponent text="Already have an account?" />
            <ButtonComponent
              type="link"
              text="Sign in"
              onPress={() => navigation.navigate('Login')}
            />
          </RowComponent>
        </SectionComponent>

        {/* <LoadingModal visible={isLoading} /> */}
      </ContainerComponent>
    </>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({});
