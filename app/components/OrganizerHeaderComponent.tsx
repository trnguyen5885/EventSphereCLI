import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {CommonActions} from '@react-navigation/native';
import {logout} from '../redux/slices/authSlice';
interface Props {
  title: string;
}

const OrganizerHeaderComponent = ({title}: Props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const handleBack = () => {
    Alert.alert('Thông báo', 'Bạn có chắc chắn muốn thoát ứng dụng?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Thoát',
        onPress: () => {
          dispatch(logout()),
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'LoginOrganizer'}],
              }),
            );
        },

        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      {/* Nút thống kê (sẽ dùng sau) */}
      <MaterialCommunityIcons name="chart-bar" size={20} color="#999" />
    </View>
  );
};

export default OrganizerHeaderComponent;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
});
