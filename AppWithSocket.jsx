import {StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import AirbridgeService from './app/services/AirbridgeService';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  EventDetailScreen,
  TicketEventScreen,
  PaymentScreen,
  NotificationScreen,
  UserTicketsScreen,
  ListTicket,
  ProfileEdit,
  ProfileScreen,
  SeatsScreen,
  ZonesScreen,
  EventScreen,
} from './app/screens';
import SplashScreen from './app/screens/SplashScreen';
import WelcomeScreen from './app/screens/auth/WelcomeScreen';
import Review from './app/screens/review/Review';
import LoginScreen from './app/screens/auth/LoginScreen';
import RatingAndReview from './app/screens/review/RatingAndReview';
import OtpVerificationScreen from './app/screens/auth/OtpVerificationScreen';
import OtpOrganizerVerificationScreen from './app/screens/authOrganizer/OtpOrganizerVerificationScreen';
import EventSearchScreen from './app/screens/explore/EventSearchScreen';
import DrawerNavigator from './app/navigation/DrawerNavigator';
import OrganizerTabs from './app/screens/organizer/OrganizerTabs';
import ProfileEditOrganizer from './app/screens/organizer/ProfileEditOrganizer';
import SupportScreen from './app/screens/profile/SupportScreen';

import {HandleNotification} from './app/utils/handleNotification';
import {
  createNotificationChannel,
  runNotificationDiagnostics,
  setupForegroundNotificationHandler,
} from './app/services/notification/NotificationServices';
import {setupNotificationNavigation} from './app/services/notification/NotificationHandler';
import FriendScreen from './app/screens/friend/FriendScreen';
import FriendListScreen from './app/screens/friend/FriendListScreen';
import FriendRequestScreen from './app/screens/friend/FriendRequestScreen';
import {getTokens} from './app/token/authTokens';
import {getSocket, initSocket} from './app/socket/socket';
import {jwtDecode} from 'jwt-decode';
import RegisterScreen from './app/screens/auth/RegisterScreen';
import LoginOrganizerScreen from './app/screens/authOrganizer/LoginOrganizerScreen';
import RegisterOrganizerScreen from './app/screens/authOrganizer/RegisterOrganizerScreen';
import EventDetailOrganizer from './app/screens/organizer/EventDetailOrganizer';
import EventEdit from './app/screens/organizer/EventEdit';
import PayOSQRScreen from './app/screens/payment/PayOSQRScreen';
import OtpForgetPasswordScreen from './app/screens/auth/OtpForgetPasswordScreen';
import ResetPasswordScreen from './app/screens/auth/ResetPasswordScreen';
import OtpForgetPasswordOrganizerScreen from './app/screens/authOrganizer/OtpForgetPasswordOrganizerScreen';
import ResetPasswordOrganizerScreen from './app/screens/authOrganizer/ResetPasswordOrganizerScreen';
import OnbroadingScreen from './app/screens/auth/OnbroadingScreen';
import SearchEventOrganizer from './app/screens/organizer/SearchEventOrganizer';
import { useDispatch } from 'react-redux';
import { fetchPendingCount } from './app/redux/slices/friendRequestSlice';
import AuthLoadingScreen from './app/screens/auth/AuthLoadingScreen';
import GroupScreen from './app/screens/connect/GroupScreen';
import InviteScreen from './app/screens/connect/InviteScreen';
import ConnectScreen from './app/screens/connect/ConnectScreen';
import InviteToGroupScreen from './app/screens/connect/InviteToGroupScreen'
import PolicyViewerScreen from './app/screens/profile/PolicyViewerScreen';
import FAQScreen from './app/screens/profile/FAQScreen';
import ContactScreen from './app/screens/profile/ContactScreen';
import QRScanner from './app/screens/organizer/QRScanner';
import ScanShowTime from './app/screens/organizer/ScanShowTime';
import FavoriteTag from './app/screens/FavoriteTag';
import ListByTag from './app/screens/explore/ListByTag';
import PaymentSuccessScreen from './app/screens/payment/PaymentSuccessScreen';
import NonesScreen from './app/screens/zone/NonesScreen';
import useDeepLinking from './app/hooks/useDeepLinking';


const Stack = createNativeStackNavigator();

