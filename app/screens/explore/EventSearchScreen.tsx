/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
  FlatList,
  ListRenderItemInfo,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { InputComponent, RowComponent } from '../../components';
import EventItem from '../../components/EventItem';
import { globalStyles } from '../../constants/globalStyles';
import { appColors } from '../../constants/appColors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AxiosInstance } from '../../services';
import { EventModel } from '@/app/models';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2; // 40 = padding horizontal + gap

// Loading Skeleton Component
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

// Event Card Skeleton
const EventCardSkeleton = () => {
  return (
    <View style={styles.skeletonCard}>
      {/* Image skeleton */}
      <SkeletonPlaceholder
        width={cardWidth - 20}
        height={120}
        borderRadius={8}
        style={{ marginBottom: 8 }}
      />

      {/* Title skeleton */}
      <SkeletonPlaceholder
        width={cardWidth - 40}
        height={16}
        borderRadius={4}
        style={{ marginBottom: 6 }}
      />

      {/* Date skeleton */}
      <SkeletonPlaceholder
        width={cardWidth - 60}
        height={12}
        borderRadius={4}
        style={{ marginBottom: 6 }}
      />

      {/* Location skeleton */}
      <SkeletonPlaceholder
        width={cardWidth - 50}
        height={12}
        borderRadius={4}
        style={{ marginBottom: 8 }}
      />

      {/* Price skeleton */}
      <SkeletonPlaceholder
        width={60}
        height={14}
        borderRadius={4}
      />
    </View>
  );
};

// Skeleton List Component
const SkeletonList = () => {
  const skeletonData = Array(6).fill(null); // Hiển thị 6 skeleton cards

  return (
    <FlatList
      data={skeletonData}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
      keyExtractor={(_, index) => `skeleton-${index}`}
      showsVerticalScrollIndicator={false}
      renderItem={() => <EventCardSkeleton />}
    />
  );
};

const EventSearch = ({ navigation }: any) => {
  const [values, setValues] = useState('');
  const [eventsSearch, setEventsSearch] = useState<EventModel[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu với loading = true
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleNavigation = () => {
    navigation.goBack();
  };

  // Gọi API để lấy tất cả events khi component mount
  useEffect(() => {
    const getInitialEvents = async () => {
      try {
        setIsLoading(true);
        const response = await AxiosInstance().get<EventModel[]>(
          `events/search?query=`,
        );
        setEventsSearch(response.data);
      } catch (e) {
        console.log(e);
        setEventsSearch([]);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    getInitialEvents();
  }, []);

  // Tìm kiếm khi user nhập text
  useEffect(() => {
    // Bỏ qua lần đầu tiên khi component mount
    if (isInitialLoad) return;

    const getEventSearch = async () => {
      try {
        setIsLoading(true);
        const response = await AxiosInstance().get<EventModel[]>(
          `events/search?query=${values}`,
        );
        setEventsSearch(response.data);
      } catch (e) {
        console.log(e);
        setEventsSearch([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search để tránh gọi API quá nhiều
    const delayedSearch = setTimeout(() => {
      getEventSearch();
    }, 300);

    return () => {
      clearTimeout(delayedSearch);
    };
  }, [values, isInitialLoad]);

  const renderContent = () => {
    if (isLoading) {
      return <SkeletonList />;
    }

    if (eventsSearch.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="event-busy" size={60} color="#ccc" />
          <Text style={styles.emptyStateText}>
            Không tìm thấy sự kiện nào
          </Text>
          <Text style={styles.emptyStateSubText}>
            {values.trim() ? 'Thử tìm kiếm với từ khóa khác' : 'Hiện tại chưa có sự kiện nào'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={eventsSearch}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: ListRenderItemInfo<EventModel>) => (
          <EventItem
            onPress={() => {
              navigation.navigate('Detail', {
                id: item._id,
              });
            }}
            type="card"
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
            item={item}
          />
        )}
        contentContainerStyle={{
          paddingBottom: 40, // 👈 Thêm padding để tránh bị che
        }}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
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
          value={values}
          onChange={text => setValues(text)}
          placeholder="Nhập từ khoá..."
          allowClear
          customStyles={{ minHeight: 46 }}
          affix={
            <MaterialIcons name="search" size={24} color="rgba(0,0,0,0.5)" />
          }
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});