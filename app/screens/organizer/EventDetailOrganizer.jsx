import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './components/EventDetailStyles';
import { appColors } from '../../constants/appColors';
import RevenueTab from './components/RevenueTab';
import CheckinTab from './components/CheckinTab';
import OrdersTab from './components/OrdersTab';
import AxiosInstance from '../../services/api/AxiosInstance';

const EventDetailOrganizer = ({ route, navigation }) => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [eventsData, setEventsData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const eventId = route?.params?.eventId;
  console.log('📦 eventId route param:', eventId);

  const handleBackPress = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const fetchEventsData = async () => {
    try {
      setLoading(true);
      const api = AxiosInstance();
      const response = await api.get('/users/eventOfOrganization');

      if (response.status === 200 && Array.isArray(response.events)) {
        setEventsData(response.events);
        console.log('📊 Fetched events:', response.events);

        let selected = null;
        if (eventId) {
          selected = response.events.find(e => e._id === eventId);
        }
        if (!selected && response.events.length > 0) {
          selected = response.events[0];
        }
        if (!selected) {
          Alert.alert('Thông báo', 'Không tìm thấy sự kiện phù hợp.');
        }
        setSelectedEvent(selected);
      } else {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu sự kiện');
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server');
      setSelectedEvent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Chưa xác định';
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>{selectedEvent?.name}</Text>
        <Text style={styles.headerSubtitle}>
          {formatDate(selectedEvent?.timeStart)} - {formatDate(selectedEvent?.timeEnd)}
        </Text>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'revenue' && styles.activeTab]}
        onPress={() => setActiveTab('revenue')}
      >
        <Text style={[styles.tabText, activeTab === 'revenue' && styles.activeTabText]}>
          Doanh thu
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'checkin' && styles.activeTab]}
        onPress={() => setActiveTab('checkin')}
      >
        <Text style={[styles.tabText, activeTab === 'checkin' && styles.activeTabText]}>
          Check-in
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
        onPress={() => setActiveTab('orders')}
      >
        <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
          Đơn hàng
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = () => {
    if (!selectedEvent) return null;

    switch (activeTab) {
      case 'revenue':
        return <RevenueTab eventData={selectedEvent} />;
      case 'checkin':
        return <CheckinTab eventData={selectedEvent} />;
      case 'orders':
        return <OrdersTab eventData={selectedEvent} />;
      default:
        return <RevenueTab eventData={selectedEvent} />;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={{ marginTop: 16, color: '#666' }}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 16, color: '#999' }}>Không có dữ liệu sự kiện phù hợp.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabBar()}
      {renderTabContent()}
    </SafeAreaView>
  );
};

export default EventDetailOrganizer;
