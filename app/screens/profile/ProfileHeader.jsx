import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ButtonComponent, TextComponent } from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosInstance } from '../../services';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


const ProfileHeader = () => {

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  
  
  useFocusEffect(
    useCallback(() => {
      const getUserInfo = async () => {
        try {
          const userID = await AsyncStorage.getItem("userId");
          if (userID) {
            const response = await AxiosInstance().get(`users/${userID}`);
            setName(response.data.username);
            setImage(response.data.picUrl);
            console.log(response.data.username);
            console.log(response.data.picUrl);
            
          }
        } catch (error) {
          console.log("Lỗi khi lấy thông tin người dùng:", error);
        }
      };

      getUserInfo();
    }, [])
  );


  return (
    <View >
      <View style={styles.profileAVTContainer}>
          <Image style={styles.profileAVT} source={{ uri: image || "https://via.placeholder.com/150" }}></Image>
        </View>
        <View style={styles.nameContainer}>
          <TextComponent
            text={name}
            styles={styles.name}
          />
        </View>

        <View style={styles.followContainer}>
          <View></View>
          <View></View>
          <View style={styles.followingAndFollowerContainer}>
            <TextComponent
              text='0'
              styles={styles.followCount}
            />
            <TextComponent
              text='Following'
              styles={styles.followText}
            />
          </View>

          <View>
            <Image source={require('../../../assets/images/Line59.png')}></Image>
          </View>

          <View style={styles.followingAndFollowerContainer}>
            <TextComponent
              text='0'

              styles={styles.followCount}
            />
            <TextComponent
              text='Followers'
              styles={styles.followText}
            />
          </View>
          <View></View>
          <View></View>
        </View >
       
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({

    profileAVTContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
      },
      profileAVT: {
        width: 100,
        height: 100,
        borderRadius: 50
      },
      nameContainer: {
        width: '100%',
      
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
      },
      name: {
        fontSize: 24,
        lineHeight: 31.25,
        fontWeight: '600',
      },
      followContainer: {
        width: '100%',
        
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginTop: 20
      },
      followingAndFollowerContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 'auto',
        height: 54,
    
      },
      followCount: {
        fontSize: 16,
        lineHeight: 34,
        fontWeight: '600'
      },
      followText: {
        fontSize: 14,
        lineHeight: 23,
        color: '#747688'
      },

});
