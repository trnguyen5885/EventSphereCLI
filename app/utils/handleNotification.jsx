import { getMessaging, getToken, requestPermission } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosInstance } from '../services';
import { getTokens } from '../token/authTokens';
import { jwtDecode } from 'jwt-decode';

export class HandleNotification {
  static checkNotificationPermission = async () => {
    try {
      const messaging = getMessaging(getApp());
      const authStatus = await requestPermission(messaging);
      console.log("Notification permission status:", authStatus);

      if (authStatus === 1 || authStatus === 2) {
        await this.getFcmToken(messaging);
        this.listenTokenRefresh();
      } else {
        console.log("Notification permission denied");
      }
    } catch (error) {
      console.error('[ERROR] checkNotificationPermission:', error);
    }
  };

  static getFcmToken = async (messaging) => {
    try {
      const tokenData = await getTokens();
      if (!tokenData) {
        console.log("Chưa đăng nhập - Không gửi FCM token");
        return;
      }
      
      // Debug: Log the actual token data structure (commented out)
      // console.log('[DEBUG] tokenData type:', typeof tokenData);
      // console.log('[DEBUG] tokenData keys:', Object.keys(tokenData));
      // console.log('[DEBUG] tokenData:', JSON.stringify(tokenData, null, 2));
      
      // Validate and extract the token string
      let tokenString = null;
      if (typeof tokenData === 'string') {
        tokenString = tokenData;
      } else if (tokenData && typeof tokenData === 'object') {
        // Try different property names that might contain the JWT
        if (tokenData.accessToken && typeof tokenData.accessToken === 'string') {
          tokenString = tokenData.accessToken;
        } else if (tokenData.token && typeof tokenData.token === 'string') {
          tokenString = tokenData.token;  
        } else if (tokenData.authToken && typeof tokenData.authToken === 'string') {
          tokenString = tokenData.authToken;
        } else if (tokenData.jwt && typeof tokenData.jwt === 'string') {
          tokenString = tokenData.jwt;
        }
      }
      
      if (!tokenString) {
        console.error('[ERROR] getFcmToken: Invalid token format - must be a string');
        console.error('[ERROR] Expected string or object with accessToken/token property');
        return;
      }
      
      const userData = jwtDecode(tokenString); 
      let currentToken = await AsyncStorage.getItem('fcmtoken');

      if (!currentToken) {
        currentToken = await getToken(messaging);
        if (currentToken) {
          console.log('New FCM Token:', currentToken);
          await AsyncStorage.setItem('fcmtoken', currentToken);
        }
      }

      // userData có thể là object chứa id hoặc user._id
      let userId = userData?.user?.id || userData?.user?._id || userData?.id || userData?._id;
      if (!userId) {
        console.error('[ERROR] getFcmToken: Không tìm thấy userId trong token');
        return;
      }
      if (currentToken) {
        await this.updateTokenForUser(currentToken, userId.toString());
      }
    } catch (error) {
      console.error('[ERROR] getFcmToken:', error);
    }
  };

  static updateTokenForUser = async (newToken, userId) => {
    try {
      const body = { id: userId, fcmToken: newToken };
      console.log("Body: "+JSON.stringify(body));
      
      const response = await AxiosInstance().put('/users/fcmToken', body);
      console.log("FCM Token updated:", response.data);

    } catch (error) {
      console.error('[ERROR] updateTokenForUser:', error);
    }
  };

  static listenTokenRefresh = () => {
    const messaging = getMessaging(getApp());
    messaging.onTokenRefresh(async (refreshedToken) => {
      try {
        console.log("Token FCM đã được refresh:", refreshedToken);
        const persistData = await AsyncStorage.getItem('persist:auth');
        if (!persistData) return;

        const parsedPersist = JSON.parse(persistData);
        if (!parsedPersist.user) {
          console.error('[ERROR] onTokenRefresh: No user data found');
          return;
        }

        const userData = JSON.parse(parsedPersist.user);
        if (!userData || !userData.id) {
          console.error('[ERROR] onTokenRefresh: Invalid user data');
          return;
        }

        await this.updateTokenForUser(refreshedToken, userData.id.toString());
        await AsyncStorage.setItem('fcmtoken', refreshedToken);
      } catch (error) {
        console.error('[ERROR] onTokenRefresh:', error);
      }
    });
  };
}
