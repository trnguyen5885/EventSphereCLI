import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {
  ContainerComponent,
  TextComponent,
  SectionComponent,
  ButtonComponent,
  SpaceComponent,
} from '../../components';
import { appColors } from '../../constants/appColors';
import LoadingModal from '../../modals/LoadingModal';
import SuccessModal from '../../modals/SuccessModal';
import { AxiosInstance } from '../../services';

const CELL_COUNT = 6; // Số ô nhập OTP

const OtpVerificationScreen = ({ navigation, route }) => {
  const { email } = route.params || {}; // Nhận email từ màn hình đăng ký
  const [value, setValue] = useState('');
  const [timer, setTimer] = useState(60); // Thời gian đếm ngược để gửi lại mã
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // Đếm ngược thời gian để gửi lại mã OTP
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(seconds => seconds - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Format thời gian đến dạng 0:xx
  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  // Gửi lại mã OTP
  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      // Gọi API để gửi lại mã OTP
      const res = await AxiosInstance().post('users/resend-otp', { email }, 'post');

      if (res.status) {
        setTimer(60); // Reset timer
        setError('');
      }
    } catch (error) {
      setError('Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xác thực OTP
  const verifyOTP = async () => {
    if (value.length !== CELL_COUNT) {
      setError('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    setIsLoading(true);
    try {
      const body = {
        email,
        otp: value
      };
      
      const res = await AxiosInstance().post('users/verify-otp', body, 'post');
      
      if (res.status) {
        // Hiển thị modal thành công thay vì Alert
        setSuccessModalVisible(true);
      }
    } catch (error) {
      setError('Mã OTP không đúng hoặc đã hết hạn');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đóng modal và chuyển đến trang Login
  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ContainerComponent isImageBackground back>
          <SectionComponent>
            <TextComponent size={24} title text="Verification" />
            <SpaceComponent height={10} />
            <TextComponent
              text={`We've sent you the verification code to ${email}`}
            />
            <SpaceComponent height={30} />

            <CodeField
              ref={ref}
              {...props}
              value={value}
              onChangeText={setValue}
              cellCount={CELL_COUNT}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({ index, symbol, isFocused }) => (
                <View
                  key={index}
                  style={[
                    styles.cell,
                    isFocused && styles.focusCell,
                    symbol && styles.filledCell,
                  ]}
                  onLayout={getCellOnLayoutHandler(index)}>
                  <TextComponent
                    size={24}
                    text={symbol || (isFocused ? <Cursor /> : '')}
                    style={styles.cellText}
                  />
                </View>
              )}
            />

            {error ? (
              <TextComponent color="red" text={error} style={styles.errorText} />
            ) : null}

            <SpaceComponent height={30} />

            <ButtonComponent
              onPress={verifyOTP}
              text="CONTINUE"
              type="primary"
              icon="arrow-right"
            />

            <SpaceComponent height={20} />

            <View style={styles.resendContainer}>
              <TextComponent
                text="Re-send code in "
                style={styles.resendText}
              />
              <TouchableWithoutFeedback
                onPress={timer === 0 ? handleResendOTP : null}>
                <TextComponent
                  text={formatTime(timer)}
                  color={timer === 0 ? appColors.primary : appColors.gray}
                  style={styles.timerText}
                />
              </TouchableWithoutFeedback>
            </View>
          </SectionComponent>

          <SuccessModal
            visible={successModalVisible}
            message="Bạn đã đăng ký tài khoản thành công"
            onClose={handleCloseSuccessModal}
          />

          <LoadingModal visible={isLoading} />
        </ContainerComponent>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  codeFieldRoot: {
    marginTop: 20,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  cell: {
    width: 48, // Giảm kích thước mỗi ô để vừa với 6 ô
    height: 48, // Giảm kích thước mỗi ô để vừa với 6 ô
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    marginHorizontal: 5, // Giảm khoảng cách giữa các ô
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  focusCell: {
    borderColor: appColors.primary,
  },
  filledCell: {
    borderColor: appColors.primary,
    backgroundColor: '#F5F8FF',
  },
  cellText: {
    textAlign: 'center',
    fontSize: 20, // Giảm kích thước font chữ để phù hợp với ô nhỏ hơn
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  resendText: {
    textAlign: 'center',
  },
  timerText: {
    fontWeight: 'bold',
  },
  errorText: {
    marginTop: 10,
    textAlign: 'center',
  }
});

export default OtpVerificationScreen;