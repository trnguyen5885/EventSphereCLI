import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import React from 'react';
import { CardComponent, RowComponent, TextComponent } from '../../components';
import  Ionicons  from 'react-native-vector-icons/Ionicons';
import { appColors } from '../../constants/appColors';
import { globalStyles } from '@/app/constants/globalStyles';

const NotificationScreen = ({navigation}) => {
  return (
    <View>
      <View style={styles.header}>
          <Text style={styles.headerTitle} >Thông báo</Text>
      </View>
        <CardComponent style={styles.notificationCard}>
          <TextComponent style={styles.title} text={'Bạn đã đặt vé thành công'}/>
          <TextComponent style={styles.time} text={new Date().toLocaleString()}/>
          <TouchableOpacity style={styles.detailButton} onPress={()=>navigation.navigate('UserTickets')}>
            <TextComponent style={styles.detailButtonText} text={'Xem chi tiết'}/>
          </TouchableOpacity>
        </CardComponent>
      </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header:
  {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    paddingTop: Platform.OS === 'ios' ? 66 : 22,
    backgroundColor: appColors.primary
  },
  headerTitle: {
    color: appColors.white2,
    fontSize: 22,
    fontWeight: '500'

  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: appColors.danger
  },
  notificationCard: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  time: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailButton: {
    backgroundColor: appColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  detailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
