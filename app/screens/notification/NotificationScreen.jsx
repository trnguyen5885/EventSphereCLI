import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Platform, Image, FlatList } from 'react-native';

import React, { useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { AxiosInstance } from '../../../app/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

const demoNotificantions = [
  {
    type: 1,
    userName: 'Castorice',
    content: 'Invited you to her event',
    time: 'Just now'
  },
  {
    type: 2,
    userName: 'The Herta',
    content: 'Love your events!',
    time: '1 hr ago'
  },
  {
    type: 2,
    userName: 'Cantarella',
    content: 'Love your events!',
    time: '2 hr ago'
  },
  {
    type: 1,
    userName: 'Camellya',
    content: 'Invited you to her event',
    time: '5 min ago'
  }
]

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
          <Text style={styles.content}> {item.body}</Text>
        </Text>
        {item.data.type === "friend" && (
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
      <Text style={styles.timeText}>{item.time}</Text>
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
