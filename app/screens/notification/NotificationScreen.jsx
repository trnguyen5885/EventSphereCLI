import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Platform, Image, FlatList } from 'react-native';

import React, { useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { AxiosInstance } from '../../../app/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm định dạng thời gian
const formatTime = (isoString) => {
  if (!isoString) return '';
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  // Cùng ngày
  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()
  ) {
    // Hiện giờ:phút
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  // Hôm qua
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return 'Hôm qua';
  }
  // Trong 3 ngày gần nhất
  if (diffDay < 4) {
    return `${diffDay} ngày trước`;
  }
  // Xa hơn: hiện ngày/tháng
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}`;
};

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {  
    const fetchNoti = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          const body = {
            userId: userId
          }
          console.log("Body: " + JSON.stringify(body));
          const res = await AxiosInstance().post("/users/getNotification", body);
          setNotifications(res.data);
        }
        else {
          console.error("Không tìm thấy userId trong AsyncStorage");
        }
      } catch (e) {
        console.error("Lỗi khi tải thông báo: ", e);
      }
    }
    fetchNoti();
  }, []);

  console.log("Noti: " + notifications);

  const renderItem = ({ item }) => (
    <View style={styles.notificationCard}>
      <Image source={require('../../../assets/images/adaptive-icon.png')} style={styles.avatar} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.userName}>
          {item.title}
        </Text>
        <Text style={styles.content}> {item.body}</Text>
        {item?.data?.type === "friend" && (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.rejectButton}>
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton}>
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.headerTitle}>Notification</Text>
        </View>
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
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
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
    paddingHorizontal: 20
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  headerTitle: {
    fontSize: 24,
    marginLeft: 10,
    fontWeight: '500'
  },
  mainContentSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noneNotificationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#ddd'
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  content: {
    fontWeight: 'normal',
  },
  timeText: {
    position: 'absolute',
    right: 0,
    top: 10,
    fontSize: 12,
    color: 'gray'
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  rejectText: {
    color: '#000'
  },
  acceptButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  acceptText: {
    color: '#fff'
  }
});
