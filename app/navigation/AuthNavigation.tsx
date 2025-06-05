import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {LoginScreen} from '../screens';
import SplashScreen from '../screens/SplashScreen';
// import OnbroadingScreen from '../screens/auth/OnbroadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AuthNavigator = () => {
  const Stack = createNativeStackNavigator();
  // const [isExistingUser, setIsExistingUser] = useState(false);

  // useEffect(() => {
  //   checkUserExisting();
  // }, []);

  // const checkUserExisting = async () => {
  //   const res = await AsyncStorage.getItem('auth');

  //   res && setIsExistingUser(true);
  // };

  // console.log(isExistingUser);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {/* <Stack.Screen name="OnbroadingScreen" component={OnbroadingScreen} /> */}
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      {/* {isExistingUser && <Stack.Screen name="OnbroadingScreen" component={OnbroadingScreen} />} */}
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      
    </Stack.Navigator>
  );
};

export default AuthNavigator;