import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EventDasboard from './EventDashboard';
import EventManagement from './EventManagement';
import EventCreate from './EventCreate';
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
          if (route.name === 'Dashboard') iconName = 'grid';
          else if (route.name === 'Manage Events') iconName = 'calendar';
          else if (route.name === 'Create Event') iconName = 'bell';
          else if (route.name === 'Profile') iconName = 'user';

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
      <Tab.Screen name="Dashboard" component={EventDasboard} />
      <Tab.Screen name="Manage Events" component={EventManagement} />
      <Tab.Screen name="Create Event" component={EventCreate} />
      <Tab.Screen name="Profile" component={ProfileOrganizerScreen} />
    </Tab.Navigator>
  );
};

export default OrganizerTabs;
