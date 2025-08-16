import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Animated,
  RefreshControl,
} from 'react-native';
import OrganizerHeaderComponent from '../../components/OrganizerHeaderComponent';
import AxiosInstance from '../../services/api/AxiosInstance';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { formatDate } from '../../services/utils/date';
import AntDesign from '@react-native-vector-icons/ant-design';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../../constants/appColors';

const { width } = Dimensions.get('window');

// Skeleton Loading Component cho EventCard
const EventCardSkeleton = () => {
  const [shimmerAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, []);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Animated.View style={[styles.skeletonImage, { opacity }]} />
        <View style={styles.eventInfo}>
          <Animated.View style={[styles.skeletonTitle, { opacity }]} />
          <Animated.View style={[styles.skeletonSubtitle, { opacity }]} />
        </View>
      </View>
      
      <Animated.View style={[styles.skeletonShowtimes, { opacity }]} />
      
      <View style={styles.buttonContainer}>
        <Animated.View style={[styles.skeletonButton, { opacity }]} />
        <Animated.View style={[styles.skeletonButton, { opacity }]} />
      </View>
    </View>
  );
};

// Component hiển thị nhiều skeleton cards
const SkeletonLoader = () => {
  return (
    <View style={styles.scrollContent}>
      {[1, 2, 3].map((item) => (
        <EventCardSkeleton key={item} />
      ))}
    </View>
  );
};