const AppWithSocket = () => {
  const dispatch = useDispatch();
  const navigationRef = useNavigationContainerRef();
  const [token, setToken] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Deep linking handler
  useDeepLinking(navigationRef);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await getTokens();
        if (storedToken?.accessToken) {
          const userData = jwtDecode(storedToken.accessToken);
          setToken({...storedToken, user: userData}); // gộp thêm `user`
        }
      } catch (err) {
        console.error('Error loading token:', err);
      }
    };
    fetchToken();

    // Initialize Airbridge
    AirbridgeService.setNavigationRef(navigationRef);
    AirbridgeService.initialize();
  }, []);

  console.log('Tokens: ' + JSON.stringify(token?.user?.id));
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getTokens();
      console.log('Tokens: ', token);
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

      socket.off('friendRequest');
      socket.on('friendRequest', data => {
        console.log('Friend request received:', data);
        dispatch(fetchPendingCount());
      });

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('friendRequest');
        socket?.disconnect();
      };
    }
  }, [token]);

  const linking = {
    prefixes: [
      'eventsphere://',
      'demozpdk://',
      'https://eventsphere.io.vn',
      'https://eventsphere.airbridge.io',
      'https://eventsphere.abr.ge'
    ],
    config: {
      screens: {
        Home: '../screens/explore/ExploreScreen',
        Detail: {
          path: '/event/:id',
          parse: {
            id: (id) => `${id}`,
          },
        },
      },
    },
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer ref={navigationRef} linking={linking}>
        <Stack.Navigator
          screenOptions={{headerShown: false}}
          initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnbroadingScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="LoginOrganizer"
            component={LoginOrganizerScreen}
          />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="RegisterOrganizer"
            component={RegisterOrganizerScreen}
          />
          <Stack.Screen
            name="OtpVerification"
            component={OtpVerificationScreen}
          />
          <Stack.Screen
            name="OtpOrganizerVerification"
            component={OtpOrganizerVerificationScreen}
          />
          <Stack.Screen name="Drawer" component={DrawerNavigator} />
          <Stack.Screen name="Search" component={EventSearchScreen} />
          <Stack.Screen name="Detail" component={EventDetailScreen} />
          <Stack.Screen  name='None' component={NonesScreen} />
          <Stack.Screen name="Seats" component={SeatsScreen} />
          <Stack.Screen name='Zone' component={ZonesScreen} />
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
          <Stack.Screen
            name="FriendRequestScreen"
            component={FriendRequestScreen}
          />
          <Stack.Screen name="OrganizerTabs" component={OrganizerTabs} />
          <Stack.Screen name="RatingAndReview" component={RatingAndReview} />
          <Stack.Screen
            name="ProfileEditOrganizer"
            component={ProfileEditOrganizer}
          />
          <Stack.Screen
            name="EventDetailOrganizer"
            component={EventDetailOrganizer}
          />
          <Stack.Screen name="EventEdit" component={EventEdit} />
          <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
          <Stack.Screen name="PayOSQRScreen" component={PayOSQRScreen} />
          <Stack.Screen name="OtpForgetPassword" component={OtpForgetPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="OtpForgetPasswordOrganizer" component={OtpForgetPasswordOrganizerScreen} />
          <Stack.Screen name="ResetPasswordOrganizer" component={ResetPasswordOrganizerScreen} />
          <Stack.Screen name="SearchEventOrganizer" component={SearchEventOrganizer} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="GroupScreen" component={GroupScreen} />
          <Stack.Screen name="InviteScreen" component={InviteScreen} />
          <Stack.Screen name="InviteToGroupScreen" component={InviteToGroupScreen} />
          <Stack.Screen name="PolicyViewer" component={PolicyViewerScreen} />
          <Stack.Screen name="FAQScreen" component={FAQScreen} />
          <Stack.Screen name="ContactScreen" component={ContactScreen} />
          <Stack.Screen name="QRScanner" component={QRScanner} />
          <Stack.Screen name="ScanShowTime" component={ScanShowTime} />
          <Stack.Screen name="FavoriteTag" component={FavoriteTag} />
          <Stack.Screen name="ListByTag" component={ListByTag} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
          



        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default AppWithSocket;
