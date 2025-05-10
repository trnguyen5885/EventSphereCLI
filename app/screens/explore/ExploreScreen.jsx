/* eslint-disable react-native/no-inline-styles */
import {
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import React, { useEffect, useState } from 'react';
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
import  {AxiosInstance}  from '../../services';
import LoadingModal from '../../modals/LoadingModal';
import BannerComponent from './components/BannerComponent';

const ExploreScreen = ({navigation}) => {
  const [eventsIscoming, setEventsIscoming] = useState([]);
  const [eventsUpcoming, setEventsUpcoming] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // setIsLoading(true);
    const getEvents = async () => {
      try {
        const response = await AxiosInstance().get('events/all');
        console.log(response);
        const now = Date.now();
        const ongoingEvents = response.filter(eventItem => now >= eventItem.timeStart && now <= eventItem.timeEnd);
        console.log(ongoingEvents);
        setEventsIscoming(ongoingEvents);
        const upcomingEvents = response.filter(eventItem => eventItem.timeStart > now);
        setEventsUpcoming(upcomingEvents);
        setIsLoading(false);
      } catch(e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }

    };
    getEvents();
    return () => {
      setEventsIscoming([]);
      setEventsUpcoming([]);
    };
  }, []);

  if(isLoading) {
    return <LoadingModal  />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={appColors.primary}
      />

      <View
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          backgroundColor: appColors.primary,
          height: 178 + (Platform.OS === 'ios' ? 16 : 0),
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 52,
        }}>
        <View style={{ marginBottom: 7, paddingHorizontal: 16 }}>
          <RowComponent>
            <TouchableOpacity onPress={() => {navigation.openDrawer();}}>
              <HambergerMenu size={24} color={appColors.white} />
            </TouchableOpacity>
            <View style={[{ flex: 1, alignItems: 'center' }]}>
              <RowComponent>
                <TextComponent
                  text="Vị trí hiện tại của bạn"
                  color={appColors.white2}
                  size={12}
                />
              </RowComponent>
              <TextComponent
                text="Hồ Chí Minh, Việt Nam"
                flex={0}
                color={appColors.white}
                font={fontFamilies.medium}
                size={13}
              />
            </View>
            <TouchableOpacity onPress={()=>navigation.navigate('FriendSearchScreen')} style={{marginRight: 8}}>
              <CircleComponent color="#524CE0" size={36}>
                <MaterialIcons
                  name="group"
                  size={24}
                  color={appColors.white}
                />
              </CircleComponent>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>navigation.navigate('Notification')}>
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
            <RowComponent onPress={() => {
              navigation.navigate('Search');
            }} styles={{ flex: 1 }}>
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
        <View>
          <CategoriesList isColor={true} />
        </View>

      </View>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={[
          {
            flex: 1,
            paddingTop: 25,
          },
        ]}>

          <BannerComponent bannerData={eventsIscoming} />
        <View style={[globalStyles.row, styles.paddingContent  ,{ marginTop: 15, justifyContent: 'space-between' }]}>
          <TextComponent text="Sự kiện đang diễn ra" size={18} title />
          <RowComponent onPress={() => {}}>
            <TextComponent text="Xem thêm" size={16} color={appColors.gray} />
            <ArrowRight2 variant="Bold" size={14} color={appColors.gray} />
          </RowComponent>
        </View>

        <FlatList
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          data={eventsIscoming}
          renderItem={({ item }) => <EventItem onPress={() => {
            navigation.navigate('Detail', {
              id: item._id
            });
          }} type="card" item={item} />}
        />

        <View style={[globalStyles.row, styles.paddingContent, { marginTop: 15, justifyContent: 'space-between' }]}>
          <TextComponent text="Sự kiện sắp diễn ra" size={18} title />
          <RowComponent onPress={() => {}}>
            <TextComponent text="Xem thêm" size={16} color={appColors.gray} />
            <ArrowRight2 variant="Bold" size={14} color={appColors.gray} />
          </RowComponent>
        </View>

        <FlatList
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          data={eventsUpcoming}
          renderItem={({ item }) => <EventItem onPress={() => {
            navigation.navigate('Detail', {
              id: item._id
            });
          }} type="card" item={item} />}
        />
      </ScrollView>
    </ScrollView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  paddingContent: {
    paddingHorizontal: 12,
  }
});
