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
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {globalStyles} from '../../constants/globalStyles';
import {appColors} from '../../constants/appColors';
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
import Geolocation from '@react-native-community/geolocation'; // Import Geolocation
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {EventModel} from '@/app/models';

const ExploreScreen = ({ navigation }: any) => {
  const [eventsIscoming, setEventsIscoming] = useState<EventModel[]>();
  const [eventsUpcoming, setEventsUpcoming] = useState<EventModel[]>();
  const [populateEvents, setPopulateEvents] = useState<EventModel[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<{
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

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          checkGPSStatus(); // Kiểm tra xem GPS đã bật chưa
        } else {
          Alert.alert(
            'Quyền bị từ chối',
            'Vui lòng cấp quyền vị trí để tiếp tục',
            [
              {
                text: 'Thử lại',
                onPress: () => requestLocationPermission(), // Gọi lại chính nó
              },
              {
                text: 'Hủy',
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      checkGPSStatus(); // iOS tự động xử lý quyền
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
          getLocation(); // Nếu GPS đã bật, gọi hàm lấy vị trí
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
      const response = await axios.get(url, {timeout: 10000});
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
        const {latitude, longitude} = position.coords;
        console.log('ExploreScreen 107 | UserLocation:', latitude, longitude);
        // Cập nhật state
        setLocation({latitude, longitude});
        // Gọi API Geocoding với giá trị đúng
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

  // Gọi hàm yêu cầu quyền truy cập khi ứng dụng khởi động
  useFocusEffect(
    React.useCallback(() => {
      const timeout = setTimeout(() => {
        requestLocationPermission(); // Gọi sau 5 giây
      }, 3000);

      // Cleanup nếu người dùng rời khỏi màn hình trước khi timeout
      return () => clearTimeout(timeout);
    }, []),
  );
  useEffect(() => {
    // setIsLoading(true);
    const getEvents = async () => {
      try {
        const response = await AxiosInstance().get<EventModel[], any>(
          'events/all',
        );
        console.log(response);
        const res = await AxiosInstance().get<EventModel[], any>(
          'interactions/topViewed',
        );
        setPopulateEvents(res);
        const now = Date.now();
        const ongoingEvents = response.filter(
          (eventItem: EventModel) =>
            now >= eventItem.timeStart && now <= eventItem.timeEnd,
        );
        setEventsIscoming(ongoingEvents);
        const upcomingEvents = response.filter(
          (eventItem: EventModel) => eventItem.timeStart > now,
        );
        setEventsUpcoming(upcomingEvents);
        setIsLoading(false);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };
    getEvents();
    return () => {
      setEventsIscoming([]);
      setEventsUpcoming([]);
      setPopulateEvents([]);
    };
  }, []);

  const handleInteraction = async (id: string) => {
    try {
      const body = {
        eventId: id,
        type: "view"
      }
      await AxiosInstance().post('interactions/addInteraction', body);
    } catch (e) {
      console.log("Error handle interaction: ", e)
    }
  }

  if (isLoading) {
    return <LoadingModal visible={true} />;
  }
  
  return (
    <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={appColors.primary}
      />
      <View
        style={{
          backgroundColor: appColors.primary,
          height: 178 + (Platform.OS === 'ios' ? 16 : 0),
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 52,
        }}>
        <View style={{ marginBottom: 7, paddingHorizontal: 16 }}>
          <RowComponent>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <HambergerMenu size={24} color={appColors.white} />
            </TouchableOpacity>
            <View style={{flex: 1, alignItems: 'center'}}>
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
              onPress={() => navigation.navigate('FriendSearchScreen')}
              style={{ marginRight: 8 }}>
              <CircleComponent color="#524CE0" size={36}>
                <MaterialIcons name="group" size={24} color={appColors.white} />
              </CircleComponent>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notification')}>
              <CircleComponent color="#524CE0" size={36}>
                <View>
                  <MaterialIcons
                    name="notifications"
                    size={24}
                    color={appColors.white}
                  />
                  <View
                    style={{
                      backgroundColor: '#02E9FE',
                      width: 10,
                      height: 10,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: '#524CE0',
                      position: 'absolute',
                      top: -2,
                      right: -2,
                    }}
                  />
                </View>
              </CircleComponent>
            </TouchableOpacity>
          </RowComponent>

          <SpaceComponent height={24} />
          <RowComponent>
            <RowComponent
              onPress={() => navigation.navigate('Search')}
              styles={{flex: 1}}>
              <SearchNormal1
                variant="TwoTone"
                size={22}
                color={appColors.white}
              />
              <View
                style={{
                  width: 1,
                  height: 18,
                  marginHorizontal: 12,
                  backgroundColor: '#A29EF0',
                }}
              />
              <TextComponent text="Tìm kiếm..." color={'#A29EF0'} flex={1} />
            </RowComponent>
            <RowComponent
              styles={{
                backgroundColor: '#5D56F3',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 100,
              }}>
              <CircleComponent size={19.3} color={'#A29EF0'}>
                <Sort size={12} color={appColors.primary} />
              </CircleComponent>
              <SpaceComponent width={8} />
              <TextComponent text="Lọc" color={appColors.white} />
            </RowComponent>
          </RowComponent>
        </View>
        <CategoriesList isColor={true} />
      </View>

      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={{flex: 1, paddingTop: 25}}>
        <BannerComponent bannerData={eventsIscoming} />

        {populateEvents && (
            <>
              <View
                style={[
                  globalStyles.row,
                  styles.paddingContent,
                  { marginTop: 15, justifyContent: 'space-between' },
                ]}>
                <TextComponent text="Sự kiện nổi bật" size={18} title />
              </View>

              <FlatList
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                data={populateEvents}
                renderItem={({ item }) => (
                  <EventItem
                    onPress={() => {
                      handleInteraction(item._id);
                      navigation.navigate('Detail', {
                        id: item.eventId,
                      });
                    }}
                    type="card"
                    item={item}
                  />
                )}
              />
            </>
          )}

        <View
          style={[
            globalStyles.row,
            styles.paddingContent,
            { marginTop: 15, justifyContent: 'space-between' },
          ]}>

          <TextComponent text="Sự kiện đang diễn ra" size={18} title />
          <RowComponent onPress={() => { }}>
            <TextComponent text="Xem thêm" size={16} color={appColors.gray} />
            <ArrowRight2 variant="Bold" size={14} color={appColors.gray} />
          </RowComponent>
        </View>

        <FlatList
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          data={eventsIscoming}
          renderItem={({ item }) => (
            <EventItem
              onPress={() => {
                handleInteraction(item._id);
                navigation.navigate('Detail', {
                  id: item._id,
                });
              }}
              type="card"
              item={item}
            />
          )}
        />

        {eventsUpcoming && (
          <>
            <View
              style={[
                globalStyles.row,
                styles.paddingContent,
                { marginTop: 15, justifyContent: 'space-between' },
              ]}>
              <TextComponent text="Sự kiện sắp diễn ra" size={18} title />
              <RowComponent onPress={() => { }}>
                <TextComponent
                  text="Xem thêm"
                  size={16}
                  color={appColors.gray}
                />
                <ArrowRight2 variant="Bold" size={14} color={appColors.gray} />
              </RowComponent>
            </View>

            <FlatList
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              data={eventsUpcoming}
              renderItem={({ item }) => (
                <EventItem
                  onPress={() => {
                    handleInteraction(item._id);
                    navigation.navigate('Detail', {
                      id: item._id,
                    });
                  }}
                  type="card"
                  item={item}
                />
              )}
            />
          </>
        )}
      </ScrollView>
    </ScrollView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  paddingContent: {
    paddingHorizontal: 12,
  },
});
