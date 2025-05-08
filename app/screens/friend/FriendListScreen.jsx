import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AxiosInstance from '../../../app/services/api/AxiosInstance';
import { RowComponent } from '../../components';

const FriendListScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await AxiosInstance().get('friends/list');
      setFriends(res.friends || res || []); 
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải danh sách bạn bè');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async (friendId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn hủy kết bạn?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await AxiosInstance().post(`friends/unfriend/${friendId}`);
              fetchFriends();
              Alert.alert('Thành công', 'Đã hủy kết bạn.');
            } catch (e) {
              Alert.alert('Lỗi', 'Không thể hủy kết bạn.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const renderItem = ({ item }) => (
    <RowComponent>
      <View style={styles.friendItem}>
        <Image
          source={{ uri: item.picUrl }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || item.username}</Text>
        </View>
        {item.relationshipStatus !== 'none' && (
          <TouchableOpacity
            style={styles.unfriendButton}
            onPress={() => handleUnfriend(item._id)}
          >
            <Text style={{ color: '#fff', fontWeight: '500' }}>Hủy kết bạn</Text>
          </TouchableOpacity>
        )}
      </View>
    </RowComponent>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bạn bè</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('FriendRequestScreen')}
          >
            <Ionicons name="person-add" size={26} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('FriendSearchScreen')}
          >
            <MaterialIcons name="search" size={26} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={friends}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        refreshing={loading}
        onRefresh={fetchFriends}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có bạn bè nào</Text>}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    marginLeft: 8,
    padding: 4,
  },
  friendItem: {
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
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 16,
  },
  unfriendButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
});

export default FriendListScreen;
