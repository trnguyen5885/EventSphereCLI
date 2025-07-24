import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Animated,
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  Image,
} from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { EventModel } from '@/app/models';
import { globalStyles } from '../../../constants/globalStyles';
import { appColors } from '../../../constants/appColors';
import { RowComponent, TextComponent } from '../../../components';
import { ArrowRight2 } from 'iconsax-react-native';
import EventItem from '../../../components/EventItem';
import { AxiosInstance } from '../../../services';
import BannerComponent from '../components/BannerComponent';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
import SkeletonContent from 'react-native-skeleton-content';

interface SuggestedEventsScreenProps {
  populateEvents: EventModel[] | undefined;
  handleInteraction: (id: string) => Promise<void>;
  navigation: any;
  isLoading?: boolean;
}

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

const SkeletonPlaceholder = ({
  width,
  height,
  borderRadius = 8,
  style,
  showIcon = true,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  showIcon?: boolean;
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start(() => animate());
    };
    animate();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E1E9EE', '#F2F8FC'],
  });

  return (
    <Animated.View
      style={[
        {
          height,
          borderRadius,
          backgroundColor,
          justifyContent: 'center',
          alignItems: 'center',
          ...(width === '100%' ? { width: '100%' as const } : { width }),
        },
        style,
      ]}
    >
      {showIcon && (
        <Image
          source={require('../../../../assets/images/icon.png')}
          style={{
            width: 32,
            height: 32,
            opacity: 0.2,
            resizeMode: 'contain',
          }}
        />
      )}
    </Animated.View>
  );
};


