import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {View, Image} from 'react-native';
import { useSelector } from 'react-redux';
import { AxiosInstance } from '../../services';


const CustomMarkerUser = () => {

  const [image, setImage] = useState('');
  const userId = useSelector(state => state.auth.userId);
  useFocusEffect(
    useCallback(() => {
      const getUserInfo = async () => {
        try {
          if (userId) {
            const response = await AxiosInstance().get(`users/getUser/${userId}`);
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
    <View
      style={{
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        width: 40,
        height: 40,
        backgroundColor: '#eee',
      }}>
      <Image
        source={{
          uri: image ? image : 'https://avatar.iran.liara.run/public',
        }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 20,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

export default CustomMarkerUser;
