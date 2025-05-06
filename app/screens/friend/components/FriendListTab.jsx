import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Text, View } from 'react-native';
import { fetchFriends, handleUnfriend as apiHandleUnfriend } from '../services/friendApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import UserItem from './UserItem';

const FriendListTab = ({ styles, setSelectedUser, setModalVisible }) => {
  const [friends, setFriends] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFriends();
      setFriends(res.friends.map(user => ({ ...user, role: 'friend' })));
    } catch (e) {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  const handleUnfriendPress = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const getRelativeTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec} giây trước`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} ngày trước`;
    const diffWeek = Math.floor(diffDay / 7);
    if (diffDay < 30) return `${diffWeek} tuần trước`;
    const diffMonth = Math.floor(diffDay / 30);
    if (diffDay < 365) return `${diffMonth} tháng trước`;
    const diffYear = Math.floor(diffDay / 365);
    return `${diffYear} năm trước`;
  };

  const renderUserItem = ({ item }) => (
    <UserItem
      item={item}
      activeTab="friends"
      styles={styles}
      getRelativeTime={getRelativeTime}
      setSelectedUser={setSelectedUser}
      setModalVisible={setModalVisible}
    />
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  return (
    <FlatList
      data={friends}
      renderItem={renderUserItem}
      keyExtractor={item => item._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={friends.length === 0 ? { flex: 1, justifyContent: 'center', alignItems: 'center' } : {}}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="people-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Bạn chưa có bạn bè</Text>
        </View>
      )}
    />
  );
};

export default FriendListTab;
