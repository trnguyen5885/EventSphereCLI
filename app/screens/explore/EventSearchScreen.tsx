/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet, Text, View, Platform, StatusBar,
  FlatList, ListRenderItemInfo, TouchableOpacity,
  Animated, Dimensions
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { InputComponent, RowComponent } from '../../components';
import EventItem from '../../components/EventItem';
import { globalStyles } from '../../constants/globalStyles';
import { appColors } from '../../constants/appColors';
import { AxiosInstance } from '../../services';
import { EventModel } from '@/app/models';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2;

// Skeleton loading placeholder
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
  style?: any;
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
          width,
          height,
          backgroundColor,
          borderRadius,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {showIcon && (
        <Animated.Image
          source={require('../../../assets/images/icon.png')}
          style={{
            width: 28,
            height: 28,
            opacity: 0.2,
            resizeMode: 'contain',
          }}
        />
      )}
    </Animated.View>
  );
};

const EventCardSkeleton = () => (
  <View style={styles.skeletonCard}>
    {/* Ảnh: có icon */}
    <SkeletonPlaceholder width={cardWidth - 20} height={120} style={{ marginBottom: 8 }} showIcon />

    {/* Text: không icon */}
    <SkeletonPlaceholder width={cardWidth - 40} height={16} style={{ marginBottom: 6 }} showIcon={false} />
    <SkeletonPlaceholder width={cardWidth - 60} height={12} style={{ marginBottom: 6 }} showIcon={false} />
    <SkeletonPlaceholder width={cardWidth - 50} height={12} style={{ marginBottom: 8 }} showIcon={false} />
  </View>
);


const SkeletonList = ({ count = 6 }) => {
  const data = Array(count).fill(null);
  return (
    <FlatList
      data={data}
      keyExtractor={(_, i) => `skeleton-${i}`}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
      renderItem={() => <EventCardSkeleton />}
    />
  );
};

const EventSearch = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<EventModel[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchEvents = async (q: string, pageNumber = 1, append = false) => {
    try {
      if (pageNumber === 1 && !append) setIsSearching(true);
      else setIsFetchingMore(true);

      const limit = 10;
      const res = await AxiosInstance().get<EventModel[]>(
        `events/search?query=${q}&page=${pageNumber}&limit=${limit}`
      );

      setHasMore(res.data.length >= limit);
      if (append) {
        setEvents(prev => [...prev, ...res.data]);
      } else {
        setEvents(res.data);
      }

    } catch (e) {
      console.log('❌ Search error:', e);
      if (!append) setEvents([]);
    } finally {
      setIsSearching(false);
      setIsFetchingMore(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchEvents(query, 1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  const handleLoadMore = () => {
    if (hasMore && !isFetchingMore && !isSearching) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchEvents(query, nextPage, true);
    }
  };

  const renderContent = () => {
    if (isLoading || isSearching) return <SkeletonList />;

    if (events.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="event-busy" size={60} color="#ccc" />
          <Text style={styles.emptyStateText}>Không tìm thấy sự kiện nào</Text>
          <Text style={styles.emptyStateSubText}>
            {query.trim() ? 'Thử từ khóa khác' : 'Hiện tại chưa có sự kiện nào'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={events}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
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
              marginBottom: 20
            }}
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingMore ? <SkeletonList count={2} /> : null}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    );
  };

  const handleNavigation = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.header}>
        <StatusBar animated backgroundColor={appColors.primary} />
        <RowComponent onPress={handleNavigation} styles={{ columnGap: 25, justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tìm kiếm</Text>
        </RowComponent>

        <InputComponent
          value={query}
          onChange={text => setQuery(text)}
          placeholder="Nhập từ khoá..."
          allowClear
          customStyles={{ minHeight: 46 }}
          affix={<MaterialIcons name="search" size={24} color="rgba(0,0,0,0.5)" />}
        />
      </View>

      {renderContent()}
    </View>
  );
};

export default EventSearch;

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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
