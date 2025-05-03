import {StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
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
import MapScreen from './app/screens/map/MapScreen';
import RatingAndReview from './app/screens/review/RatingAndReview';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DrawerNavigator from './app/navigation/DrawerNavigator';
import OtpVerificationScreen from './app/screens/auth/OtpVerificationScreen';
import {HandleNotification} from './app/utils/handleNotification';
import {
  createNotificationChannel,
  setupForegroundNotificationHandler,
} from './app/services/notification/NotificationServices';
import {setupNotificationNavigation} from './app/services/notification/NotificationHandler';

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
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Ticket" component={TicketEventScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="UserTickets" component={UserTicketsScreen} />
          <Stack.Screen name="ListTicket" component={ListTicket} />
          <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="Review" component={Review} />
          <Stack.Screen
            name="OtpVerification"
            component={OtpVerificationScreen}
          />
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
