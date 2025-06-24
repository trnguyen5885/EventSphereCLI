import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import AxiosInstance from '../../services/api/AxiosInstance';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { formatDate } from '../../services/utils/date';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { appColors } from '../../../app/constants/appColors';

const SearchResultCard = ({ name, timeStart, timeEnd, soldTickets, image, navigation, eventId }) => (
  <TouchableOpacity 
    style={styles.resultCard}
    onPress={() => navigation.navigate('EventDetailOrganizer', { eventId })}
  >
    <Image source={{ uri: image }} style={styles.resultImage} />
    <View style={styles.resultInfo}>
      <Text style={styles.resultTitle} numberOfLines={2}>{name}</Text>
      <Text style={styles.resultDate}>Bắt đầu: {formatDate(timeStart)}</Text>
      <Text style={styles.resultDate}>Kết thúc: {formatDate(timeEnd)}</Text>
      <Text style={styles.resultSold}>Đã bán: {soldTickets} vé</Text>
    </View>
    <View style={styles.resultActions}>
      <TouchableOpacity
        style={styles.manageBtn}
        onPress={() => navigation.navigate('EventDetailOrganizer', { eventId })}
      >
        <Text style={styles.manageBtnText}>Quản lý</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.scanBtn}
        onPress={() => navigation.navigate('QRScanner', { eventId })}
      >
        <Text style={styles.scanBtnText}>Quét vé</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const SearchEventOrganizer = ({ navigation }) => {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);
  


  // Fetch all events when component mounts
  const fetchAllEvents = async () => {
    try {
      const axiosJWT = AxiosInstance();
      const res = await axiosJWT.get('users/eventOfOrganization');
      const events = res.events || [];
      setAllEvents(events);
      setFilteredEvents(events); // Initially show all events
    } catch (error) {
      console.error('Lỗi khi lấy sự kiện:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllEvents();
    }, [])
  );

  // Search function with debounce
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for 0.5 seconds
    const newTimeout = setTimeout(() => {
      if (query.trim() === '') {
        setFilteredEvents(allEvents);
      } else {
        const filtered = allEvents.filter(event =>
          event.name.toLowerCase().includes(query.toLowerCase()) ||
          event.description?.toLowerCase().includes(query.toLowerCase()) ||
          event.location?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredEvents(filtered);
      }
    }, 500);

    setSearchTimeout(newTimeout);
  }, [allEvents, searchTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredEvents(allEvents);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm kiếm sự kiện</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" color="#000" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên sự kiện, mô tả, địa điểm..."
            placeholderTextColor="#888888"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D4AA" />
            <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {searchQuery ? `Tìm thấy ${filteredEvents.length} kết quả` : `Tất cả sự kiện (${allEvents.length})`}
              </Text>
            </View>

            {filteredEvents.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>
                  {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có sự kiện nào'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery 
                    ? `Không có sự kiện nào phù hợp với "${searchQuery}"`
                    : 'Bạn chưa tạo sự kiện nào'
                  }
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredEvents}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <SearchResultCard
                    name={item.name}
                    timeStart={item.timeStart}
                    timeEnd={item.timeEnd}
                    soldTickets={item.soldTickets}
                    image={item.avatar}
                    eventId={item._id}
                    navigation={navigation}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchEventOrganizer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    backgroundColor: appColors.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    gap: 8,
  },
  searchBarIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#888',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#888888',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666666',
    fontSize: 16,
    marginTop: 12,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  resultCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
    marginRight: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 22,
  },
  resultDate: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  resultSold: {
    fontSize: 12,
    color: '#00D4AA',
    fontWeight: '500',
    marginTop: 2,
  },
  resultActions: {
    alignItems: 'flex-end',
  },
  manageBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: appColors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 6,
  },
  manageBtnText: {
    color: appColors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  scanBtn: {
    backgroundColor: appColors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
