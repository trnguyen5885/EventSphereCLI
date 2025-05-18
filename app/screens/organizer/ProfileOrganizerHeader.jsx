import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ButtonComponent, TextComponent } from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosInstance } from '../../services';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';



const ProfileOrganizerHeader = ({
  onPress
}) => {

  const userId = useSelector(state => state.auth.userId); // Lấy userId từ Redux

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  
  
  useFocusEffect(
  useCallback(() => {
    const getUserInfo = async () => {
      try {
        if (userId) {
          const response = await AxiosInstance().get(`users/getUser/${userId}`);
          setName(response.data.username);
          setImage(response.data.picUrl);
        }
      } catch (error) {
        console.log('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    getUserInfo();
  }, [userId])
);



  return (
    <View >
      <View style={styles.profileAVTContainer}>
          <Image style={styles.profileAVT} source={{ uri: image ?  image : 'https://avatar.iran.liara.run/public' }} />
        </View>
        <View style={styles.nameContainer}>
          <TextComponent
            text={name}
            styles={styles.name}
          />
        </View>
       
    </View>
  );
};

export default ProfileOrganizerHeader;

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
});