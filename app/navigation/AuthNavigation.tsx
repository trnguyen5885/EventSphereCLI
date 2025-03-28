import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen, RegisterScreen } from '../screens';

const Stack = createStackNavigator();

const authNavigation = () => {

    const [isExistingUser, setIsExistingUser] = useState(false);
    useEffect(()=>{
        checkUserExisting()
    }, []);

    const checkUserExisting = async () => {
        const res = await AsyncStorage.getItem('auth');

        res && setIsExistingUser(true);
    }

  return (
    <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            {!isExistingUser&&(
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
            )}
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        </Stack.Navigator>
  )
}

export default authNavigation