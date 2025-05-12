import { StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
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
  ProfileScreen,
} from './app/screens';

import WelcomeScreen from './app/screens/auth/WelcomeScreen';
import Review from './app/screens/review/Review';
import LoginScreen from './app/screens/auth/LoginScreen';
import RatingAndReview from './app/screens/review/RatingAndReview';
import Filter from './app/screens/filter/Filter';
import FilteredEventScreen from './app/screens/filter/FilteredEventScreeen';
import OtpVerificationScreen from './app/screens/auth/OtpVerificationScreen';
import OtpOrganizerVerificationScreen from './app/screens/authOrganizer/OtpOrganizerVerificationScreen';

import DrawerNavigator from './app/navigation/DrawerNavigator';
import OrganizerTabs from './app/screens/organizer/OrganizerTabs';

import { HandleNotification } from './app/utils/handleNotification';
import { createNotificationChannel, runNotificationDiagnostics, setupForegroundNotificationHandler } from './app/services/notification/NotificationServices';
import { setupNotificationNavigation } from './app/services/notification/NotificationHandler';
import FriendScreen from './app/screens/friend/FriendScreen';
import FriendListScreen from './app/screens/friend/FriendListScreen';
import FriendRequestScreen from './app/screens/friend/FriendRequestScreen';
import { getTokens } from './app/token/authTokens';
import { getSocket, initSocket } from './app/socket/socket';
import { jwtDecode } from 'jwt-decode';
import LoginOrganizerScreen from './app/screens/authOrganizer/LoginOrganizerScreen';
import RegisterOrganizerScreen from './app/screens/authOrganizer/RegisterOrganizerScreen';

import { useDispatch } from 'react-redux';
import { fetchPendingCount } from './app/redux/slices/friendRequestSlice';

const Stack = createNativeStackNavigator();

const AppWithSocket = () => {
  const dispatch = useDispatch();
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
    const fetchToken = async () => {
      const token = await getTokens();
      console.log("Tokens: ", token);
    };

    fetchToken();
  }, []);

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
      initSocket(token.user.id);
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
        dispatch(fetchPendingCount());
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
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Welcome"
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="LoginOrganizer" component={LoginOrganizerScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="RegisterOrganizer" component={RegisterOrganizerScreen} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
          <Stack.Screen name="OtpOrganizerVerification" component={OtpOrganizerVerificationScreen} />
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
          <Stack.Screen name="FriendScreen" component={FriendListScreen} />
          <Stack.Screen name="FriendSearchScreen" component={FriendScreen} />
          <Stack.Screen name="FriendRequestScreen" component={FriendRequestScreen} />
          <Stack.Screen name="OrganizerTabs" component={OrganizerTabs} />
          <Stack.Screen name="RatingAndReview" component={RatingAndReview} />
        </Stack.Navigator>
      </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default AppWithSocket; 