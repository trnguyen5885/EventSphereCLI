import React, {useState, useEffect, useRef, memo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Alert,
  Platform,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {appColors} from '../../constants/appColors';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import MapView, {Marker} from 'react-native-maps';
import {useFocusEffect} from '@react-navigation/native';
import {AxiosInstance} from '../../services';
import CategoriesListMap from '../map/CategoriesListMap';
import {globalStyles} from '../../constants/globalStyles';
import {formatDate} from '../../services';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const MapScreen = ({navigation, route}) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [region, setRegion] = useState(null);
  const mapRef = useRef(null);
  const {eventsForCategory = []} = route.params || {};
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [categoryIcons, setCategoryIcons] = useState([]);

  // Tối ưu hóa CustomMarker với memo để ngăn re-render không cần thiết
  const CustomMarker = memo(({categoryId}) => {
    const category = categoryIcons.find(cat => cat.id === categoryId);
    const iconName = category ? category.icon : 'location-pin';

    return (
      <View style={styles.markerContainer}>
        <View style={styles.markerCircle}>
          <MaterialIcons name={iconName} size={20} color="blue" />
        </View>
      </View>
    );
  });

  // Tối ưu hóa CustomMarkerUser với memo
  const CustomMarkerUser = memo(() => (
    <View style={styles.markerContainer}>
      <View style={styles.markerCircle}>
        <Image
          source={{
            uri: 'https://www.bing.com/th/id/OIP.n2J-te2edVD91F8w6udMmgHaHa?w=206&h=206&c=8&rs=1&qlt=90&o=6&dpr=1.2&pid=3.1&rm=2',
          }}
          style={{width: 34, height: 34, borderRadius: 20}}
          resizeMode="contain"
        />
      </View>
    </View>
  ));

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          checkGPSStatus();
        } else {
          Alert.alert('Permission denied', 'Location permission is required');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      checkGPSStatus();
    }
  };

  const checkGPSStatus = () => {
    LocationServicesDialogBox.checkLocationServicesIsEnabled({
      message: 'GPS của bạn chưa bật. Bạn có muốn bật GPS không?',
      ok: 'Mở',
      cancel: 'Hủy',
    })
      .then(success => {
        if (success) {
          getLocation();
        }
      })
      .catch(error => {
        Alert.alert('Lỗi', 'Vui lòng bật GPS để tiếp tục.');
      });
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        console.log('Location:', latitude, longitude);
        setLocation({latitude, longitude});
        setMapRegion(latitude, longitude);
      },
      error => {
        console.log('Error getting location', error);
      },
      {
        enableHighAccuracy: true,
      },
    );
  };

  const getEvents = async () => {
    try {
      const response = await AxiosInstance().get('/events/home');
      setEvents(response.data);
      console.log('Fetched events:', response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      requestLocationPermission();
      getEvents();
    }, []),
  );

  useEffect(() => {
    if (eventsForCategory.length > 0) {
      setDisplayedEvents(eventsForCategory);
      setSelectedEvent(null);
    }
  }, [eventsForCategory]);

  useEffect(() => {
    if (route.params?.categoryIcons) {
      setCategoryIcons(route.params.categoryIcons);
    }
    console.log('Icon', categoryIcons);
  }, [route.params?.categoryIcons]);

  // Hàm tái sử dụng để thiết lập region với animation
  const setMapRegion = (
    latitude,
    longitude,
    latitudeDelta = 0.0922,
    longitudeDelta = 0.0421,
  ) => {
    const newRegion = {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    };
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 300);
      console.log('Set region:', newRegion);
    }
  };

  // Zoom in: Phóng to bản đồ
  const zoomIn = () => {
    if (!region || !mapRef.current) return;
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 0.6,
      longitudeDelta: region.longitudeDelta * 0.6,
    };
    setRegion(newRegion);
    mapRef.current.animateToRegion(newRegion, 300);
    console.log('Zoom in:', newRegion);
  };

  // Zoom out: Thu nhỏ bản đồ
  const zoomOut = () => {
    if (!region || !mapRef.current) return;
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 1.4,
      longitudeDelta: region.longitudeDelta * 1.4,
    };
    setRegion(newRegion);
    mapRef.current.animateToRegion(newRegion, 300);
    console.log('Zoom out:', newRegion);
  };

  // Zoom tới vị trí người dùng
  const zoomToUserLocation = () => {
    if (location && mapRef.current) {
      const newRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 300);
      console.log('Zoom to user:', newRegion);
    }
  };

  // Điều chỉnh kích thước marker dựa trên mức zoom
  const getMarkerScale = () => {
    if (!region) return 1;
    return region.latitudeDelta > 0.1
      ? 0.7
      : region.latitudeDelta > 0.05
      ? 1
      : 1.2;
  };

  // Lọc marker chỉ hiển thị trong vùng bản đồ hiện tại
  const getVisibleMarkers = () => {
    if (!region) return events;
    const {latitude, longitude, latitudeDelta, longitudeDelta} = region;
    return events.filter(event => {
      if (!event.latitude || !event.longitude) return false;
      return (
        event.latitude >= latitude - latitudeDelta &&
        event.latitude <= latitude + latitudeDelta &&
        event.longitude >= longitude - longitudeDelta &&
        event.longitude <= longitude + longitudeDelta
      );
    });
  };

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        // Bỏ onRegionChangeComplete để giảm re-render
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Vị trí của bạn"
          description="Bạn đang ở đây"
          style={{transform: [{scale: getMarkerScale()}]}}>
          <CustomMarkerUser />
        </Marker>

        {getVisibleMarkers().map(event => {
          if (event.latitude && event.longitude) {
            return (
              <Marker
                key={event.id || `${event.latitude}-${event.longitude}`} // Sử dụng id hoặc tọa độ làm key
                coordinate={{
                  latitude: event.latitude,
                  longitude: event.longitude,
                }}
                title={event.name}
                onPress={() => {
                  setSelectedEvent(event);
                  setDisplayedEvents([event]);
                }}
                style={{transform: [{scale: getMarkerScale()}]}}>
                <CustomMarker categoryId={event.categories} />
              </Marker>
            );
          }
          return null;
        })}
      </MapView>
      <View
        style={{
          width: '100%',
          position: 'absolute',
          top: 20,
          right: 20,
          paddingLeft: 25,
          zIndex: 10,
        }}>
        <CategoriesListMap isColor={false} />
      </View>
      <View style={styles.zoomControls}>
        <TouchableOpacity
          onPress={zoomIn}
          style={[styles.zoomButton, {zIndex: 20}]}
          activeOpacity={0.7}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={zoomOut}
          style={[styles.zoomButton, {zIndex: 20}]}
          activeOpacity={0.7}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={zoomToUserLocation}
        style={[styles.zoomToUserButton, {zIndex: 20}]}
        activeOpacity={0.7}>
        <Image
          source={{
            uri: 'https://res.cloudinary.com/deoqppiun/image/upload/v1746240453/Group_18497_ywsmmq.png',
          }}
          style={styles.zoomIcon}
        />
      </TouchableOpacity>
      {displayedEvents.length > 0 && (
        <FlatList
          data={displayedEvents}
          horizontal
          keyExtractor={item => item.id?.toString() || item.name} // Tối ưu keyExtractor
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                navigation.navigate('Detail', {
                  id: item._id,
                });
              }}>
              <Image
                source={{
                  uri: item.avatar,
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemContent}>
                <View style={[globalStyles.row, {marginTop: 5, columnGap: 5}]}>
                  <View>
                    <Ionicons
                      name="calendar"
                      size={18}
                      color={appColors.primary}
                    />
                  </View>
                  <View style={globalStyles.row}>
                    <Text style={{color: '#5669FF'}}>{`${formatDate(
                      item.timeStart,
                    )} - `}</Text>
                    <Text style={{color: '#5669FF'}}>
                      {formatDate(item.timeEnd)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemLocation} numberOfLines={1}>
                  {item.location || 'Địa điểm chưa rõ'}
                </Text>
                <Text style={{fontSize: 10, color: 'gray'}} numberOfLines={1}>
                  Nhấn vào để xem chi tiết
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{
            paddingHorizontal: 10,
          }}
          showsHorizontalScrollIndicator={false}
          style={{
            position: 'absolute',
            bottom: 30,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        />
      )}
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  zoomControls: {
    position: 'absolute',
    top: 170,
    right: 30,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 20,
  },
  zoomButton: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 5,
    elevation: 3,
  },
  zoomText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  zoomToUserButton: {
    position: 'absolute',
    top: 90,
    right: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 20,
    elevation: 3,
  },
  zoomIcon: {
    width: 24,
    height: 24,
  },
  itemContainer: {
    width: 327,
    height: 106,
    marginRight: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    alignItems: 'center',
    padding: 10,
  },
  itemImage: {
    width: 72,
    height: 92,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  itemContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemLocation: {
    fontSize: 12,
    color: 'gray',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCircle: {
    width: 35,
    height: 35,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
