import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EventDasboard from './EventDashboard';
import EventManagement from './EventManagement';
import ProfileOrganizerScreen from './ProfileOrganizerScreen';
import Icon from 'react-native-vector-icons/Feather';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

const OrganizerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Trang chủ') iconName = 'grid';
          else if (route.name === 'Quản lý sự kiện') iconName = 'calendar';
          else if (route.name === 'Thông tin') iconName = 'user';

          return <Icon name={iconName} size={20} color={color} />;
        },
        tabBarLabel: ({ focused }) => (
          <Text style={{ fontSize: 12, color: focused ? '#6366F1' : '#444' }}>
            {route.name}
          </Text>
        ),
        tabBarStyle: {
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#6366F1',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Trang chủ" component={EventDasboard} />
      <Tab.Screen name="Quản lý sự kiện" component={EventManagement} />
      <Tab.Screen name="Thông tin" component={ProfileOrganizerScreen} />
    </Tab.Navigator>
  );
};

export default OrganizerTabs;