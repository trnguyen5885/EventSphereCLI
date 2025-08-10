import { useEffect, useRef, useCallback, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { getGroupMembers, getGroupLocations, updateLocation } from '../services/connectApi';
import { getSocket } from '../../../socket/socket';
import { Member, LocationData, LocationCoordinates } from '../types/GroupTypes';

// Throttle function implementation
const throttle = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  let lastExecTime = 0;
  return (...args: any[]) => {
    const currentTime = Date.now();
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

interface UseLocationSharingProps {
  groupId: string;
  userId: string;
  isSharing: boolean;
  userLocation?: LocationCoordinates;
}

export const useLocationSharing = ({ groupId, userId, isSharing, userLocation }: UseLocationSharingProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [myLocation, setMyLocation] = useState<LocationCoordinates | null>(userLocation || null);
  const watchId = useRef<number | null>(null);
  const socketRef = useRef<any>(null);

  // Cập nhật vị trí (throttle 10s)
  const throttledUpdateLocation = useRef(
    throttle(async (lat: number, lng: number) => {
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
      setMembers(Array.isArray(membersData) ? membersData : membersData?.data || []);
      setLocations(Array.isArray(locationsData) ? locationsData : locationsData?.data || []);
      console.log("Member: ", membersData);
      console.log("Location: ", locationsData);
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
      setLocations(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error('Lỗi tải vị trí:', err);
    }
  }, [groupId]);

  // Theo dõi vị trí
  useEffect(() => {
    if (isSharing) {
      // Fetch chỉ locations ngay khi bật sharing (faster)
      console.log("Hi");
      
      fetchAllData();
      
      watchId.current = Geolocation.watchPosition(
        ({ coords }) => {
          const newLocation = { latitude: coords.latitude, longitude: coords.longitude };
          setMyLocation(newLocation); // Update real-time location
          throttledUpdateLocation(coords.latitude, coords.longitude);
        },
        (err) => console.warn('Lỗi lấy vị trí:', err.message),
        { enableHighAccuracy: true, distanceFilter: 10 }
      );
    } else {
      updateLocation(groupId, userId, null, null, false);
      setMyLocation(null); // Clear location when not sharing
    }

    return () => {
      if (watchId.current) Geolocation.clearWatch(watchId.current);
    };
  }, [isSharing, groupId, userId, fetchAllData]);

  // Kết nối socket và lắng nghe update
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !groupId) return;
  
    const roomName = `group_${groupId}`;
    console.log('[SOCKET] 🔌 Joining room:', roomName);
    socket.emit('joinRoom', roomName);
  
    const handleLocationUpdate = (data: LocationData) => {
      console.log('[SOCKET] 📍 location:update received:', data);
      // Update local state immediately for faster UI response
      setLocations(prev => {
        const index = prev.findIndex(loc => String(loc.userId) === String(data.userId));
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = data; // cập nhật vị trí mới
          return updated;
        } else {
          return [...prev, data]; // thêm mới nếu chưa có
        }
      });
      
      // Fetch fresh locations để sync với server (throttled)
      setTimeout(() => fetchLocations(), 500);
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
    const interval = setInterval(fetchAllData, 10000); // 10 giây thay vì 5 giây
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
    myLocation, // Real-time GPS location
    refetch: fetchAllData,
  };
};