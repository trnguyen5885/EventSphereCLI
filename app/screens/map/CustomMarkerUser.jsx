import React from 'react';
import {View, Image} from 'react-native';

const CustomMarkerUser = () => {
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
          uri: 'https://khoinguonsangtao.vn/wp-content/uploads/2022/09/hinh-anh-gai-xinh-cap-2-3.jpg',
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
