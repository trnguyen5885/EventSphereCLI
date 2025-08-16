
import { useEffect, useRef, useCallback, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { getGroupMembers, getGroupLocations, updateLocation } from '../services/connectApi';
import { getSocket } from '../../../socket/socket';
import { Member, LocationData, LocationCoordinates } from '../types/GroupTypes';

// Throttle function
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

// Fallback coordinates (Hà Nội) nếu không lấy được vị trí
const FALLBACK_COORDINATES: LocationCoordinates = {
  latitude: 10.853852729704256,
  longitude: 106.62619825275381, 
};

interface UseLocationSharingProps {
  groupId: string;
  userId: string;
  isSharing: boolean;
  userLocation?: LocationCoordinates | null;
}

export const useLocationSharing = ({ groupId, userId, isSharing, userLocation }: UseLocationSharingProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [myLocation, setMyLocation] = useState<LocationCoordinates | null>(userLocation || FALLBACK_COORDINATES);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  const watchId = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Throttle update location (10s)
  const throttledUpdateLocation = useRef(
    throttle(async (lat: number, lng: number) => {
      try {
        await updateLocation(groupId, userId, lat, lng, true);
      } catch (error) {
        console.warn('Failed to update location:', error);
      }
    }, 10000)
  ).current;

  // 1. Xin quyền truy cập vị trí với retry
  const requestLocationPermission = async (retries = 3): Promise<boolean> => {
    if (Platform.OS === 'android') {
      for (let i = 0; i < retries; i++) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Quyền truy cập vị trí',
              message: 'Ứng dụng cần quyền để chia sẻ vị trí của bạn với nhóm.',
              buttonPositive: 'Cho phép',
              buttonNegative: 'Từ chối',
              buttonNeutral: 'Hỏi lại sau'
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
          }
          
          // Nếu user từ chối, thử lại sau 1s
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.warn('Permission request error:', error);
        }
      }
      return false;
    }
    return true; // iOS cấp quyền khi request bằng Geolocation
  };

  // 2. Bật GPS (Android) với timeout
  const enableGPS = async (timeout = 10000): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // Kiểm tra GPS có sẵn không
        const enabled = await new Promise<boolean>((resolve) => {
          Geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 5000, enableHighAccuracy: false }
          );
        });
        
        if (enabled) {
          return true;
        }
        
        // Nếu không có GPS, thử bật
        try {
          const locationEnabler = await import('react-native-android-location-enabler');
          const result = await locationEnabler.promptForEnableLocationIfNeeded();
          return result === 'already-enabled' || result === 'enabled';
        } catch (err) {
          console.warn('GPS enable error:', err);
          return false;
        }
      } catch (err) {
        console.warn('GPS check error:', err);
        return false;
      }
    }
    return true;
  };

  // 3. Lấy vị trí ban đầu với progressive fallback
  const getInitialPosition = useCallback(
    (retries = 5): Promise<LocationCoordinates> => {
      return new Promise<LocationCoordinates>((resolve, reject) => {
        let attempts = 0;
        
        const tryGetPosition = () => {
          const options = {
            enableHighAccuracy: attempts < 2, // 2 lần đầu dùng GPS chính xác cao
            timeout: 15000 - (attempts * 2000), // Giảm timeout dần
            maximumAge: 30000, // Chấp nhận vị trí cũ hơn
          };

          Geolocation.getCurrentPosition(
            ({ coords }) => {
              // Validate coordinates
              if (coords.latitude === 0 && coords.longitude === 0) {
                throw new Error('Invalid coordinates (0,0)');
              }
              
              const newLocation = { 
                latitude: coords.latitude, 
                longitude: coords.longitude 
              };
              
              if (isMountedRef.current) {
                setMyLocation(newLocation);
                setLocationStatus('success');
                setLocationError(null);
                throttledUpdateLocation(coords.latitude, coords.longitude);
              }
              resolve(newLocation);
            },
            (err) => {
              attempts++;
              console.warn(`Location attempt ${attempts} failed:`, err.message);
              
              if (attempts < retries) {
                // Progressive delay: 1s, 2s, 3s, 4s
                setTimeout(tryGetPosition, attempts * 1000);
              } else {
                if (isMountedRef.current) {
                  setLocationStatus('error');
                  setLocationError(`Không thể lấy vị trí sau ${retries} lần thử. Sử dụng vị trí mặc định.`);
                  // Fallback to default coordinates
                  setMyLocation(FALLBACK_COORDINATES);
                }
                resolve(FALLBACK_COORDINATES);
              }
            },
            options
          );
        };
        
        tryGetPosition();
      });
    },
    [throttledUpdateLocation]
  );

  // 4. Lấy dữ liệu nhóm với retry
  const fetchAllData = useCallback(async (retries = 3) => {
    setLoading(true);
    for (let i = 0; i < retries; i++) {
      try {
        const [membersData, locationsData] = await Promise.all([
          getGroupMembers(groupId),
          getGroupLocations(groupId),
        ]);
        
        if (isMountedRef.current) {
          setMembers(Array.isArray(membersData) ? membersData : membersData?.data || []);
          setLocations(Array.isArray(locationsData) ? locationsData : locationsData?.data || []);
        }
        break; // Success, exit retry loop
      } catch (err) {
        console.error(`Fetch attempt ${i + 1} failed:`, err);
        if (i === retries - 1) {
          // Last attempt failed
          if (isMountedRef.current) {
            setLocationError('Không thể tải dữ liệu nhóm. Vui lòng thử lại.');
          }
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    if (isMountedRef.current) {
      setLoading(false);
    }
  }, [groupId]);

  // 5. Theo dõi vị trí với error recovery
  useEffect(() => {
    isMountedRef.current = true;
    
    const startSharing = async () => {
      if (!isMountedRef.current) return;
      
      setLocationStatus('requesting');
      setLoading(true);
      
      try {
        // Step 1: Request permission
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          if (isMountedRef.current) {
            setLocationStatus('error');
            setLocationError('Bạn chưa cấp quyền vị trí. Vui lòng vào Cài đặt > Ứng dụng > EventSphere > Quyền để bật.');
            setMyLocation(FALLBACK_COORDINATES);
          }
          return;
        }

        // Step 2: Enable GPS (Android only)
        const gpsEnabled = await enableGPS();
        if (!gpsEnabled) {
          if (isMountedRef.current) {
            setLocationStatus('error');
            setLocationError('GPS chưa được bật. Vui lòng bật GPS để chia sẻ vị trí chính xác.');
            setMyLocation(FALLBACK_COORDINATES);
          }
          return;
        }

        // Step 3: Get initial position
        const initialLocation = await getInitialPosition();
        
        if (isMountedRef.current) {
          setMyLocation(initialLocation);
          await fetchAllData();
          
          // Step 4: Start watching position
          watchId.current = Geolocation.watchPosition(
            ({ coords }) => {
              if (!isMountedRef.current) return;
              
              // Validate coordinates
              if (coords.latitude === 0 && coords.longitude === 0) {
                console.warn('Invalid coordinates received, skipping update');
                return;
              }
              
              const newLocation = { 
                latitude: coords.latitude, 
                longitude: coords.longitude 
              };
              setMyLocation(newLocation);
              throttledUpdateLocation(coords.latitude, coords.longitude);
            },
            (err) => {
              if (isMountedRef.current) {
                console.warn('Watch position error:', err.message);
                setLocationError('Lỗi theo dõi vị trí: ' + err.message);
              }
            },
            { 
              enableHighAccuracy: true, 
              distanceFilter: 10,
              timeout: 20000,
              maximumAge: 60000
            }
          );
        }
      } catch (error) {
        if (isMountedRef.current) {
          console.error('Start sharing error:', error);
          setLocationStatus('error');
          setLocationError('Không thể khởi tạo chia sẻ vị trí. Sử dụng vị trí mặc định.');
          setMyLocation(FALLBACK_COORDINATES);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    if (isSharing) {
      startSharing();
    } else {
      // Stop sharing
      if (watchId.current) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      updateLocation(groupId, userId, null, null, false);
      setMyLocation(FALLBACK_COORDINATES); // Không set null để tránh crash
      setLocationError(null);
      setLocationStatus('idle');
    }

    return () => {
      isMountedRef.current = false;
      if (watchId.current) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [isSharing, groupId, userId, fetchAllData, getInitialPosition]);

  // 6. Socket connection với error handling
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !groupId || !isMountedRef.current) return;

    const roomName = `group_${groupId}`;
    console.log('[SOCKET] 🔌 Joining room:', roomName);
    
    try {
      socket.emit('joinRoom', roomName);
    } catch (error) {
      console.warn('Socket join error:', error);
    }

    const handleLocationUpdate = (data: LocationData) => {
      if (!isMountedRef.current) return;
      
      setLocations(prev => {
        const index = prev.findIndex(loc => String(loc.userId) === String(data.userId));
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        }
        return [...prev, data];
      });
      
      // Sync with server after 500ms
      setTimeout(() => {
        if (isMountedRef.current) {
          fetchAllData(1); // Single retry for sync
        }
      }, 500);
    };

    const handleSocketError = (error: any) => {
      console.warn('Socket error:', error);
    };

    const handleSocketDisconnect = (reason: string) => {
      console.log('Socket disconnected:', reason);
    };

    socket.on('location:update', handleLocationUpdate);
    socket.on('error', handleSocketError);
    socket.on('disconnect', handleSocketDisconnect);

    return () => {
      socket.off('location:update', handleLocationUpdate);
      socket.off('error', handleSocketError);
      socket.off('disconnect', handleSocketDisconnect);
      
      try {
        socket.emit('leave', { room: roomName });
        console.log('[SOCKET] ❌ Left room:', roomName);
      } catch (error) {
        console.warn('Socket leave error:', error);
      }
    };
  }, [groupId, fetchAllData]);

  // 7. Periodic refresh với adaptive interval
  useEffect(() => {
    if (!isSharing) return;
    
    fetchAllData();
    const interval = setInterval(() => {
      if (isMountedRef.current && isSharing) {
        fetchAllData(1); // Single retry for periodic refresh
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchAllData, isSharing]);

  // 8. Cleanup khi rời màn hình
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (watchId.current) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      updateLocation(groupId, userId, null, null, false);
    };
  }, [groupId, userId]);

  return {
    members,
    locations,
    loading,
    myLocation,
    locationError,
    locationStatus,
    refetch: fetchAllData,
  };
};
