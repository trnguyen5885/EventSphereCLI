/* eslint-disable react-native/no-inline-styles */
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  Linking,
  BackHandler,
  RefreshControl, // Thêm RefreshControl
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { globalStyles } from '../../constants/globalStyles';
import { appColors } from '../../constants/appColors';
import {
  CircleComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import {
  ArrowRight2,
  HambergerMenu,
  SearchNormal1,
  Sort,
} from 'iconsax-react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fontFamilies } from '../../constants/fontFamilies';
import CategoriesList from '../../components/CategoriesList';
import EventItem from '../../components/EventItem';
import { AxiosInstance } from '../../services';
import LoadingModal from '../../modals/LoadingModal';
import BannerComponent from './components/BannerComponent';
import Geolocation from '@react-native-community/geolocation';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { EventModel } from '@/app/models';
import TabComponent from './components/TabComponent';
import PopularEventsScreen from './components/PopularEventsScreen';
import UpcomingEventsScreen from './components/UpcomingEventsScreen';
import SuggestedEventsScreen from './components/SuggestedEventsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { setLocation as setLocationRedux } from '../../redux/slices/authSlice';

const ExploreScreen = ({ navigation }: any) => {
  const [populateEvents, setPopulateEvents] = useState<EventModel[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Thêm state cho refreshing
  const tabs = [
    { id: 0, name: 'Đề xuất' },
    { id: 1, name: 'Nổi bật' },
    { id: 2, name: 'Sắp diễn ra' },
  ];
  const [activeTab, setActiveTab] = useState(0);
  const [location, setLocationState] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });
  const [address, setAddress] = useState<{
    compound?: {
      district?: string;
      province?: string;
    };
  }>();
  const dispatch = useDispatch();

  // Xử lý nút Back - hiển thị dialog xác nhận thoát app
  const handleBackPress = useCallback(() => {
    Alert.alert(
      'Thoát ứng dụng',
      'Bạn có muốn thoát ứng dụng không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
          onPress: () => null,
        },
        {
          text: 'Thoát',
          style: 'destructive',
          onPress: () => BackHandler.exitApp(),
        },
      ],
      { cancelable: false },
    );
    return true; // Ngăn chặn hành vi back mặc định
  }, []);

  // Sử dụng useFocusEffect để đăng ký/hủy đăng ký BackHandler
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress,
      );

      return () => backHandler.remove();
    }, [handleBackPress]),
  );

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
              {
                text: 'Thử lại',
                onPress: () => requestLocationPermission(),
              },
              {
                text: 'Hủy',
                style: 'cancel',
              },
            ],
            { cancelable: false },
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
      message: 'GPS của bạn chưa bật. Bạn có muốn bật GPS không?',
      ok: 'Mở',
      cancel: 'Hủy',
    })
      .then((success: any) => {
        if (success) {
          getLocation();
        }
      })
      .catch((error: any) => {
        Alert.alert('Lỗi', 'Vui lòng bật GPS để tiếp tục.');
      });
  };

  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number,
  ) => {
    const apiKey = 'pJ2xud8j3xprqVfQZLFKjGV51MPH60VjRuZh1i3F';
    const url = `https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${apiKey}`;
    try {
      const response = await axios.get(url, { timeout: 10000 });
      if (response?.data?.results?.length > 0) {
        const address = response.data.results[0];
        setAddress(address);
        console.log('ExploreScrenn 94 | Dữ liệu địa chỉ:', address);
      } else {
        console.log('Không tìm thấy địa chỉ.');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API Geocoding:', error);
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        console.log('ExploreScreen 107 | UserLocation:', latitude, longitude);
        setLocationState({ latitude, longitude });
        dispatch(setLocationRedux({ latitude, longitude }));
        getAddressFromCoordinates(latitude, longitude);
      },
      error => {
        console.log('Error getting location', error);
      },
      {
        enableHighAccuracy: true,
      },
    );
  };

  // Xử lý location permission khi focus vào màn hình
  useFocusEffect(
    React.useCallback(() => {
      const timeout = setTimeout(() => {
        requestLocationPermission();
      }, 3000);

      return () => clearTimeout(timeout);
    }, []),
  );

  // Hàm fetch events - tách riêng để sử dụng lại
  const fetchEvents = async () => {
    try {
      const response = await AxiosInstance().get<EventModel[], any>(
        'events/home',
      );
      const res = await AxiosInstance().get<EventModel[], any>(
        'interactions/topViewed',
      );
      setPopulateEvents(response);
      const now = Date.now();
      const ongoingEvents = response.filter(
        (eventItem: EventModel) =>
          now >= eventItem.timeStart && now <= eventItem.timeEnd,
      );
      const upcomingEvents = response.filter(
        (eventItem: EventModel) => eventItem.timeStart > now,
      );
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const getEvents = async () => {
      try {
        await fetchEvents();
        setIsLoading(false);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };
    getEvents();
    return () => {
      setPopulateEvents([]);
    };
  }, []);

  // Hàm xử lý pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchEvents();
      // Có thể thêm refresh location nếu cần
      // requestLocationPermission();
    } catch (error) {
      console.log('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleInteraction = async (id: string) => {
    try {
      const body = {
        eventId: id,
        type: 'view',
      };
      await AxiosInstance().post('interactions/addInteraction', body);
    } catch (e) {
      console.log('Error handle interaction: ', e);
    }
  };

  if (isLoading) {
    return <LoadingModal visible={true} />;
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.9)' }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[appColors.primary]} // Android
          tintColor={appColors.primary} // iOS
          title="Đang cập nhật..." // iOS
          titleColor={appColors.primary} // iOS
        />
      }
    >
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={appColors.primary}
      />
      <View
        style={{
          backgroundColor: appColors.primary,
          height: 70 + (Platform.OS === 'ios' ? 16 : 0),
          paddingVertical: 15
        }}>
        <View style={{ paddingHorizontal: 16 }}>
          <RowComponent>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <HambergerMenu size={24} color={appColors.white} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <TouchableOpacity onPress={requestLocationPermission}>
                <RowComponent>
                  <TextComponent
                    text="Vị trí hiện tại của bạn"
                    color={appColors.white2}
                    size={12}
                  />
                </RowComponent>
                <TextComponent
                  text={
                    address?.compound?.district && address?.compound?.province
                      ? `${address.compound.district}, ${address.compound.province}`
                      : 'Đang lấy vị trí của bạn...'
                  }
                  flex={0}
                  color={appColors.white}
                  font={fontFamilies.medium}
                  size={13}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Search')}>
              <CircleComponent color="#524CE0" size={36}>
                <View>
                  <Ionicons name="search-outline" size={20} color="#fff" />
                  
                </View>
              </CircleComponent>
            </TouchableOpacity>
          </RowComponent>

          
        </View>
      </View>

      <SuggestedEventsScreen
        populateEvents={populateEvents}
        handleInteraction={handleInteraction}
        navigation={navigation}
      />
    </ScrollView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  paddingContent: {
    paddingHorizontal: 12,
  },
});