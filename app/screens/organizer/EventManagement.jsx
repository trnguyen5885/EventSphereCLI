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

const EventCard = ({ name, timeStart, timeEnd, ticketPrice, soldTickets, image, navigation, eventId }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Image source={{ uri: image }} style={styles.eventImage} />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>{name}</Text>
        <Text style={styles.eventDate}>Bắt đầu: {formatDate(timeStart)}</Text>
        <Text style={styles.eventDate}>Kết thúc: {formatDate(timeEnd)}</Text>
        <Text style={styles.soldTickets}>Đã bán: {soldTickets} vé</Text>
      </View>
    </View>

    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.manageButton}
        onPress={() => navigation.navigate('EventDetailOrganizer', { eventId })}
      >
        <FontAwesome5 name="chart-bar" color={appColors.primary} size={20} />
        <Text style={styles.manageButtonText}>Quản lý</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('QRScanner', { 
          eventId: eventId,
          eventName: name,
        })}
      >
        <MaterialIcons name="qr-code-scanner" color="#fff" size={20} />
        <Text style={styles.scanButtonText}>Quét vé</Text>
      </TouchableOpacity>
    </View>
  </View>
);

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

const EventManagement = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchEvents = async () => {
    try {
      const axiosJWT = AxiosInstance();
      const res = await axiosJWT.get('users/eventOfOrganization');
      setEvents(res.events || []);
    } catch (error) {
      console.error('Lỗi khi lấy sự kiện:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const filteredEvents = events.filter(event => {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D4AA" />
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {activeTab === 'upcoming'
              ? 'Không có sự kiện sắp tới'
              : activeTab === 'ongoing'
                ? 'Không có sự kiện đang diễn ra'
                : 'Không có sự kiện đã qua'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
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
              navigation={navigation}
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: appColors.primary + '40', // thêm độ đậm cho viền
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    position: 'relative',
  },

  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
    lineHeight: 22,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
  },
});