import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { AppState, Platform } from 'react-native';

// Tạo channel thông báo trên Android với debug
export async function createNotificationChannel() {
  try {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
    console.log('✅ Đã tạo channel với ID:', channelId);
    return channelId;
  } catch (error) {
    console.error('❌ Lỗi tạo channel:', error);
    return null;
  }
}

// Kiểm tra quyền thông báo
export async function checkNotificationPermission() {
  try {
    const authStatus = await messaging().requestPermission();
    console.log('🔐 Trạng thái quyền FCM:', authStatus);
    
    // Kiểm tra token FCM
    const fcmToken = await messaging().getToken();
    console.log('📲 FCM Token:', fcmToken);
    
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error('❌ Lỗi kiểm tra quyền:', error);
    return false;
  }
}

// Xử lý thông báo khi app đang mở (foreground) với debugging
export function setupForegroundNotificationHandler() {
  // Kiểm tra quyền khi khởi tạo
  checkNotificationPermission();
  
  // Đăng ký lắng nghe sự kiện thông báo
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('💬 Đã nhận FCM message:', JSON.stringify(remoteMessage));
    
    // Kiểm tra thông tin từ remote message
    const { notification, data } = remoteMessage;
    console.log('💬 Notification object:', notification);
    console.log('💬 Data:', data);
    
    // Kiểm tra trạng thái app
    console.log('📱 AppState hiện tại:', AppState.currentState);
    
    // Lấy title và body từ notification object
    const title = notification?.title;
    const body = notification?.body;
    
    console.log('📝 Title:', title);
    console.log('📝 Body:', body);
    
    // Nếu app đang ở trạng thái active và có nội dung thông báo
    if (title && body) {
      try {
        // Đảm bảo channel đã được tạo
        await createNotificationChannel();
        
        const notificationId = await notifee.displayNotification({
          title,
          body,
          android: {
            channelId: 'default',
            smallIcon: 'ic_launcher',
            importance: AndroidImportance.HIGH,
            sound: 'default',
            pressAction: {
              id: 'default',
              launchActivity: 'default',
            },
          },
          ios: {
            // Cấu hình cho iOS nếu cần
            badgeCount: 1,
          },
          data,
        });
        
        console.log('✅ Đã hiển thị thông báo với ID:', notificationId);
      } catch (error) {
        console.error('❌ Lỗi hiển thị thông báo:', error);
      }
    } else {
      console.warn('⚠️ Không tìm thấy title hoặc body trong thông báo');
    }
  });

  // Xử lý sự kiện khi người dùng nhấn vào notification trong foreground
  notifee.onForegroundEvent(({ type, detail }) => {
    console.log('🔔 Nhận sự kiện foreground:', type, detail);
    
    if (type === EventType.PRESS) {
      const data = detail.notification?.data;
      console.log('📲 Người dùng nhấn notification:', data);

      // Điều hướng đến màn hình cụ thể khi nhấn vào notification
      if (data && data.screen) {
        console.log('🧭 Sẽ điều hướng đến màn hình:', data.screen);
      }
    }
  });
  
  return unsubscribe;
}

// Hàm kiểm tra để gọi từ màn hình debug
export function runNotificationDiagnostics() {
  checkNotificationPermission()
    .then(hasPermission => {
      console.log('🔍 Có quyền thông báo:', hasPermission);
      
      if (hasPermission) {
        return displayTestNotification();
      } else {
        console.error('⛔ Không có quyền hiển thị thông báo');
        return false;
      }
    })
    .then(success => {
      console.log('🔍 Kết quả test thông báo:', success ? 'thành công' : 'thất bại');
    });
}