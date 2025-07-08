import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { AxiosInstance } from '../../../app/services';
import { useSelector } from 'react-redux';
import InviteNotiComponent from './components/InviteNotiComponent';
import { appColors } from '../../constants/appColors';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const userId = useSelector((state) => state.auth?.userId);

  const fetchUserInfo = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await AxiosInstance().get(`/users/getUser/${userId}`);
      setUserInfo(res.data);
    } catch (error) {
      console.error('Lỗi khi tải thông tin user:', error);
    }
  }, [userId]);

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
    fetchUserInfo();
    fetchNotifications();
  }, [fetchUserInfo, fetchNotifications]);

  // Hàm để lấy avatar URL
  const getAvatarUri = () => {
    if (userInfo?.picUrl) {
      return userInfo.picUrl;
    }
    return 'https://avatar.iran.liara.run/public';
  };

  const renderItem = ({ item }) => (
    <View>
      {item.type === 'invite' &&
        <InviteNotiComponent
          avatar={getAvatarUri()}
          body={item.body}
          createdAt={item.createdAt}
          title={item.title}
          inviteId={item.data?.inviteId}
          onResponded={fetchNotifications}
          status={item.data?.status}
        />
      }
      {item.type === 'group' && (
        <TouchableOpacity
          style={styles.notificationCard}
          onPress={() => navigation.navigate('InviteScreen')}
        >
          <Image
            source={{ uri: getAvatarUri() }}
            style={styles.avatar}
          />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.userName}>{item.title}</Text>
            <Text style={styles.content}>{item.body}</Text>
            <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  const handleNavigation = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.headerRow, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleNavigation}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <View style={{ width: 26 }} />
        </View>
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
  },
  header: {
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === 'ios' ? 30 : 10,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
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
    paddingHorizontal: 20,
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