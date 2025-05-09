import {
  getMessaging,
  getToken,
  requestPermission,
} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AxiosInstance} from '../services';

export class HandleNotification {
  static checkNotificationPermission = async () => {
    try {
      const messaging = getMessaging(getApp());
      const authStatus = await requestPermission(messaging);
      console.log('Notification permission status:', authStatus);

      if (authStatus === 1 || authStatus === 2) {
        await this.getFcmToken(messaging);
        this.listenTokenRefresh();
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('[ERROR] checkNotificationPermission:', error);
    }
  };

  static getFcmToken = async messaging => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const tokenData = await AsyncStorage.getItem('userToken');
      let currentToken = await AsyncStorage.getItem('fcmtoken');

      if (!userId) {
        console.log('Chưa đăng nhập - Không gửi FCM token');
        return;
      }

      if (!currentToken) {
        currentToken = await getToken(messaging);
        if (currentToken) {
          console.log('New FCM Token:', currentToken);
          await AsyncStorage.setItem('fcmtoken', currentToken);
        }
      }

      if (currentToken) {
        await this.updateTokenForUser(currentToken, userId, tokenData);
      }
    } catch (error) {
      // console.error('[ERROR] getFcmToken:', error);
    }
  };

  static updateTokenForUser = async (newToken, userId, tokenData) => {
    try {
      const axios = AxiosInstance(tokenData);
      const body = {id: userId, fcmToken: newToken};

      const response = await axios.put('/users/fcmToken', body);
      console.log('✅ FCM Token updated:', response.data);
    } catch (error) {
      console.error('[ERROR] updateTokenForUser:', error);
    }
  };

  static listenTokenRefresh = () => {
    const messaging = getMessaging(getApp());
    messaging.onTokenRefresh(async refreshedToken => {
      try {
        console.log('🔄 Token FCM đã được refresh:', refreshedToken);
        const persistData = await AsyncStorage.getItem('persist:auth');
        if (!persistData) return;

        const parsedPersist = JSON.parse(persistData);
        const userData = JSON.parse(parsedPersist.user);
        const tokenData = JSON.parse(parsedPersist.token || 'null');

        await this.updateTokenForUser(refreshedToken, userData.id, tokenData);
        await AsyncStorage.setItem('fcmtoken', refreshedToken);
      } catch (error) {
        console.error('[ERROR] onTokenRefresh:', error);
      }
    });
  };
}