const EventCard = ({
  name,
  timeStart,
  timeEnd,
  ticketPrice,
  soldTickets,
  image,
  showtimes,
  navigation,
  eventId,
  approvalStatus
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Kiểm tra sự kiện đã qua hay chưa
  const now = new Date();
  const eventEndDate = new Date(timeEnd);
  const isPastEvent = eventEndDate < now;

  // Sắp xếp showtimes theo thời gian bắt đầu
  const sortedShowtimes = showtimes?.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)) || [];

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);

    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Tăng chiều cao tối đa và thêm padding
  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(sortedShowtimes.length * 85 + 40, 300)], // Giới hạn chiều cao tối đa là 300px
  });

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: image }} style={styles.eventImage} />
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={2}>{name}</Text>
          <Text style={styles.totalSoldTickets}>Tổng đã bán: {soldTickets} vé</Text>
        </View>
      </View>

      {/* Dropdown toggle cho suất diễn */}
      {sortedShowtimes.length > 0 ? (
        <View style={styles.showtimesSection}>
          <TouchableOpacity
            style={styles.showtimesToggle}
            onPress={toggleExpanded}
            activeOpacity={0.7}
          >
            <View style={styles.showtimesToggleContent}>
              <Text style={styles.showtimesTitle}>
                Suất diễn ({sortedShowtimes.length})
              </Text>
              <View style={styles.showtimesSummary}>
                <Text style={styles.showtimesSummaryText}>
                  {isExpanded ? 'Thu gọn' : `${sortedShowtimes.length} suất diễn`}
                </Text>
              </View>
            </View>
            <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </Animated.View>
          </TouchableOpacity>

          <Animated.View style={[styles.showtimesContent, { maxHeight }]}>
            {/* Thêm ScrollView để có thể cuộn khi có nhiều suất diễn */}
            <ScrollView
              style={styles.showtimesScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <View style={styles.showtimesContainer}>
                {sortedShowtimes.map((showtime, index) => {
                  const remainingTickets = showtime.totalTickets - showtime.soldTickets;
                  return (
                    <View key={showtime._id || index} style={styles.showtimeItem}>
                      <View style={styles.showtimeHeader}>
                        <Text style={styles.showtimeTime}>
                          {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                        </Text>
                        <Text style={[
                          styles.remainingTickets,
                          remainingTickets === 0 && styles.soldOut
                        ]}>
                          {remainingTickets === 0 ? 'Hết vé' : `Còn ${remainingTickets}`}
                        </Text>
                      </View>
                      <Text style={styles.showtimeDate}>
                        {formatDate(showtime.startTime)}
                      </Text>
                      <View style={styles.ticketProgress}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${(showtime.soldTickets / showtime.totalTickets) * 100}%`,
                                backgroundColor: remainingTickets === 0 ? '#EF4444' : '#10B981'
                              }
                            ]}
                          />
                        </View>
                        <Text style={styles.ticketCount}>
                          {showtime.soldTickets}/{showtime.totalTickets}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      ) : (
        <View style={styles.noShowtimesContainer}>
          <Ionicons name="calendar-outline" size={16} color="#92400E" />
          <Text style={styles.noShowtimesText}>Chưa có suất diễn</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => navigation.navigate('EventDetailOrganizer', { eventId })}
        >
          <FontAwesome5 name="chart-bar" color={appColors.primary} size={16} />
          <Text style={styles.manageButtonText}>Quản lý</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.scanButton,
            isPastEvent && styles.disabledButton
          ]}
          onPress={() => {
            if (!isPastEvent) {
              navigation.navigate('ScanShowTime', {
                eventId: eventId,
                eventName: name,
              });
            }
          }}
          disabled={isPastEvent}
        >
          <MaterialIcons
            name="qr-code-scanner"
            color={isPastEvent ? "#999" : "#fff"}
            size={16}
          />
          <Text style={[
            styles.scanButtonText,
            isPastEvent && styles.disabledButtonText
          ]}>
            Quét vé
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Sửa FilterTabs component - thêm navigation vào props
const FilterTabs = ({ activeTab, setActiveTab, navigation }) => (
  <View style={styles.filterContainer}>
    <TouchableOpacity
      style={styles.searchButton}
      onPress={() => navigation.navigate('SearchEventOrganizer')}
    >
      <Ionicons name="search" color="#000" size={20} />
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.filterTab, activeTab === 'upcoming' && styles.activeTab]}
      onPress={() => setActiveTab('upcoming')}
    >
      <Text style={[styles.filterText, activeTab === 'upcoming' && styles.activeTabText]}>
        Sắp tới
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.filterTab, activeTab === 'ongoing' && styles.activeTab]}
      onPress={() => setActiveTab('ongoing')}
    >
      <Text style={[styles.filterText, activeTab === 'ongoing' && styles.activeTabText]}>
        Đang diễn ra
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.filterTab, activeTab === 'past' && styles.activeTab]}
      onPress={() => setActiveTab('past')}
    >
      <Text style={[styles.filterText, activeTab === 'past' && styles.activeTabText]}>
        Đã qua
      </Text>
    </TouchableOpacity>
  </View>
);

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const getValidShowtime = (showtimes) => {
  const now = new Date();

  // Tìm xuất chiếu đang diễn ra (startTime <= now <= endTime)
  const currentShowtime = showtimes.find(st => {
    const startTime = new Date(st.startTime);
    const endTime = new Date(st.endTime);
    return startTime <= now && now <= endTime;
  });

  // Nếu có xuất chiếu đang diễn ra, ưu tiên hiển thị
  if (currentShowtime) {
    return currentShowtime;
  }

  // Tìm xuất chiếu gần nhất với thời gian hiện tại
  const sortedShowtimes = showtimes
    .map(st => ({
      ...st,
      startTime: new Date(st.startTime),
      endTime: new Date(st.endTime),
      timeDiff: Math.abs(new Date(st.startTime).getTime() - now.getTime())
    }))
    .sort((a, b) => a.timeDiff - b.timeDiff);

  return sortedShowtimes[0];
};

const EventManagement = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  const validShowtime =
    events?.showtimes ? getValidShowtime(events.showtimes) : null;

  const fetchEvents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const axiosJWT = AxiosInstance();
      const res = await axiosJWT.get('users/eventOfOrganization');
      setEvents(res.events || []);
    } catch (error) {
      console.error('Lỗi khi lấy sự kiện:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Hàm xử lý pull to refresh
  const onRefresh = useCallback(() => {
    fetchEvents(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  // Lọc sự kiện theo approvalStatus và thời gian
  const filteredEvents = events
    .filter(event => event.approvalStatus === 'approved') // Chỉ hiển thị sự kiện đã được duyệt
    .filter(event => {
      const now = new Date();
      const eventStartDate = new Date(event.timeStart);
      const eventEndDate = new Date(event.timeEnd);

      if (activeTab === 'upcoming') {
        return eventStartDate > now;
      } else if (activeTab === 'ongoing') {
        return eventStartDate <= now && eventEndDate >= now;
      } else {
        return eventEndDate < now;
      }
    });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/icon.png')}
              style={{ width: 20, height: 20 }}
            />
          </View>
          <Text style={styles.headerTitle}>Organizer Center</Text>
        </View>
      </View>

      {/* Truyền navigation vào FilterTabs */}
      <FilterTabs activeTab={activeTab} setActiveTab={setActiveTab} navigation={navigation} />

      {loading ? (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <SkeletonLoader />
        </ScrollView>
      ) : filteredEvents.length === 0 ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[appColors.primary]}
              tintColor={appColors.primary}
              title="Đang tải..."
              titleColor={appColors.primary}
            />
          }
        >
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming'
                ? 'Không có sự kiện sắp tới'
                : activeTab === 'ongoing'
                  ? 'Không có sự kiện đang diễn ra'
                  : 'Không có sự kiện đã qua'}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[appColors.primary]}
              tintColor={appColors.primary}
              title="Đang tải..."
              titleColor={appColors.primary}
            />
          }
        >
          {filteredEvents.map((item) => (
            <EventCard
              key={item._id}
              name={item.name}
              timeStart={item.timeStart}
              timeEnd={item.timeEnd}
              ticketPrice={item.ticketPrice}
              soldTickets={item.soldTickets}
              image={item.avatar}
              eventId={item._id}
              showtimes={item.showtimes}
              navigation={navigation}
              approvalStatus={item.approvalStatus} // Truyền thêm approvalStatus
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default EventManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 12,
  },
  logoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 14,
  },
  logoSubtext: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "black",
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  activeTab: {
    backgroundColor: appColors.primary,
    borderColor: "white",
    borderWidth: 1,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
    borderColor: '#444444',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  inactiveTabText: {
    color: appColors.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'black',
    marginBottom: 4,
    lineHeight: 20,
  },
  totalSoldTickets: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  eventDate: {
    fontSize: 13,
    color: appColors.gray,
    marginBottom: 2,
  },
  soldTickets: {
    fontSize: 13,
    color: appColors.gray,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  manageButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: appColors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  manageButtonText: {
    color: appColors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  scanButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    flex: 1,
    backgroundColor: appColors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Thêm styles cho trạng thái vô hiệu hóa
  disabledButton: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#999999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Styles mới cho dropdown
  showtimesSection: {
    marginBottom: 16,
  },

  showtimesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  showtimesToggleContent: {
    flex: 1,
  },

  showtimesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
    marginBottom: 2,
  },

  showtimesSummary: {
    marginTop: 2,
  },

  showtimesSummaryText: {
    fontSize: 12,
    color: '#6B7280',
  },

  showtimesContent: {
    overflow: 'hidden',
  },

  showtimesContainer: {
    paddingTop: 12,
  },

  showtimeItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  showtimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  showtimeTime: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
  },

  showtimeDate: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },

  ticketProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  ticketCount: {
    fontSize: 12,
    color: '#6B7280',
    minWidth: 45,
    textAlign: 'right',
  },

  remainingTickets: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },

  soldOut: {
    color: '#EF4444',
  },

  noShowtimesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },

  noShowtimesText: {
    fontSize: 13,
    color: '#92400E',
    fontStyle: 'italic',
  },
  showtimesScrollView: {
    maxHeight: 250,
  },

  // Skeleton Loading Styles
  skeletonImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '60%',
  },
  skeletonShowtimes: {
    height: 40,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 16,
  },
  skeletonButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginHorizontal: 6,
  },
});