import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import AxiosInstance from '../../../app/services/api/AxiosInstance';

const FriendRequestScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await AxiosInstance().get('friends/getPendingRequests');
      console.log("Res: "+JSON.stringify(res));
      setRequests(res.requests);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải danh sách lời mời kết bạn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      const response = await AxiosInstance().post(`friends/accept/${id}`);
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === id 
            ? { ...req, status: 'accepted' }
            : req
        )
      );
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể chấp nhận lời mời');
    }
  };

  const handleReject = async (id) => {
    try {
      await AxiosInstance().post(`friends/decline/${id}`);
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === id 
            ? { ...req, status: 'declined' }
            : req
        )
      );
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể từ chối lời mời');
    }
  };

  // Hàm chuyển đổi thời gian gửi lời mời thành chuỗi mô tả
  function getRelativeTime(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) {
      return `${diffSec} giây`;
    }
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return `${diffMin} phút`;
    }
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) {
      return `${diffHour} giờ`;
    }
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) {
      return `${diffDay} ngày`;
    }
    const diffWeek = Math.floor(diffDay / 7);
    if (diffDay < 30) {
      return `${diffWeek} tuần`;
    }
    const diffMonth = Math.floor(diffDay / 30);
    if (diffDay < 365) {
      return `${diffMonth} tháng`;
    }
    const diffYear = Math.floor(diffDay / 365);
    return `${diffYear} năm`;
  }

  const renderItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Image 
        source={{ uri: item.senderId.picUrl }} 
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.senderId.name || item.senderId.username}</Text>
        {/* Hiển thị thời gian gửi lời mời nếu có trường createdAt */}
        {item.createdAt && (
          <Text style={{ color: '#888', fontSize: 12 }}>
            {getRelativeTime(item.createdAt)}
          </Text>
        )}
      </View>
      {item.status === 'accepted' ? (
        <View style={styles.acceptedContainer}>
          <Text style={styles.acceptedText}>Đã trở thành bạn bè</Text>
        </View>
      ) : item.status === 'declined' ? (
        <View style={styles.declinedContainer}>
          <Text style={styles.declinedText}>Đã từ chối</Text>
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.acceptButton} 
            onPress={() => handleAccept(item._id)}
          >
            <Text style={styles.buttonText}>Chấp nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rejectButton} 
            onPress={() => handleReject(item._id)}
          >
            <Text style={styles.buttonText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  console.log("List Friend: "+JSON.stringify(requests));
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lời mời kết bạn</Text>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        refreshing={loading}
        onRefresh={fetchRequests}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có lời mời nào</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 4,
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 16,
  },
  acceptedContainer: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptedText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  declinedContainer: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  declinedText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FriendRequestScreen;
