import {
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ButtonComponent,
  ContainerComponent,
  InputComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import {Call, Lock, Sms, User} from 'iconsax-react-native';
import LoadingModal from '../../modals/LoadingModal';
import {appColors} from '../../constants/appColors';
import {AxiosInstance} from '../../services';

const RegisterOrganizerScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let tempErrors = {};

    if (!username.trim()) {
      tempErrors.username = 'Vui lòng nhập Username';
    } else if (username.length < 3 || username.length > 20) {
      tempErrors.username = 'Tên người dùng phải từ 3 đến 20 ký tự';
    } else if (!/^[a-zA-ZÀ-ỹ0-9_ ]+$/.test(username)) {
      tempErrors.username = 'Tên người dùng không được chứa kí tự đặc biệt';
    }

    if (!email.trim()) {
      tempErrors.email = 'Vui lòng nhập Email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = 'Email không hợp lệ';
    }


    if (!password.trim()) {
      tempErrors.password = 'Vui lòng nhập Mật khẩu';
    } else if (password.length < 6 || password.length > 28) {
      tempErrors.password = 'Mật khẩu phải có từ 6 đến 28 ký tự';
    } else if (!/[A-Z]/.test(password)) {
      tempErrors.password = 'Mật khẩu phải chứa ít nhất một chữ cái in hoa';
    } else if (!/[a-z]/.test(password)) {
      tempErrors.password = 'Mật khẩu phải chứa ít nhất một chữ cái in thường';
    } else if (!/[0-9]/.test(password)) {
      tempErrors.password = 'Mật khẩu phải chứa ít nhất một chữ số';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      tempErrors.password = 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt';
    }

    if (!confirmPassword.trim()) {
      tempErrors.confirmPassword = 'Vui lòng nhập Xác nhận mật khẩu';
    } else if (confirmPassword !== password) {
      tempErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const body = {username, email, password, role: 2};
      const res = await AxiosInstance().post('users/register', body, 'post');

      if (res.status) {
        console.log(res.message);
        navigation.navigate('OtpOrganizerVerification', {email});
      }
    } catch (error) {
      setErrors(prev => ({...prev, email: 'Email đã tồn tại'}));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <ContainerComponent isImageBackground isScroll back>
            <SectionComponent>
              <TextComponent size={24} title text="Đăng ký Nhà Tổ Chức" />
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
              <SpaceComponent height={5} />

              <InputComponent
                value={email}
                placeholder="Email"
                onChange={val => setEmail(val)}
                allowClear
                affix={<Sms size={22} color={appColors.gray} />}
              />
              {errors.email && (
                <TextComponent color="red" text={errors.email} />
              )}
              <SpaceComponent height={5} />

              <InputComponent
                value={password}
                placeholder="Mật khẩu"
                onChange={val => setPassword(val)}
                isPassword
                allowClear
                affix={<Lock size={22} color={appColors.gray} />}
              />
              {errors.password && (
                <TextComponent color="red" text={errors.password} />
              )}
              <SpaceComponent height={5} />

              <InputComponent
                value={confirmPassword}
                placeholder="Nhập lại mật khẩu"
                onChange={val => setConfirmPassword(val)}
                isPassword
                allowClear
                affix={<Lock size={22} color={appColors.gray} />}
              />
              {errors.confirmPassword && (
                <TextComponent color="red" text={errors.confirmPassword} />
              )}
              <SpaceComponent height={5} />
            </SectionComponent>

            <SpaceComponent height={16} />
            <SectionComponent>
              <ButtonComponent
                onPress={handleRegister}
                text="ĐĂNG KÝ"
                type="primary"
              />
            </SectionComponent>

            <SectionComponent>
              <RowComponent justify="center">
                <TextComponent text="Đã có tài khoản?" />
                <ButtonComponent
                  type="link"
                  text=" Đăng nhập ngay"
                  onPress={() => navigation.navigate('LoginOrganizer')}
                />
              </RowComponent>
            </SectionComponent>

            <LoadingModal visible={isLoading} />
          </ContainerComponent>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegisterOrganizerScreen;

const styles = StyleSheet.create({});
