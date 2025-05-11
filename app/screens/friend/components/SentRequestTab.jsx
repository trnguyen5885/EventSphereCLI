import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { fetchSentRequests, handleSendRequest as apiHandleSendRequest } from '../services/friendApi';
import UserItem from './UserItem';

const SentRequestTab = ({ styles, setSelectedUser, setModalVisible }) => {
  const [sentRequests, setSentRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSentRequests();
      setSentRequests(res);
    } catch (e) {
      setSentRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSent();
  }, [loadSent]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSent();
    setRefreshing(false);
  };

  const handleSendRequest = async (id, role) => {
    try {
      const res = await apiHandleSendRequest(id, role);
      if (role === 'sent' && res && res.status === 200) {
        setSentRequests(prev =>
          prev.map(user => user._id === id ? { ...user, role: 'none' } : user)
        );
      }
    } catch (error) {}
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
      activeTab="sent"
      handleSendRequest={() => handleSendRequest(item._id, item.role)}
      setSelectedUser={setSelectedUser}
      setModalVisible={setModalVisible}
      styles={styles}
      getRelativeTime={getRelativeTime}
    />
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  return (
    <FlatList
      data={sentRequests}
      renderItem={renderUserItem}
      keyExtractor={item => item._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={sentRequests.length === 0 ? { flex: 1 } : {}}
    />
  );
};

export default SentRequestTab;
