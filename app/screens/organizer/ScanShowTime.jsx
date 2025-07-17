import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AxiosInstance from '../../services/api/AxiosInstance';
import { formatDate } from '../../services/utils/date';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { appColors } from '../../constants/appColors';

const ScanShowTime = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId, eventName } = route.params;

  const [eventDetail, setEventDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventDetail();
  }, [eventId]);

  const fetchEventDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const axiosJWT = AxiosInstance();
      const response = await axiosJWT.get(`events/detail/${eventId}`);
      
      if (response.status && response.data) {
        setEventDetail(response.data);
      } else {
        setError('Không thể lấy thông tin sự kiện');
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sự kiện:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleScanTicket = (showtimeId, startTime, endTime) => {
    const showtimeInfo = {
      showtimeId,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      date: formatDateTime(startTime)
    };
    console.log('Navigating to QRScanner with showtimeInfo:', showtimeInfo);
    

    navigation.navigate('QRScanner', {
      eventId,
      eventName,
      showtimeId,
      showtimeInfo
    });
  };

  const getShowtimeStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return { status: 'upcoming', text: 'Sắp diễn ra', color: appColors.primary };
    } else if (now >= start && now <= end) {
      return { status: 'ongoing', text: 'Đang diễn ra', color: '#28a745' };
    } else {
      return { status: 'finished', text: 'Đã kết thúc', color: '#6c757d' };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn Suất Diễn</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn Suất Diễn</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchEventDetail}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn Suất Diễn</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.eventInfoContainer}>
          <Text style={styles.eventName}>{eventDetail.name}</Text>
          <Text style={styles.eventLocation}>{eventDetail.location}</Text>
        </View>

        <View style={styles.showtimeContainer}>
          <Text style={styles.sectionTitle}>Danh sách suất diễn</Text>
          
          {eventDetail.showtimes && eventDetail.showtimes.length > 0 ? (
            eventDetail.showtimes.map((showtime) => {
              const statusInfo = getShowtimeStatus(showtime.startTime, showtime.endTime);
              
              return (
                <View key={showtime._id} style={styles.showtimeCard}>
                  <View style={styles.showtimeInfo}>
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>
                        {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                      </Text>
                      <Text style={styles.dateText}>
                        {formatDateTime(showtime.startTime)}
                      </Text>
                    </View>
                    
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                        <Text style={styles.statusText}>{statusInfo.text}</Text>
                      </View>
                      <Text style={styles.ticketInfo}>
                        Đã bán: {showtime.soldTickets || 0} vé
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.scanButton,
                      statusInfo.status === 'finished' && styles.disabledButton
                    ]}
                    onPress={() => handleScanTicket(showtime._id, showtime.startTime, showtime.endTime)}
                    disabled={statusInfo.status === 'finished'}
                  >
                    <MaterialIcons 
                      name="qr-code-scanner" 
                      color={statusInfo.status === 'finished' ? '#999' : '#fff'} 
                      size={20} 
                    />
                    <Text style={[
                      styles.scanButtonText,
                      statusInfo.status === 'finished' && styles.disabledButtonText
                    ]}>
                      Quét vé
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không có suất diễn nào</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  eventInfoContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  showtimeContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 16,
  },
  showtimeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  showtimeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  ticketInfo: {
    fontSize: 12,
    color: '#666',
  },
  scanButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default ScanShowTime;