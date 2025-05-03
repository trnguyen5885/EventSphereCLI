// NotificationService.js
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { AppState } from 'react-native';

export async function createNotificationChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });
}

export function setupForegroundNotificationHandler() {
  messaging().onMessage(async remoteMessage => {
    const { title, body } = remoteMessage.notification;

    if (AppState.currentState === 'active') {
      // Hiển thị local notification nếu app đang mở
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher', // bạn cần đảm bảo icon tồn tại ở res/drawable
        },
      });
    }
  });
}
