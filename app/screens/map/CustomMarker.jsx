import React from 'react';
import {View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CustomMarker = ({icon, color}) => {
  return (
    <View
      style={{
        backgroundColor: color,
        borderRadius: 8,
        borderWidth: 5,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
      }}>
      <MaterialIcons name={icon} size={12} color="#fff" />
    </View>
  );
};

export default CustomMarker;
