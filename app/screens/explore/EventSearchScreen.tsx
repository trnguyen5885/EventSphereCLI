/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet, Text, View, Platform, StatusBar,
  FlatList, ListRenderItemInfo, TouchableOpacity,
  Animated, Dimensions
} from 'react-native';
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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

// Tối ưu Skeleton với animation nhanh hơn và hiệu quả hơn
const SkeletonPlaceholder = React.memo(({
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
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 600, // Giảm từ 800ms xuống 600ms
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 600, // Giảm từ 800ms xuống 600ms
          useNativeDriver: false,
        }),
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

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
});

// Memoize EventCardSkeleton để tránh re-render không cần thiết
const EventCardSkeleton = React.memo(() => (
  <View style={styles.skeletonCard}>
    <SkeletonPlaceholder 
      width={cardWidth - 20} 
      height={120} 
      style={{ marginBottom: 8 }} 
      showIcon 
    />
    <SkeletonPlaceholder 
      width={cardWidth - 40} 
      height={16} 
      style={{ marginBottom: 6 }} 
      showIcon={false} 
    />
    <SkeletonPlaceholder 
      width={cardWidth - 60} 
      height={12} 
      style={{ marginBottom: 6 }} 
      showIcon={false} 
    />
    <SkeletonPlaceholder 
      width={cardWidth - 50} 
      height={12} 
      style={{ marginBottom: 8 }} 
      showIcon={false} 
    />
  </View>
));

// Tối ưu SkeletonList với useMemo
const SkeletonList = React.memo(({ count = 6 }) => {
  const skeletonData = useMemo(() => Array(count).fill(null), [count]);
  
  const renderSkeletonItem = useCallback(() => <EventCardSkeleton />, []);
  const keyExtractor = useCallback((_, index) => `skeleton-${index}`, []);
  
  return (
    <FlatList
      data={skeletonData}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      renderItem={renderSkeletonItem}
      removeClippedSubviews={true}
      maxToRenderPerBatch={4} // Giảm từ 6 xuống 4
      windowSize={5} // Giảm từ 10 xuống 5
      initialNumToRender={6} // Render ngay 6 items đầu tiên
    />
  );
});

const EventSearch = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<EventModel[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Tối ưu state management - sử dụng một state object thay vì nhiều state riêng biệt
  const [loadingState, setLoadingState] = useState({
    isInitialLoading: true,
    isSearching: false,
    isFetchingMore: false,
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Tối ưu fetchEvents với useCallback và cancel previous requests
  const fetchEvents = useCallback(async (q: string, pageNumber = 1, append = false) => {
    try {
      // Cancel previous request nếu có
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Tạo AbortController mới
      abortControllerRef.current = new AbortController();
      
      // Update loading state ngay lập tức
      setLoadingState(prev => ({
        ...prev,
        isSearching: pageNumber === 1 && !append,
        isFetchingMore: pageNumber > 1 || append,
        isInitialLoading: pageNumber === 1 && !append && events.length === 0,
      }));

      const limit = 10;
      const res = await AxiosInstance().get<EventModel[]>(
        `events/search?query=${q}&page=${pageNumber}&limit=${limit}`,
        { signal: abortControllerRef.current.signal }
      );

      const newData = res.data;
      
      // Batch state updates để tránh multiple re-renders
      setEvents(prev => append ? [...prev, ...newData] : newData);
      setHasMore(newData.length >= limit);
      setLoadingState({
        isInitialLoading: false,
        isSearching: false,
        isFetchingMore: false,
      });

    } catch (e: any) {
      // Bỏ qua lỗi nếu request bị cancel
      if (e.name === 'AbortError') return;
      
      console.log('❌ Search error:', e);
      
      if (!append) setEvents([]);
      setLoadingState({
        isInitialLoading: false,
        isSearching: false,
        isFetchingMore: false,
      });
    }
  }, [events.length]);

  // Tối ưu debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchEvents(query, 1);
    }, 150); // Giảm từ 200ms xuống 150ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, fetchEvents]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingState.isFetchingMore && !loadingState.isSearching) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchEvents(query, nextPage, true);
    }
  }, [hasMore, loadingState.isFetchingMore, loadingState.isSearching, page, query, fetchEvents]);

  // Memoize các functions để tránh re-render
  const keyExtractor = useCallback((item: EventModel) => item._id, []);
  
  const renderEventItem = useCallback(({ item }: ListRenderItemInfo<EventModel>) => (
    <EventItem
      item={item}
      type="card"
      onPress={() => navigation.navigate('Detail', { id: item._id })}
      styles={styles.eventCard}
    />
  ), [navigation]);

  // Tối ưu điều kiện hiển thị skeleton
  const shouldShowSkeleton = useMemo(() => {
    return (loadingState.isInitialLoading && events.length === 0) || 
           (loadingState.isSearching && events.length === 0);
  }, [loadingState.isInitialLoading, loadingState.isSearching, events.length]);

  // Memoize empty state
  const EmptyState = useMemo(() => (
    <View style={styles.emptyState}>
      <MaterialIcons name="event-busy" size={60} color="#ccc" />
      <Text style={styles.emptyStateText}>Không tìm thấy sự kiện nào</Text>
      <Text style={styles.emptyStateSubText}>
        {query.trim() ? 'Thử từ khóa khác' : 'Hiện tại chưa có sự kiện nào'}
      </Text>
    </View>
  ), [query]);

  const renderContent = useMemo(() => {
    if (shouldShowSkeleton) {
      return <SkeletonList />;
    }

    if (events.length === 0) {
      return EmptyState;
    }

    return (
      <FlatList
        data={events}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderEventItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3} // Giảm từ 0.5 xuống 0.3 cho responsive hơn
        ListFooterComponent={loadingState.isFetchingMore ? <SkeletonList count={2} /> : null}
        contentContainerStyle={styles.listContainer}
        removeClippedSubviews={true}
        maxToRenderPerBatch={8} // Tăng từ 10 lên 8 để balance performance
        updateCellsBatchingPeriod={30} // Giảm từ 50ms xuống 30ms
        windowSize={8} // Giảm từ 10 xuống 8
        initialNumToRender={10} // Render ngay 10 items đầu tiên
        getItemLayout={(data, index) => ({
          length: 200,
          offset: 200 * index,
          index,
        })}
      />
    );
  }, [shouldShowSkeleton, events, EmptyState, keyExtractor, renderEventItem, handleLoadMore, loadingState.isFetchingMore]);

  const handleNavigation = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StatusBar animated backgroundColor={appColors.primary} />
        <RowComponent 
          onPress={handleNavigation} 
          styles={styles.headerRow}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tìm kiếm</Text>
        </RowComponent>

        <InputComponent
          value={query}
          onChange={setQuery}
          placeholder="Nhập từ khoá..."
          allowClear
          customStyles={styles.searchInput}
          affix={<MaterialIcons name="search" size={24} color="rgba(0,0,0,0.5)" />}
        />
      </View>

      {renderContent}
    </View>
  );
};

export default EventSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'flex-start',
    padding: 12,
    rowGap: 20,
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === 'ios' ? 66 : 22,
  },
  headerRow: {
    columnGap: 25,
    justifyContent: "center",
    alignItems: "center",
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    minHeight: 46,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  eventCard: {
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
    marginBottom: 20,
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
  listContainer: {
    paddingBottom: 40,
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