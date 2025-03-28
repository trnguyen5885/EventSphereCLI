import { Platform, StyleSheet, Text, View } from "react-native";
import React, { ReactNode } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { appColors } from "../constants/appColors";
import {
  AddEventScreen,
  EventScreen,
  ExploreScreen,
  MapScreen,
  NotificationScreen,
  ProfileScreen,
} from "../screens";
import { CircleComponent, TextComponent } from "../components";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { globalStyles } from "../constants/globalStyles";

const TabNavigator = () => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 68,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: appColors.white,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let icon: ReactNode;
          color = focused ? appColors.primary : appColors.gray5;
          size = 24;
          switch (route.name) {
            case "Explore":
              icon = <MaterialIcons name="explore" size={size} color={color} />;
              break;

            case "Events":
              icon = (
                <MaterialIcons
                  name="calendar-month"
                  size={size}
                  color={color}
                />
              );
              break;
            case "Map":
              icon = (
                <MaterialIcons name="location-on" size={size} color={color} />
              );
              break;
            case "Profile":
              icon = <MaterialIcons name="person" size={size} color={color} />;
              break;

            case "Add":
              icon = (
                <CircleComponent
                  size={52}
                  styles={[
                    globalStyles.shadow,
                    { marginTop: Platform.OS === "ios" ? -50 : -60 },
                  ]}>
                  <MaterialIcons name="add" size={24} color={appColors.white} />
                </CircleComponent>
              );
              break;
          }
          return icon;
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
        tabBarLabel({ focused }) {
          return route.name === "Add" ? null : (
            <TextComponent
              text={route.name}
              flex={0}
              size={12}
              color={focused ? appColors.primary : appColors.gray5}
              styles={{
                marginBottom: Platform.OS === "android" ? 12 : 0,
              }}
            />
          );
        },
      })}>
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Events" component={EventScreen} />
      <Tab.Screen name="Add" component={AddEventScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({});
