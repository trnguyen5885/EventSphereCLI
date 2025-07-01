import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {EventModel} from '@/app/models';
import {globalStyles} from '../../../constants/globalStyles';
import {appColors} from '../../../constants/appColors';
import {RowComponent, TextComponent} from '../../../components';
import {ArrowRight2} from 'iconsax-react-native';
import EventItem from '../../../components/EventItem';
import {AxiosInstance} from '../../../services';
import BannerComponent from '../components/BannerComponent';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import TopEventItem from './TopEventItem';
import SVG1 from '../../../../assets/svgs/SVG1.svg';
import SVG2 from '../../../../assets/svgs/SVG2.svg';
import SVG3 from '../../../../assets/svgs/SVG3.svg';
import SVG4 from '../../../../assets/svgs/SVG4.svg';
import SVG5 from '../../../../assets/svgs/SVG5.svg';
import SVG6 from '../../../../assets/svgs/SVG6.svg';
import SVG7 from '../../../../assets/svgs/SVG7.svg';
import SVG8 from '../../../../assets/svgs/SVG8.svg';
import SVG9 from '../../../../assets/svgs/SVG9.svg';
import SVG10 from '../../../../assets/svgs/SVG10.svg';
import BassicBannerComponent from './BassicBannerComponent';

const SVGItems = [
  {
    Svg: SVG1,
  },
  {
    Svg: SVG2,
  },
  {
    Svg: SVG3,
  },
  {
    Svg: SVG4,
  },
  {
    Svg: SVG5,
  },
  {
    Svg: SVG6,
  },
  {
    Svg: SVG7,
  },
  {
    Svg: SVG8,
  },
  {
    Svg: SVG9,
  },
  {
    Svg: SVG10,
  },
];

interface SuggestedEventsScreenProps {
  populateEvents: EventModel[] | undefined;
  handleInteraction: (id: string) => Promise<void>;
  navigation: any;
}

const EventSection = ({
  title,
  data,
  onPressItem,
}: {
  title: string;
  data?: EventModel[];
  onPressMore?: () => void;
  onPressItem: (item: EventModel) => void;
}) => {
  if (!data || data.length === 0) return null;
  // const tabBarHeight = useBottomTabBarHeight();
  return (
    <View style={{marginVertical: 12}}>
      <View
        style={[
          globalStyles.row,
          styles.paddingContent,
          {marginVertical: 15, justifyContent: 'space-between'},
        ]}>
        <TextComponent text={title} size={18} title />
      </View>
      <View style={{marginLeft: 6}}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <EventItem
              onPress={() => onPressItem(item)}
              type="card"
              item={item}
            />
          )}
        />
      </View>
    </View>
  );
};

const EventTopSection = ({
  title,
  data,
  onPressItem,
}: {
  title: string;
  data?: EventModel[];
  onPressMore?: () => void;
  onPressItem: (item: EventModel) => void;
}) => {
  if (!data || data.length === 0) return null;
  // const tabBarHeight = useBottomTabBarHeight();
  return (
    <View style={{marginVertical: 15}}>
      <View
        style={[
          globalStyles.row,
          styles.paddingContent,
          {marginVertical: 15, justifyContent: 'space-between'},
        ]}>
        <TextComponent text={title} size={18} title />
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => item._id}
        renderItem={({item, index}) => {
          const SvgIcon = SVGItems[index % SVGItems.length].Svg;
          return (
            <TopEventItem
              onPress={() => onPressItem(item)}
              item={item}
              SVGIcon={SvgIcon}
            />
          );
        }}
      />
    </View>
  );
};

const SuggestedEventsScreen = ({
  handleInteraction,
  navigation,
}: SuggestedEventsScreenProps) => {
  const [eventsOngoing, setEventsOngoing] = useState<EventModel[]>([]);
  const [eventsUpcoming, setEventsUpcoming] = useState<EventModel[]>([]);
  const [eventsTrending, setEventsTrending] = useState<EventModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEvents = async () => {
    try {
      const response = await AxiosInstance().get<EventModel[]>('events/home');
      const now = Date.now();

      const allEvents = response.data || [];

      const ongoing = allEvents.filter(
        e => now >= e.timeStart && now <= e.timeEnd,
      );
      const upcoming = allEvents.filter(e => e.timeStart > now);

      setEventsOngoing(ongoing);
      setEventsUpcoming(upcoming);
      setEventsTrending(allEvents.slice(0, 10)); // Thay đổi logic nếu có trường trending riêng
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    return () => {
      setEventsOngoing([]);
      setEventsUpcoming([]);
      setEventsTrending([]);
    };
  }, []);

  const onPressEvent = useCallback(
    (item: EventModel) => {
      handleInteraction(item._id);
      navigation.navigate('Detail', {id: item._id});
    },
    [handleInteraction, navigation],
  );

  if (loading) {
    return <ActivityIndicator style={{marginTop: 40}} />;
  }

  return (
    <ScrollView
      contentContainerStyle={{paddingBottom: 20}}
      showsVerticalScrollIndicator={false}>
      <BassicBannerComponent
        events={[...eventsOngoing, ...eventsUpcoming].slice(0, 5)}
      />

      <EventTopSection
        title="Sự kiện xu hướng 🔥"
        data={eventsTrending}
        onPressItem={onPressEvent}
      />

      <EventSection
        title="Sự kiện đang diễn ra 🎉"
        data={eventsOngoing}
        onPressItem={onPressEvent}
      />

      <EventSection
        title="Sự kiện sắp diễn ra ⏰"
        data={eventsUpcoming}
        onPressItem={onPressEvent}
      />
    </ScrollView>
  );
};

export default SuggestedEventsScreen;

const styles = StyleSheet.create({
  paddingContent: {
    paddingHorizontal: 12,
  },
});
