import {Platform, StyleSheet, Text, View} from 'react-native';
import React, {ReactNode} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {appColors} from '../constants/appColors';
import {
  AddEventScreen,
  EventScreen,
  ExploreScreen,
  MapScreen,
  NotificationScreen,
  ProfileScreen,
} from '../screens';
import {CircleComponent, TextComponent} from '../components';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {globalStyles} from '../constants/globalStyles';
import GroupScreen from '../screens/connect/GroupScreen';
import ConnectScreen from '../screens/connect/ConnectScreen';
import TestSheet from '../screens/connect/TestSheet';

const TabNavigator = () => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: appColors.white,
        },
        tabBarIcon: ({focused, color, size}) => {
          let icon: ReactNode;
          color = focused ? appColors.primary : appColors.gray5;
          size = 24;
          switch (route.name) {
            case 'Khám phá':
              icon = <MaterialIcons name="explore" size={size} color={color} />;
              break;

            case 'Vé của tôi':
              icon = (
                <MaterialIcons
                  name="calendar-month"
                  size={size}
                  color={color}
                />
              );
              break;
            case 'Địa điểm':
              icon = (
                <MaterialIcons name="location-on" size={size} color={color} />
              );
              break;
            case 'Thông tin':
              icon = <MaterialIcons name="person" size={size} color={color} />;
              break;
          }
          return icon;
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
      })}>
      <Tab.Screen name="Khám phá" component={ExploreScreen} />
      <Tab.Screen name="Vé của tôi" component={EventScreen} />
      <Tab.Screen name="Địa điểm" component={ConnectScreen} />
      <Tab.Screen name="Thông tin" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({});
