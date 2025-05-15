import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect} from 'react';
import {globalStyles} from '../../constants/globalStyles';
import {
  ButtonComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import {appColors} from '../../constants/appColors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RoleSelectionScreen = ({navigation}) => {
  return (
    <ImageBackground
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: appColors.white,
      }}
      source={require('../../../assets/images/splash-img.png')}
      imageStyle={{flex: 1}}>
      <Image source={require('../../../assets/images/logo.png')} />
      <SpaceComponent height={20} />
      <TextComponent size={24} title text="Tiếp tục với tư cách" />
      <SpaceComponent height={20} />
      <SectionComponent>
        <ButtonComponent
          text="NGƯỜI DÙNG"
          type="primary"
          onPress={() => navigation.navigate('Login')}
        />
      </SectionComponent>
      <SectionComponent>
        <ButtonComponent
          text="NHÀ TỔ CHỨC"
          type="primary"
          styles={{backgroundColor: appColors.gray}}
          onPress={() => navigation.navigate('LoginOrganizer')}
        />
      </SectionComponent>
    </ImageBackground>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({});
