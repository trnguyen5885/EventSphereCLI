import { useEffect, useRef, useCallback, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { throttle } from 'lodash';
import { getGroupMembers, getGroupLocations, updateLocation } from '../services/connectApi'; // tuỳ theo cấu trúc của bạn
import { getSocket } from '../../../socket/socket';

export const useLocationSharing = ({ groupId, userId, isSharing, userLocation }) => {
  const [members, setMembers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const watchId = useRef(null);
  const socketRef = useRef(null);

  // Cập nhật vị trí (throttle 10s)
  const throttledUpdateLocation = useRef(
    throttle(async (lat, lng) => {
      await updateLocation(groupId, userId, lat, lng, true);
    }, 10000)
  ).current;

  // Tải dữ liệu toàn bộ
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersData, locationsData] = await Promise.all([
        getGroupMembers(groupId),
        getGroupLocations(groupId),
      ]);
      setMembers(membersData);
      setLocations(locationsData);
    } catch (err) {
      console.error('Lỗi tải dữ liệu nhóm:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // Tải chỉ vị trí
  const fetchLocations = useCallback(async () => {
    try {
      const data = await getGroupLocations(groupId);
      setLocations(data);
    } catch (err) {
      console.error('Lỗi tải vị trí:', err);
    }
  }, [groupId]);

  // Theo dõi vị trí
  useEffect(() => {
    if (isSharing) {
      watchId.current = Geolocation.watchPosition(
        ({ coords }) => {
          throttledUpdateLocation(coords.latitude, coords.longitude);
        },
        (err) => console.warn('Lỗi lấy vị trí:', err.message),
        { enableHighAccuracy: true, distanceFilter: 10 }
      );
    } else {
      updateLocation(groupId, userId, null, null, false);
    }

    return () => {
      if (watchId.current) Geolocation.clearWatch(watchId.current);
    };
  }, [isSharing, groupId, userId]);

  // Kết nối socket và lắng nghe update
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !groupId) return;
  
    const roomName = `group_${groupId}`;
    console.log('[SOCKET] 🔌 Joining room:', roomName);
    socket.emit('joinRoom', roomName);
  
    const handleLocationUpdate = (data: any) => {
      console.log('[SOCKET] 📍 location:update received:', data);
      // Cập nhật lại danh sách vị trí nếu cần
      // Ví dụ: setLocations(prev => update logic)
    };
  
    const handleAnySocket = (event: string, ...args: any[]) => {
      console.log(`[SOCKET][ANY] Event: ${event}`, ...args);
    };
  
    socket.on('location:update', handleLocationUpdate);
    socket.onAny(handleAnySocket);
  
    return () => {
      socket.off('location:update', handleLocationUpdate);
      socket.offAny(handleAnySocket);
      socket.emit('leave', { room: roomName });
      console.log('[SOCKET] ❌ Left room:', roomName);
    };
  }, [groupId]);
  

  // Tải ban đầu + định kỳ mỗi 30s
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Rời khỏi màn hình => tắt chia sẻ
  useEffect(() => {
    return () => {
      updateLocation(groupId, userId, null, null, false);
    };
  }, []);

  return {
    members,
    locations,
    loading,
    refetch: fetchAllData,
  };
};
