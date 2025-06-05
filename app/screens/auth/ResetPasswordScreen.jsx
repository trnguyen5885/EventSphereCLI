import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import {
    ContainerComponent,
    SectionComponent,
    TextComponent,
    InputComponent,
    ButtonComponent,
    SpaceComponent,
} from '../../components';
import { AxiosInstance } from '../../services';
import LoadingModal from '../../modals/LoadingModal';
import { Alert } from 'react-native';

const ResetPasswordScreen = ({ navigation, route }) => {
    const { email } = route.params;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!password || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ thông tin.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp.');
            return;
        }

        // Validate mật khẩu mạnh
        if (password.length < 6 || password.length > 28) {
            setError('Mật khẩu phải có từ 6 đến 28 ký tự.');
            return;
        }
        if (!/[A-Z]/.test(password)) {
            setError('Mật khẩu phải chứa ít nhất một chữ cái in hoa.');
            return;
        }
        if (!/[a-z]/.test(password)) {
            setError('Mật khẩu phải chứa ít nhất một chữ cái in thường.');
            return;
        }
        if (!/[0-9]/.test(password)) {
            setError('Mật khẩu phải chứa ít nhất một chữ số.');
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setError('Mật khẩu phải chứa ít nhất một ký tự đặc biệt.');
            return;
        }

        try {
            setIsLoading(true);
            const res = await AxiosInstance().post('users/forgotPassword/reset', {
                email,
                newPassword: password, // ✅ sửa "password" thành "newPassword"
            });

            if (res.message === 'Đặt lại mật khẩu thành công') {
                Alert.alert(
                    'Thành công',
                    'Bạn đã đặt lại mật khẩu mới thành công!',
                    [
                        {
                            text: 'Đăng nhập ngay',
                            onPress: () => navigation.navigate('Login'),
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                setError(res.message || 'Đổi mật khẩu thất bại.');
            }
        } catch (error) {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ContainerComponent isImageBackground back>
                    <SectionComponent>
                        <TextComponent title size={24} text="Đặt lại mật khẩu" />
                        <SpaceComponent height={20} />
                        <InputComponent
                            placeholder="Mật khẩu mới"
                            value={password}
                            onChange={val => {
                                setPassword(val);
                                setError('');
                            }}
                            isPassword
                        />
                        <SpaceComponent height={15} />
                        <InputComponent
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={val => {
                                setConfirmPassword(val);
                                setError('');
                            }}
                            isPassword
                        />
                        {error ? (
                            <TextComponent text={error} color="red" style={{ marginTop: 10 }} />
                        ) : null}
                        <SpaceComponent height={30} />
                        <ButtonComponent
                            text="Xác nhận"
                            onPress={handleResetPassword}
                            type="primary"
                            style={styles.confirmButton}
                            textStyle={styles.confirmText}
                        />
                    </SectionComponent>
                    <LoadingModal visible={isLoading} />
                </ContainerComponent>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    confirmButton: {
        backgroundColor: '#007bff',
        borderRadius: 10,
        paddingVertical: 12,
    },
    confirmText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ResetPasswordScreen;
