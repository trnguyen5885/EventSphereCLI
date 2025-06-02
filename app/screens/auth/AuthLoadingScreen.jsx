import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../services/authService';
import { loginSuccess } from '../../redux/slices/authSlice';

const AuthLoadingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    const checkLogin = async () => {
      if (auth.rememberMe && auth.savedCredentials) {
        try {
          const { email, password } = auth.savedCredentials;
          const res = await loginUser(email, password); // Login bằng tài khoản người dùng thường
          const { id, role, ...userData } = res.data;

          dispatch(
            loginSuccess({
              userId: id,
              userData,
              role,
            }),
          );

          if (role === 2) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'OrganizerTabs' }],
            });
          } else if (role === 3) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Drawer' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }
        } catch (error) {
          console.log('Auto login failed:', error.message);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        }
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    };

    checkLogin();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default AuthLoadingScreen;