const EventSection = ({
  title,
  data,
  onPressItem,
  loading = false,
}: {
  title: string;
  data?: EventModel[];
  onPressMore?: () => void;
  onPressItem: (item: EventModel) => void;
  loading?: boolean;
}) => {
  return (
    <View style={{ marginVertical: 12 }}>
      <View
        style={[
          globalStyles.row,
          styles.paddingContent,
          { marginVertical: 15, justifyContent: 'space-between' },
        ]}>
        <TextComponent text={title} size={18} title />
      </View>
      <View style={{ marginLeft: 6 }}>
        {loading ? (
          <View style={{ flexDirection: 'row' }}>
            {[1, 2, 3].map((_, index) => (
              <View key={index} style={{ marginRight: 12, padding: 8 }}>
                <SkeletonPlaceholder width={200} height={120} borderRadius={12} style={{}} />
                <View style={{ paddingTop: 8 }}>
                  <SkeletonPlaceholder width={160} height={16} style={{ marginBottom: 8 }} showIcon={false} />
                  <SkeletonPlaceholder width={120} height={14} style={{ marginBottom: 6 }} showIcon={false} />
                  <SkeletonPlaceholder width={80} height={12} showIcon={false} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={data}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <EventItem
                onPress={() => onPressItem(item)}
                type="card"
                item={item}
              />
            )}
          />
        )}
      </View>
    </View>
  );
};

const EventGridSection = ({
  title,
  data,
  onPressItem,
  onPressMore,
  loading = false,
}: {
  title: string;
  data?: EventModel[];
  onPressItem: (item: EventModel) => void;
  onPressMore?: () => void;
  loading?: boolean;
}) => {
  return (
    <View style={{ marginVertical: 12 }}>
      <View style={[globalStyles.row, styles.paddingContent, { justifyContent: 'space-between', marginBottom: 12 }]}>
        <TextComponent text={title} size={18} title />
        {onPressMore && (
          <TouchableOpacity
            onPress={onPressMore}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Text style={{ color: appColors.primary }}>Xem thêm</Text>
            <Ionicons name="chevron-forward-outline" size={16} color={appColors.primary} />
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <View style={{ paddingHorizontal: 12 }}>
          {[0, 1].map(row => (
            <View key={row} style={{ flexDirection: 'row', marginBottom: 12 }}>
              {[0, 1].map(col => (
                <View key={col} style={{ flex: 1, marginHorizontal: 6 }}>
                  <SkeletonPlaceholder width="100%" height={160} borderRadius={12} style={{}} />
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <View style={{ paddingHorizontal: 12 }}>
          {[0, 1].map(row => (
            <View key={row} style={{ flexDirection: 'row', marginBottom: 12 }}>
              {[0, 1].map(col => {
                const index = row * 2 + col;
                const item = data?.[index];
                if (!item) return <View key={col} style={{ flex: 1, marginHorizontal: 6 }} />;
                return (
                  <View key={item._id} style={{ flex: 1, marginHorizontal: 6 }}>
                    <EventItem
                      onPress={() => onPressItem(item)}
                      type="grid"
                      item={item}
                    />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};


const EventTopSection = ({
  title,
  data,
  onPressItem,
  loading = false,
}: {
  title: string;
  data?: EventModel[];
  onPressMore?: () => void;
  onPressItem: (item: EventModel) => void;
  loading?: boolean;
}) => {
  return (
    <View style={{ marginVertical: 15 }}>
      <View
        style={[
          globalStyles.row,
          styles.paddingContent,
          { marginVertical: 15, justifyContent: 'space-between' },
        ]}>
        <TextComponent text={title} size={18} title />
      </View>
      {loading ? (
        <View style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
          {[1, 2, 3, 4, 5].map((_, index) => (
            <View key={index} style={{ marginRight: 16, alignItems: 'center' }}>
              <SkeletonPlaceholder
                width={120}
                height={80}
                borderRadius={12}
                style={{ marginBottom: 8 }}
              />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data}
          keyExtractor={item => item._id}
          renderItem={({ item, index }) => {
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
      )}
    </View>
  );
};

// Utility function to check if event has ongoing showtimes
const hasOngoingShowtimes = (event: EventModel, now: number) => {
  if (!event.showtimes || event.showtimes.length === 0) {
    return false;
  }

  // Check if any showtime is happening today or in the future
  return event.showtimes.some(showtime => {
    const showDate = new Date(showtime.startTime);
    const nowDate = new Date(now);

    // Check if the showtime is today or in the future
    return showDate.toDateString() === nowDate.toDateString() ||
      showtime.startTime > now;
  });
};


const SuggestedEventsScreen = ({
  handleInteraction,
  navigation,
  isLoading: parentLoading = false,
}: SuggestedEventsScreenProps) => {
  const [eventsOngoing, setEventsOngoing] = useState<EventModel[]>([]);
  const [eventsTrending, setEventsTrending] = useState<EventModel[]>([]);
  const [musicEvents, setMusicEvents] = useState<EventModel[]>([]);
  const [workshopEvents, setWorkshopEvents] = useState<EventModel[]>([]);
  const [otherEvents, setOtherEvents] = useState<EventModel[]>([]);
  const [recommentEvents, setRecommentEvents] = useState<EventModel[]>([]);

  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingOngoing, setLoadingOngoing] = useState(true);
  const [loadingMusic, setLoadingMusic] = useState(true);
  const [loadingWorkshop, setLoadingWorkshop] = useState(true);
  const [loadingOthers, setLoadingOthers] = useState(true);
  const [loadingRecommend, setLoadingRecommend] = useState(true);


  const isLoadingData = parentLoading || loadingTrending || loadingOngoing || loadingMusic || loadingWorkshop || loadingOthers || loadingRecommend;


  const fetchTrendingEvents = async () => {
    setLoadingTrending(true);
    try {
      const res = await AxiosInstance().get<EventModel[]>('events/home');
      setEventsTrending(res.data.slice(0, 10));
    } catch (e) {
      console.log('Error fetching trending events:', e);
    } finally {
      setLoadingTrending(false);
    }
  };

  const fetchOngoingEvents = async () => {
    setLoadingOngoing(true);
    try {
      const res = await AxiosInstance().get<EventModel[]>('events/home');
      const now = Date.now();
      const ongoing = res.data.filter(event => hasOngoingShowtimes(event, now));
      setEventsOngoing(ongoing);
    } catch (e) {
      console.log('Error fetching ongoing events:', e);
    } finally {
      setLoadingOngoing(false);
    }
  };

  const fetchMusicEvents = async () => {
    setLoadingMusic(true);
    try {
      const res = await AxiosInstance().get<EventModel[]>('events/home');
      const music = res.data.filter(event =>
        event.tags?.some(tag => tag.toLowerCase().includes('âm nhạc'))
      );
      setMusicEvents(music.slice(0, 4));
    } catch (e) {
      console.log('Error fetching music events:', e);
    } finally {
      setLoadingMusic(false);
    }
  };

  const fetchWorkshopEvents = async () => {
    setLoadingWorkshop(true);
    try {
      const res = await AxiosInstance().get<EventModel[]>('events/home');
      const workshop = res.data.filter(event =>
        event.tags?.some(tag => tag.toLowerCase().includes('workshop'))
      );
      setWorkshopEvents(workshop.slice(0, 4));
    } catch (e) {
      console.log('Error fetching workshop events:', e);
    } finally {
      setLoadingWorkshop(false);
    }
  };

  const fetchOtherEvents = async () => {
    setLoadingOthers(true);
    try {
      const res = await AxiosInstance().get<EventModel[]>('events/home');
      const others = res.data.filter(event =>
        !event.tags?.some(tag =>
          tag.toLowerCase().includes('âm nhạc') || tag.toLowerCase().includes('workshop')
        )
      );
      setOtherEvents(others.slice(0, 4));
    } catch (e) {
      console.log('Error fetching other events:', e);
    } finally {
      setLoadingOthers(false);
    }
  };

  const fetchRecommendEvents = async () => {
    setLoadingRecommend(true);
    try {
      const res = await AxiosInstance().get<any>('events/for-you');
      console.log("recomemnt:"+JSON.stringify(res.events));
      setRecommentEvents(res.events || []);
    } catch (e) {
      console.log('Error fetching recommended events:', e);
    } finally {
      setLoadingRecommend(false);
    }
  };



  useEffect(() => {
    fetchTrendingEvents();
    fetchOngoingEvents();
    fetchMusicEvents();
    fetchWorkshopEvents();
    fetchOtherEvents();
    fetchRecommendEvents();
  }, []);


  const onPressEvent = useCallback(
    (item: EventModel) => {
      handleInteraction(item._id);
      navigation.navigate('Detail', { id: item._id });
    },
    [handleInteraction, navigation],
  );
  console.log("Recomment Event: ", JSON.stringify(recommentEvents));

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      {/* Banner với skeleton */}
      {isLoadingData ? (
        <View style={[styles.paddingContent, { marginVertical: 15 }]}>
          <SkeletonPlaceholder width="100%" height={180} borderRadius={12} style={{}} />
        </View>
      ) : (
        <BassicBannerComponent
          events={[...eventsOngoing].slice(0, 5)}
        />
      )}

      {/* Các section với skeleton */}
      <EventTopSection
        title="Sự kiện xu hướng 🔥"
        data={eventsTrending}
        onPressItem={onPressEvent}
        loading={loadingTrending}
      />

      <EventSection
        title="Sự kiện đang mở bán vé 🎉"
        data={eventsOngoing}
        onPressItem={onPressEvent}
        loading={loadingOngoing}
      />

      {recommentEvents?.length > 2 && (
        <EventSection
          title="Dành cho bạn"
          data={recommentEvents}
          onPressItem={onPressEvent}
          loading={loadingRecommend}
        />
      )}

      <EventGridSection
        title="Sự kiện Âm nhạc"
        data={musicEvents}
        onPressItem={onPressEvent}
        loading={loadingMusic}
        onPressMore={() => navigation.navigate('ListByTag', { tag: 'Âm nhạc' })}
      />

      <EventGridSection
        title="Sự kiện Workshop"
        data={workshopEvents}
        onPressItem={onPressEvent}
        loading={loadingWorkshop}
        onPressMore={() => navigation.navigate('ListByTag', { tag: 'Workshop' })}
      />

      <EventGridSection
        title="Sự kiện khác"
        data={otherEvents}
        onPressItem={onPressEvent}
        loading={loadingOthers}
        onPressMore={() => navigation.navigate('ListByTag', { tag: 'other' })}
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