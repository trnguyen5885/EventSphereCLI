import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { AxiosInstance } from '../../../app/services';
import { RowComponent } from '../../components';
import { appColors } from '../../constants/appColors';
import { useSelector } from 'react-redux';
import InviteNotiComponent from './components/InviteNotiComponent';
import { formatTime } from './components/formatTime';
const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const userId = useSelector((state) => state.auth?.userId);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await AxiosInstance().post('/users/getNotification', { userId });
      setNotifications(res.data);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const renderItem = ({ item }) => (
    <View>
      {item.type === 'invite' && 
        <InviteNotiComponent 
          avatar={'https://avatar.iran.liara.run/public'}
          body={item.body}
          createdAt={item.createdAt}
          title={item.title}
          inviteId={item.data.inviteId}
          onResponded={fetchNotifications}
        />
      }
  
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.headerTitle}>Notification</Text>
        </TouchableOpacity>
        <Entypo name="dots-three-vertical" size={24} color="black" />
      </View>

      {notifications.length === 0 ? (
        <View style={styles.mainContentSection}>
          <Image source={require('../../../assets/images/adaptive-icon.png')} />
          <Text style={styles.noneNotificationText}>Không có thông báo!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    marginLeft: 10,
    fontWeight: '500',
  },
  mainContentSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noneNotificationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#ddd',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    fontWeight: 'normal',
  },
  timeText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  rejectText: {
    color: '#000',
  },
  acceptButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  acceptText: {
    color: '#fff',
  },
});
