import { StatusBar, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
  ProfileScreen,
} from './app/screens';

import Review from './app/screens/review/Review';
import LoginScreen from './app/screens/auth/LoginScreen';
import RatingAndReview from './app/screens/review/RatingAndReview';
import Filter from './app/screens/filter/Filter';
import FilteredEventScreen from './app/screens/filter/FilteredEventScreeen';
import OtpVerificationScreen from './app/screens/auth/OtpVerificationScreen';

import DrawerNavigator from './app/navigation/DrawerNavigator';
import OrganizerTabs from './app/screens/organizer/OrganizerTabs';

import { HandleNotification } from './app/utils/handleNotification';
import {
  createNotificationChannel,
  setupForegroundNotificationHandler,
} from './app/services/notification/NotificationServices';
import { setupNotificationNavigation } from './app/services/notification/NotificationHandler';

const Stack = createNativeStackNavigator();

const App = () => {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    HandleNotification.checkNotificationPermission();

    async function initNotification() {
      await createNotificationChannel();
      setupForegroundNotificationHandler();
    }

    initNotification();
    const unsubscribe = setupNotificationNavigation(navigationRef);
    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="OrganizerTabs"
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
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
          <Stack.Screen name="RatingAndReview" component={RatingAndReview} />
          <Stack.Screen name="Filter" component={Filter} />
          <Stack.Screen name="FilteredEventScreen" component={FilteredEventScreen} />
          <Stack.Screen name="OrganizerTabs" component={OrganizerTabs} />
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
