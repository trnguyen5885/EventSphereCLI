import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, ActivityIndicator, Pressable,
  Image, ScrollView, StatusBar, Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createGroup, getGroupsByUser } from './services/connectApi';
import { useSelector } from 'react-redux';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AxiosInstance from '../../services/api/AxiosInstance';
import { appColors } from '../../constants/appColors';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';


const { width, height } = Dimensions.get('window');

const ConnectScreen = ({ navigation }) => {
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = useSelector(state => state.auth.userId);
  const [userLocation, setUserLocation] = useState({
    latitude: 21.0285,
    longitude: 105.8542
  });
  const [myGroups, setMyGroups] = useState([]);
  const isFocused = useIsFocused();
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Cấp quyền truy cập vị trí',
            message: 'Ứng dụng cần quyền truy cập vị trí để tạo nhóm và định vị bạn bè.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS tự xử lý quyền qua Info.plist
  };
  
  useEffect(() => {
    const initLocation = async () => {
      try {
        const granted = await requestLocationPermission();
        if (granted) {
          try {
            await LocationServicesDialogBox.checkLocationServicesIsEnabled({
              message: 'Bật GPS để tiếp tục sử dụng định vị.',
              ok: 'Bật',
              cancel: 'Thoát',
            });
            
            Geolocation.getCurrentPosition(
              pos => {
                const { latitude, longitude } = pos.coords;
                // Validate coordinates
                if (latitude !== 0 && longitude !== 0) {
                  console.log('Vị trí:', latitude, longitude);
                  setUserLocation({ latitude, longitude });
                } else {
                  console.log('Vị trí không hợp lệ, giữ vị trí mặc định');
                }
              },
              error => {
                console.log('Lỗi khi lấy vị trí:', error);
                // Giữ vị trí mặc định nếu không lấy được
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
              },
            );
          } catch (err) {
            console.log('GPS không được bật, giữ vị trí mặc định');
          }
        } else {
          console.log('Không có quyền vị trí, giữ vị trí mặc định');
        }
      } catch (error) {
        console.log('Lỗi khởi tạo vị trí:', error);
      }
    };
  
    initLocation();
  }, []);
  

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await AxiosInstance().get(`/tickets/user/${userId}/events`);
        setEvents(res.data || []);
      } catch (e) {
        setEvents([]);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [userId]);

  useEffect(() => {
    const fetchGroups = async () => {
      const groups = await getGroupsByUser(userId);
      setMyGroups(groups || []);
    };
    if (isFocused) fetchGroups();
  }, [userId, isFocused]);

  const handleCreateGroup = async () => {
    if (!groupName || !selectedEvent || !selectedShowtime) {
      alert('Nhập tên nhóm, chọn sự kiện và showtime!');
      return;
    }
    setLoading(true);
    try {
      console.log('📝 Creating group with data:', {
        eventId: selectedEvent._id,
        groupName,
        memberIds: [],
        ownerId: userId,
        showtimeId: selectedShowtime._id
      });

      const res = await createGroup(selectedEvent._id, groupName, [], userId, selectedShowtime._id);
      console.log('📝 Create group response:', res);
      
      setLoading(false);
      setShowGroupForm(false);
      setGroupName('');
      setSelectedEvent(null);
      setSelectedShowtime(null);

      // Kiểm tra response đúng cách
      if (res && res._id) {
        const groupId = res._id;
        console.log('✅ Group created successfully with ID:', groupId);
        
        // Refresh danh sách nhóm
        const updatedGroups = await getGroupsByUser(userId);
        setMyGroups(updatedGroups || []);
        
        navigation.navigate('GroupScreen', { 
          groupId: groupId, 
          groupName: groupName, 
          userLocation: userLocation,
          showtimeId: selectedShowtime._id
        });
      } else {
        console.error('❌ Invalid response format:', res);
        alert('Tạo nhóm thất bại! Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('❌ Create group error:', error);
      setLoading(false);
      alert('Có lỗi khi tạo nhóm: ' + (error.message || 'Vui lòng thử lại'));
    }
  };

  // Reset selected showtime when event changes
  const handleEventSelection = (event) => {
    setSelectedEvent(event);
    setSelectedShowtime(null); // Reset showtime when event changes
  };

  // Helper function to format showtime information
  const formatShowtimeInfo = (showtime) => {
    if (!showtime) return '';
    const startTime = new Date(showtime.startTime);
    const endTime = new Date(showtime.endTime);
    return `${startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <LinearGradient
        colors={['#6C5CE7', '#A29BFE']}
        style={styles.emptyStateIcon}
      >
        <Icon name="groups" size={48} color="#fff" />
      </LinearGradient>
      <Text style={styles.emptyStateTitle}>Chưa có nhóm nào</Text>
      <Text style={styles.emptyStateSubtitle}>
        Tạo nhóm mới hoặc chờ lời mời từ bạn bè để bắt đầu kết nối tại các sự kiện
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => setShowGroupForm(true)}
      >
        <LinearGradient
          colors={['#FF6B6B', '#FF8787']}
          style={styles.emptyStateButtonGradient}
        >
          <Icon name="add" size={20} color="#fff" />
          <Text style={styles.emptyStateButtonText}>Tạo nhóm đầu tiên</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C5CE7" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={[appColors.primary, appColors.primary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Quản lý nhóm sự kiện</Text>
            <Text style={styles.headerSubtitle}>
              Kết nối & tạo nhóm với bạn bè tại các sự kiện bạn đã tham gia
            </Text>
          </View>
          
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{myGroups.length}</Text>
              <Text style={styles.statLabel}>Nhóm tham gia</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{events.length}</Text>
              <Text style={styles.statLabel}>Sự kiện</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: appColors.primary, borderWidth: 0 }]}
          onPress={() => navigation.navigate('InviteScreen')}
        >
          <Icon name="mail-outline" size={20} color="#fff" />
          <Text style={[styles.actionButtonText, { color: '#fff' }]}>Lời mời nhóm</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#fff', borderColor: appColors.primary, borderWidth: 2 }]}
          onPress={() => setShowGroupForm(true)}
        >
          <Icon name="group-add" size={20} color={appColors.primary} />
          <Text style={[styles.actionButtonText, { color: appColors.primary }]}>Tạo nhóm mới</Text>
        </TouchableOpacity>
      </View>

      {/* Groups List */}
      <View style={styles.groupsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nhóm bạn tham gia</Text>
          <TouchableOpacity style={styles.refreshButton}>
            <Icon name="refresh" size={20} color="#6C5CE7" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={myGroups}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.groupCard,
                pressed && styles.groupCardPressed
              ]}
              onPress={() => navigation.navigate('GroupScreen', { 
                groupId: item._id, 
                groupName: item.groupName,
                userLocation,
                ownerId: item.ownerId,
                showtimeId: item.showtimeId,
                event: item.event,
                showtime: item.showtime
              })}
            >
              <View style={styles.groupCardContent}>
                <View style={styles.groupIconContainer}>
                  <LinearGradient
                    colors={['#6C5CE7', '#A29BFE']}
                    style={styles.groupIcon}
                  >
                    <Icon name="groups" size={24} color="#fff" />
                  </LinearGradient>
                </View>
                
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{item.groupName}</Text>
                  {item.event?.name && (
                    <Text style={styles.groupEvent}>📅 {item.event.name}</Text>
                  )}
                  {item.showtime && (
                    <Text style={styles.groupShowtime}>
                      ⏰ {new Date(item.showtime.startTime).toLocaleTimeString('vi-VN', {
                       hour: '2-digit',
                       minute: '2-digit'
                     })} - {new Date(item.showtime.endTime).toLocaleTimeString('vi-VN', {
                       hour: '2-digit',
                       minute: '2-digit'
                     })} | {new Date(item.showtime.startTime).toLocaleDateString('vi-VN')}
                   </Text>
                 )}
                  <View style={styles.groupMeta}>
                    <Icon name="people" size={14} color="#666" />
                    <Text style={styles.groupMembers}>
                      {item.memberIds?.length || 0} thành viên
                    </Text>
                  </View>
                </View>

                {item.event?.avatar && (
                  <Image
                    source={{ uri: item.event.avatar }}
                    style={styles.eventAvatar}
                    resizeMode="cover"
                  />
                )}
                
                <View style={styles.groupArrow}>
                  <Icon name="arrow-forward-ios" size={16} color="#6C5CE7" />
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.groupsList}
        />
      </View>

      {/* Create Group Modal */}
      <Modal visible={showGroupForm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <LinearGradient
                colors={[appColors.primary, appColors.primary]}
                style={styles.modalHeaderGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.modalTitle}>Tạo nhóm mới</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowGroupForm(false)}
                >
                  <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </LinearGradient>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Group Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tên nhóm</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="group" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập tên nhóm của bạn"
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Event Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Chọn sự kiện</Text>
                <Text style={styles.inputSubLabel}>
                  Chọn sự kiện mà bạn muốn tạo nhóm
                </Text>
                
                {selectedEvent && (
                  <View style={styles.selectedEventInfo}>
                    <Text style={styles.selectedEventText}>
                      ✅ Đã chọn: {selectedEvent.name}
                    </Text>
                  </View>
                )}
                
                {events.length > 0 ? (
                  <FlatList
                    data={events}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.eventCard,
                          selectedEvent?._id === item._id && styles.eventCardSelected
                        ]}
                        onPress={() => handleEventSelection(item)}
                      >
                        <View style={styles.eventCardContent}>
                          <View style={styles.eventInfo}>
                            <Text style={styles.eventName}>{item.name}</Text>
                            {item.timeStart && (
                              <Text style={styles.eventDate}>
                                📅 {new Date(item.timeStart).toLocaleDateString('vi-VN')}
                              </Text>
                            )}
                          </View>
                          
                          {selectedEvent?._id === item._id && (
                            <View style={styles.selectedIndicator}>
                              <Icon name="check-circle" size={24} color="#00B894" />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                    style={styles.eventsList}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  />
                ) : (
                  <View style={styles.noEventsContainer}>
                    <Icon name="event-busy" size={48} color="#DDD" />
                    <Text style={styles.noEventsText}>Không có sự kiện nào</Text>
                    <Text style={styles.noEventsSubtext}>
                      Bạn cần tham gia sự kiện trước khi tạo nhóm
                    </Text>
                  </View>
                )}
              </View>

              {/* Showtime Selection (if event is selected) */}
              {selectedEvent && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Chọn showtime</Text>
                  <Text style={styles.inputSubLabel}>
                    Chọn thời gian bạn muốn tham gia sự kiện
                  </Text>
                  {selectedEvent.showtimes && selectedEvent.showtimes.length > 0 ? (
                    <FlatList
                      data={selectedEvent.showtimes}
                      keyExtractor={(item) => item._id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.showtimeCard,
                            selectedShowtime?._id === item._id && styles.showtimeCardSelected
                          ]}
                          onPress={() => setSelectedShowtime(item)}
                        >
                          <View style={styles.showtimeInfo}>
                            <Text style={styles.showtimeName}>
                              {new Date(item.startTime).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - {new Date(item.endTime).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Text>
                            <Text style={styles.showtimeDate}>
                              📅 {new Date(item.startTime).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Text>
                            {item.soldTickets && (
                              <Text style={styles.showtimeTickets}>
                                🎫 Đã bán: {item.soldTickets} vé
                              </Text>
                            )}
                          </View>
                          {selectedShowtime?._id === item._id && (
                            <View style={styles.selectedIndicator}>
                              <Icon name="check-circle" size={24} color="#00B894" />
                            </View>
                          )}
                        </TouchableOpacity>
                      )}
                      style={styles.showtimesList}
                      showsVerticalScrollIndicator={false}
                    />
                  ) : (
                    <View style={styles.noShowtimesContainer}>
                      <Icon name="event-busy" size={48} color="#DDD" />
                      <Text style={styles.noShowtimesText}>Không có showtime nào</Text>
                      <Text style={styles.noShowtimesSubtext}>
                        Sự kiện này chưa có thời gian tham gia.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowGroupForm(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!groupName || !selectedEvent || !selectedShowtime) && styles.createButtonDisabled
                ]}
                onPress={handleCreateGroup}
                disabled={!groupName || !selectedEvent || !selectedShowtime || loading}
              >
                <LinearGradient
                  colors={(!groupName || !selectedEvent || !selectedShowtime) ? ['#DDD', '#CCC'] : [appColors.primary, appColors.primary]}
                  style={styles.createButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="add" size={20} color="#fff" />
                      <Text style={styles.createButtonText}>Tạo nhóm</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {loading && !showGroupForm && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C5CE7" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTextContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 8,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  groupsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  groupsList: {
    paddingBottom: 20,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupCardPressed: {
    backgroundColor: '#F5F5F5',
    transform: [{ scale: 0.98 }],
  },
  groupCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  groupIconContainer: {
    marginRight: 15,
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  groupEvent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  groupShowtime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupMembers: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  eventAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
  },
  groupArrow: {
    padding: 5,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  emptyStateButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  emptyStateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    overflow: 'hidden',
  },
  modalHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputSubLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  eventsList: {
    maxHeight: 200,
  },
  eventCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  eventCardSelected: {
    backgroundColor: '#E8F5E8',
    borderColor: '#00B894',
  },
  eventCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  selectedIndicator: {
    marginLeft: 10,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  showtimesList: {
    maxHeight: 200,
  },
  showtimeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  showtimeCardSelected: {
    backgroundColor: '#E8F5E8',
    borderColor: '#00B894',
  },
  showtimeInfo: {
    flex: 1,
  },
  showtimeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  showtimeDate: {
    fontSize: 14,
    color: '#666',
  },
  showtimeTickets: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  noShowtimesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noShowtimesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
  },
  noShowtimesSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6C5CE7',
  },
  selectedEventInfo: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#00B894',
  },
  selectedEventText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B894',
    textAlign: 'center',
  },
});

export default ConnectScreen;