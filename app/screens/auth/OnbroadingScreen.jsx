import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import Swiper from 'react-native-swiper';
import {globalStyles} from '../../constants/globalStyles';
import {Dimensions} from 'react-native';
import {appColors} from '../../constants/appColors';
import {fontFamilies} from '../../constants/fontFamilies';
import AsyncStorage from '@react-native-async-storage/async-storage';
const OnbroadingScreen = ({navigation}) => {
  const [index, setIndex] = useState(0);

  return (
    <View style={[globalStyles.container]}>
      <Swiper
        style={{}}
        showsButtons={false}
        loop={false}
        index={index}
        onIndexChanged={num => setIndex(num)}
        activeDotColor={appColors.white}
        dotColor={appColors.gray2}>
        <Image
          source={require('../../../assets/images/onboarding-4.png')}
          style={{
            flex: 1,
            resizeMode: 'cover',
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
          }}
        />

        <Image
          source={require('../../../assets/images/onboarding-5.png')}
          style={{
            flex: 1,
            resizeMode: 'cover',
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
          }}
        />

        <Image
          source={require('../../../assets/images/onboarding-6.png')}
          style={{
            flex: 1,
            resizeMode: 'cover',
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
          }}
        />
      </Swiper>
      <View
        style={[
          {
            paddingHorizontal: 16,
            paddingVertical: 20,
            position: 'absolute',
            bottom: 20,
            right: 20,
            left: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        ]}>
        <TouchableOpacity
          onPress={async () => {
            await AsyncStorage.setItem('isFirstLaunch', 'false');
            navigation.navigate('Login');
          }}>
          <Text
            style={{
              color: appColors.gray5,
              fontFamily: fontFamilies.medium,
            }}>
            Skip
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            if (index < 2) {
              setIndex(index + 1);
            } else {
              await AsyncStorage.setItem('isFirstLaunch', 'false');
              navigation.navigate('Login');
            }
          }}>
          <Text
            style={{color: appColors.white, fontFamily: fontFamilies.medium}}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnbroadingScreen;

const styles = StyleSheet.create({});
