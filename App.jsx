import { StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import {
  WelcomeScreen,
  RegisterScreen,
  EventDetailScreen,
  TicketEventScreen,
  PaymentScreen,
  NotificationScreen,
  UserTicketsScreen,
  ListTicket,
  EventCategoryScreen,
  EventSearchScreen,
  ProfileEdit,
  ProfileScreen
} from './app/screens';
import Review from './app/screens/review/Review'
import LoginScreen from './app/screens/auth/LoginScreen';
import RatingAndReview from './app/screens/review/RatingAndReview'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './app/navigation/DrawerNavigator';
import OtpVerificationScreen from './app/screens/auth/OtpVerificationScreen';
import { HandleNotification } from './app/utils/handleNotification';
import { createNotificationChannel, runNotificationDiagnostics, setupForegroundNotificationHandler } from './app/services/notification/NotificationServices';
import { setupNotificationNavigation } from './app/services/notification/NotificationHandler';
import FriendScreen from './app/screens/friend/FriendScreen';
import FriendListScreen from './app/screens/friend/FriendListScreen';
import FriendRequestScreen from './app/screens/friend/FriendRequestScreen';
import { getTokens } from './app/token/authTokens';
import { getSocket, initSocket } from './app/socket/socket';
import { jwtDecode } from 'jwt-decode';

const Stack = createNativeStackNavigator();

const App = () => {
  const navigationRef = useNavigationContainerRef();
  const [token, setToken] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await getTokens();
        if (storedToken?.accessToken) {
          const userData = jwtDecode(storedToken.accessToken); 
          setToken({ ...storedToken, user: userData }); // gộp thêm `user`
        }
      } catch (err) {
        console.error("Error loading token:", err);
      }
    };
    fetchToken();
  }, []);

  console.log("Tokens: " + JSON.stringify(token?.user?.id));
  useEffect(() => {
    HandleNotification.checkNotificationPermission();

    async function initNotification() {
      await createNotificationChannel();
      setupForegroundNotificationHandler();
      runNotificationDiagnostics();
    }
    initNotification();

    const unsubscribe = setupNotificationNavigation(navigationRef);
    return unsubscribe;
  }, []);
  useEffect(() => {
    if (token?.user?.id) {
      initSocket(token.user._id);
      const socket = getSocket();
      socket.on('connect', () => {
        console.log('Socket connected!');
      });
      socket.on('disconnect', () => {
        console.log('Socket disconnected!');
      });

      const handleConnect = () => {
        setIsSocketConnected(true);
      };
      const handleDisconnect = () => {
        setIsSocketConnected(false);
      };
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      socket.off("friendRequest");
      socket.on("friendRequest", (data) => {
        console.log("Friend request received:", data);
      });

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off("friendRequest");
        socket?.disconnect();
      };
    }
  }, [token]);
  return (

    // Tương tác màn hình
    <GestureHandlerRootView style={styles.root}>
      {/* Container chứa tất cả màn hàn và xử lí chuyển màn hình */}
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Drawer" component={DrawerNavigator} />
          <Stack.Screen name="Category" component={EventCategoryScreen} />
          <Stack.Screen name="Search" component={EventSearchScreen} />
          <Stack.Screen name="Detail" component={EventDetailScreen} />
          <Stack.Screen name="Ticket" component={TicketEventScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="UserTickets" component={UserTicketsScreen} />
          <Stack.Screen name="ListTicket" component={ListTicket} />
          <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="Review" component={Review} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
          <Stack.Screen name="FriendScreen" component={FriendListScreen} />
          <Stack.Screen name="FriendSearchScreen" component={FriendScreen} />
          <Stack.Screen name="FriendRequestScreen" component={FriendRequestScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
