import { StatusBar, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
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
import LoginOrganizerScreen from './app/screens/authOrganizer/LoginOrganizerScreen';
import RegisterOrganizerScreen from './app/screens/authOrganizer/RegisterOrganizerScreen';


import { Provider } from 'react-redux';
import { persistor, store } from './app/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import LoadingModal from './app/modals/LoadingModal';

const Stack = createNativeStackNavigator();



const App = () => {
  const navigationRef = useNavigationContainerRef();
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

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingModal visible />} persistor={persistor}>
        <GestureHandlerRootView style={styles.root}>
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
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
