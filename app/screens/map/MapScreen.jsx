import React, {memo, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import Ionicons from 'react-native-vector-icons/Ionicons';
// Giả sử bạn có các file sau trong dự án, import cho đủ:
import {AxiosInstance} from '../../services'; // Instance axios config của bạn
import CategoriesListMap from '../map/CategoriesListMap'; // Component danh mục lọc
import {globalStyles} from '../../constants/globalStyles'; // Style chung
import {appColors} from '../../constants/appColors'; // Màu sắc dùng chung
import {formatDate} from '../../services'; // Hàm format ngày giờ
import CustomMarker from './CustomMarker';
import CustomMarkerUser from './CustomMarkerUser';
import FloatingControls from './FloatingControls';
const {width} = Dimensions.get('window');

const MapScreen = () => {
  const centerUserIcon = require('../../../assets/images/icon-LocationUser.png');
  const [allEvents, setAllEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [selectedEventsList, setSelectedEventsList] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [categoryIcons, setCategoryIcons] = useState([]);
  const initialRegion = {
    latitude: 14.0583,
    longitude: 108.2772,
    latitudeDelta: 15,
    longitudeDelta: 15,
  };
  const [region, setRegion] = useState(initialRegion);

  const eventListRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
    fetchEvents();
    return () => {
      LocationServicesDialogBox.stopListener();
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await AxiosInstance().get('events/all');
      if (response) {
        setAllEvents(response);
        setDisplayedEvents(response);
      } else {
        console.warn('Dữ liệu sự kiện không hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi khi lấy sự kiện:', error);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          checkGPSStatus();
        } else {
          Alert.alert(
            'Quyền bị từ chối',
            'Vui lòng cấp quyền vị trí để tiếp tục',
            [
              {text: 'Thử lại', onPress: requestLocationPermission},
              {text: 'Hủy', style: 'cancel'},
            ],
          );
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
      message: 'GPS chưa bật. Bạn có muốn bật GPS không?',
      ok: 'Mở',
      cancel: 'Hủy',
    })
      .then(success => {
        if (success.enabled) getLocation();
      })
      .catch(() => {
        Alert.alert('Lỗi', 'Vui lòng bật GPS để tiếp tục.');
      });
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        setUserLocation({latitude, longitude});
      },
      error => {
        console.warn(error);
        setTimeout(() => getLocation(), 2000);
      },
      {enableHighAccuracy: true},
    );
  };

  const centerToUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    } else {
      getLocation();
    }
  };

  const zoomIn = () => {
    if (!region || !mapRef.current) return;
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 0.6,
      longitudeDelta: region.longitudeDelta * 0.6,
    };
    setRegion(newRegion);
    mapRef.current.animateToRegion(newRegion, 300);
  };

  const zoomOut = () => {
    if (!region || !mapRef.current) return;
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 1.4,
      longitudeDelta: region.longitudeDelta * 1.4,
    };
    setRegion(newRegion);
    mapRef.current.animateToRegion(newRegion, 300);
  };

  const handleSelectEvents = events => {
    setDisplayedEvents(events);
    setSelectedEventsList(events);
  };

  const handleEventPress = item => {
    const coordinates = item?.location_map?.coordinates;
    const isValidLocation =
      coordinates &&
      Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      typeof coordinates[0] === 'number' &&
      typeof coordinates[1] === 'number';

    if (isValidLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coordinates[1],
          longitude: coordinates[0],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    } else {
      console.warn(`Sự kiện "${item.name}" không có tọa độ hợp lệ.`);
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.eventBox}
      onPress={() => handleEventPress(item)}>
      <Text style={styles.eventName} numberOfLines={1}>
        {item.name}
      </Text>
      <View style={styles.eventItemContainer}>
        <Image source={{uri: item.avatar}} style={styles.avatar} />
        <View style={styles.textContainer}>
          <View style={[globalStyles.row, {columnGap: 5}]}>
            <View>
              <Ionicons name="calendar" size={18} color={appColors.primary} />
            </View>
            <View style={globalStyles.row}>
              <Text>{`${formatDate(item.timeStart)} - `}</Text>
              <Text>{formatDate(item.timeEnd)}</Text>
            </View>
          </View>
          <View style={globalStyles.row}>
            <Ionicons name="location-sharp" size={16} color="#A5A7B5" />
            <Text
              style={styles.locationText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.location}
            </Text>
          </View>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        initialRegion={initialRegion}
        onRegionChangeComplete={region => setRegion(region)}>
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Vị trí của bạn"
            pinColor="blue">
            <CustomMarkerUser />
          </Marker>
        )}
        {displayedEvents
          .filter(
            e =>
              e.location_map?.coordinates?.length === 2 &&
              typeof e.location_map.coordinates[0] === 'number' &&
              typeof e.location_map.coordinates[1] === 'number',
          )
          .map(e => {
            const categoryInfo = categoryIcons.find(c => c.id == e.categories);

            return (
              <Marker
                key={e._id}
                coordinate={{
                  latitude: e.location_map.coordinates[1],
                  longitude: e.location_map.coordinates[0],
                }}
                title={e.name}
                onPress={() => {
                  const index = displayedEvents.findIndex(
                    item => item._id === e._id,
                  );
                  const maxIndex = displayedEvents.length - 1;

                  if (index !== -1 && index <= maxIndex) {
                    setSelectedEventsList([e]);
                    setTimeout(() => {
                      try {
                        eventListRef.current?.scrollToIndex({
                          index: Math.min(index, maxIndex),
                          animated: true,
                        });
                      } catch (error) {
                        console.warn('scrollToIndex error:', error);
                      }
                    }, 500);
                  }
                }}>
                <CustomMarker
                  icon={categoryInfo?.icon || 'apps'}
                  color={categoryInfo?.color || '#EE544A'}
                />
              </Marker>
            );
          })}
      </MapView>

      <FloatingControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onCenterUser={centerToUser}
        centerUserIcon={centerUserIcon}
        centerUserButtonStyle={{width: 50, height: 50}}
        zoomInButtonStyle={{width: 30, height: 30}}
        zoomOutButtonStyle={{width: 30, height: 30}}
        style={{top: 80, right: 20}}
      />

      <View style={styles.categoryWrapper}>
        <CategoriesListMap
          onSelectEvents={handleSelectEvents}
          userLocation={userLocation}
          onCategoryIconsChange={setCategoryIcons}
        />
      </View>

      {selectedEventsList.length > 0 && (
        <View style={styles.eventListBox}>
          <FlatList
            data={selectedEventsList}
            ref={eventListRef}
            keyExtractor={item => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width * 0.8 + 16}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: (width - width * 0.87) / 2,
            }}
            renderItem={renderItem}
          />
        </View>
      )}
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  centerButton: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    elevation: 4,
  },
  centerButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  categoryWrapper: {
    position: 'absolute',
    top: 20,
    right: 20,
    left: 25,
    zIndex: 10,
  },
  eventListBox: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  eventBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    elevation: 5,
    marginHorizontal: 8,
    width: width * 0.8,
  },
  eventItemContainer: {
    flexDirection: 'row',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  eventName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  locationText: {
    color: '#A5A7B5',
    marginLeft: 4,
    fontSize: 14,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#5669FF',
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {textAlign: 'center', color: '#fff', fontWeight: 'bold'},
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
  markerContainer: {
    borderWidth: 2,
    borderRadius: 25,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
