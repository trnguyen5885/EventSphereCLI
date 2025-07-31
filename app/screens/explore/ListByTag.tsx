/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ListRenderItemInfo,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { EventModel } from '@/app/models';
import { RowComponent } from '../../components';
import EventItem from '../../components/EventItem';
import { appColors } from '../../constants/appColors';
import { AxiosInstance } from '../../services';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2;

// Skeleton Component (giữ nguyên từ EventSearch)
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

const EventCardSkeleton = () => (
  <View style={styles.skeletonCard}>
    <SkeletonPlaceholder
      width={cardWidth - 20}
      height={120}
      borderRadius={8}
      style={{ marginBottom: 8 }}
    />
    <SkeletonPlaceholder width={cardWidth - 40} height={16} style={{ marginBottom: 6 }} />
    <SkeletonPlaceholder width={cardWidth - 60} height={12} style={{ marginBottom: 6 }} />
    <SkeletonPlaceholder width={cardWidth - 50} height={12} style={{ marginBottom: 8 }} />
    <SkeletonPlaceholder width={60} height={14} />
  </View>
);

const SkeletonList = () => (
  <FlatList
    data={Array(6).fill(null)}
    numColumns={2}
    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
    keyExtractor={(_, index) => `skeleton-${index}`}
    renderItem={() => <EventCardSkeleton />}
    showsVerticalScrollIndicator={false}
  />
);

const ListByTag = ({ navigation, route }: any) => {
  const { tag } = route.params;
  const [events, setEvents] = useState<EventModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEventsByTag = async () => {
    try {
      setIsLoading(true);
      const response = await AxiosInstance().get<EventModel[]>('events/home');
      const allEvents = response.data || [];

      let filtered: EventModel[] = [];

      if (tag.toLowerCase() === 'other') {
        // Lọc các sự kiện KHÔNG có tag là 'Âm nhạc' hoặc 'Workshop'
        filtered = allEvents.filter(event =>
          !event.tags?.some(t =>
            t.toLowerCase().includes('âm nhạc') ||
            t.toLowerCase().includes('workshop')
          )
        );
      } else {
        // Lọc các sự kiện có tag tương ứng
        filtered = allEvents.filter(event =>
          event.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
        );
      }

      setEvents(filtered);
    } catch (e) {
      console.log('Fetch by tag error:', e);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchEventsByTag();
  }, [tag]);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar animated backgroundColor={appColors.primary} />
      <View style={styles.header}>
        <RowComponent styles={{ columnGap: 25, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {tag.toLowerCase() === 'other' ? 'Sự kiện khác' : `Sự kiện: ${tag}`}
          </Text>
        </RowComponent>
      </View>

      {isLoading ? (
        <SkeletonList />
      ) : events.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="event-busy" size={60} color="#ccc" />
          <Text style={styles.emptyStateText}>Không có sự kiện nào</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
          keyExtractor={(item) => item._id}
          renderItem={({ item }: ListRenderItemInfo<EventModel>) => (
            <EventItem
              item={item}
              type="card"
              onPress={() => navigation.navigate('Detail', { id: item._id })}
              styles={{
                flex: 1,
                padding: 10,
                marginVertical: 10,
                backgroundColor: '#fff',
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
              }}
            />
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ListByTag;

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    padding: 12,
    rowGap: 20,
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === 'ios' ? 66 : 22,
  },
  headerTitle: {
    color: appColors.white2,
    fontSize: 22,
    fontWeight: '500',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    width: cardWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
});
