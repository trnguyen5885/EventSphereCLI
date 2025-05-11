import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { fetchPendingRequests, handleAccept as apiHandleAccept, handleReject as apiHandleReject } from '../services/friendApi';
import UserItem from './UserItem';

const PendingRequestTab = ({ styles, setSelectedUser, setModalVisible }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPendingRequests();
      setPendingRequests(res);
    } catch (e) {
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPending();
    setRefreshing(false);
  };

  const handleAccept = async (id) => {
    try {
      await apiHandleAccept(id);
      setPendingRequests(prev => prev.filter(req => req._id !== id));
    } catch (e) {}
  };

  const handleReject = async (id) => {
    try {
      await apiHandleReject(id);
      setPendingRequests(prev => prev.filter(req => req._id !== id));
    } catch (e) {}
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
      activeTab="pending"
      handleAccept={handleAccept}
      handleReject={handleReject}
      setSelectedUser={setSelectedUser}
      setModalVisible={setModalVisible}
      styles={styles}
      getRelativeTime={getRelativeTime}
    />
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  return (
    <FlatList
      data={pendingRequests}
      renderItem={renderUserItem}
      keyExtractor={item => item._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={pendingRequests.length === 0 ? { flex: 1 } : {}}
    />
  );
};

export default PendingRequestTab;
