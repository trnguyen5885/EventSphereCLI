import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Animated,
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

const SkeletonPlaceholder = ({ width, height, borderRadius = 8, style }) => {
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
          width,
          height,
          backgroundColor,
          borderRadius,
        },
        style,
      ]}
    />
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
                <SkeletonPlaceholder width={200} height={120} borderRadius={12} />
                <View style={{ paddingTop: 8 }}>
                  <SkeletonPlaceholder width={160} height={16} style={{ marginBottom: 8 }} />
                  <SkeletonPlaceholder width={120} height={14} style={{ marginBottom: 6 }} />
                  <SkeletonPlaceholder width={80} height={12} />
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

// 4. Sửa đổi EventTopSection
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

const SuggestedEventsScreen = ({
  handleInteraction,
  navigation,
  isLoading: parentLoading = false,
}: SuggestedEventsScreenProps) => {
  const [eventsOngoing, setEventsOngoing] = useState<EventModel[]>([]);
  const [eventsUpcoming, setEventsUpcoming] = useState<EventModel[]>([]);
  const [eventsTrending, setEventsTrending] = useState<EventModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isLoadingData = parentLoading || loading;

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
    if (!parentLoading) {
      fetchEvents();
    }
    return () => {
      setEventsOngoing([]);
      setEventsUpcoming([]);
      setEventsTrending([]);
    };
  }, []);

  const onPressEvent = useCallback(
    (item: EventModel) => {
      handleInteraction(item._id);
      navigation.navigate('Detail', { id: item._id });
    },
    [handleInteraction, navigation],
  );


  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      {/* Banner với skeleton */}
      {isLoadingData ? (
        <View style={[styles.paddingContent, { marginVertical: 15 }]}>
          <SkeletonPlaceholder width="100%" height={180} borderRadius={12} />
        </View>
      ) : (
        <BassicBannerComponent
          events={[...eventsOngoing, ...eventsUpcoming].slice(0, 5)}
        />
      )}

      {/* Các section với skeleton */}
      <EventTopSection
        title="Sự kiện xu hướng 🔥"
        data={eventsTrending}
        onPressItem={onPressEvent}
        loading={isLoadingData}
      />

      <EventSection
        title="Sự kiện đang diễn ra 🎉"
        data={eventsOngoing}
        onPressItem={onPressEvent}
        loading={isLoadingData}
      />

      <EventSection
        title="Sự kiện sắp diễn ra ⏰"
        data={eventsUpcoming}
        onPressItem={onPressEvent}
        loading={isLoadingData}
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
