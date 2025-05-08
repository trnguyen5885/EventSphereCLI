import messaging from '@react-native-firebase/messaging';

export const setupNotificationNavigation = (navigationRef) => {
  // Khi app bị tắt hoàn toàn và được mở từ notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage && remoteMessage.data) {
        const { type, id } = remoteMessage.data;
        if (type === "event") {
          setTimeout(() => {
            navigationRef.navigate('Detail', { id });
          }, 500);
        }
      }
    });

  // Khi app đang ở nền và người dùng nhấn vào notification
  const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
    if (remoteMessage && remoteMessage.data) {
      const { type, id } = remoteMessage.data;
      if (type === 'game') {
        navigationRef.navigate('Detail', { id });
      }
    }
  });

  return unsubscribe;
};
