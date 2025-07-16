import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Dimensions, TextInput, ActivityIndicator, Image, ScrollView,
  Animated, StatusBar, Button, Alert, Modal
} from 'react-native';
import GroupMap from './components/GroupMap';
import {
  getGroupMembers,
  updateLocation,
  inviteToGroup,
  searchUserByEmail,
  getGroupLocations,
  leaveGroupApi,
  deleteGroupApi,
  leaveGroup,
  deleteGroup
} from './services/connectApi';
import Geolocation from '@react-native-community/geolocation';
import { useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../../constants/appColors';
import LinearGradient from 'react-native-linear-gradient';
import ListInviteComponent from '../explore/components/ListInviteComponent';
import CustomLogoutDialog from '../../components/CustomLogoutDialog';

const { width, height } = Dimensions.get('window');

const GroupScreen = ({ route, navigation }) => {
  const { groupId, userLocation, groupName, ownerId } = route?.params || {};
  const userId = useSelector(state => state.auth.userId);
  const userEmail = useSelector(state => state.auth.userData?.email);

  const isOwner = String(userId) === String(ownerId._id);

  const [members, setMembers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [myLocation, setMyLocation] = useState(userLocation || null);
  const [targetMember, setTargetMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [distanceText, setDistanceText] = useState('');
  const [animatedValue] = useState(new Animated.Value(0));
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirmLeaveSheet, setShowConfirmLeaveSheet] = useState(false);
  const [showConfirmDeleteSheet, setShowConfirmDeleteSheet] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmType, setConfirmType] = useState(null); // 'leave' | 'delete'

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersData, locationsData] = await Promise.all([
        getGroupMembers(groupId),
        getGroupLocations(groupId),
      ]);
      setMembers(membersData);
      setLocations(locationsData);
    } catch (e) {
      alert('Không thể tải dữ liệu nhóm');
    } finally {
      setLoading(false);
    }
  }, [groupId]);
  
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    let watchId;
    if (isSharing) {
      watchId = Geolocation.watchPosition(
        async ({ coords }) => {
          setMyLocation(coords);
          await updateLocation(groupId, userId, coords.latitude, coords.longitude);
        },
        (err) => alert('Không lấy được vị trí: ' + err.message),
        { enableHighAccuracy: true, distanceFilter: 10 }
      );
    } else {
      setMyLocation(userLocation);
    }
    return () => watchId && Geolocation.clearWatch(watchId);
  }, [isSharing, groupId, userId, userLocation]);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const membersWithLocation = members.map(member => {
    const location = locations.find(loc => String(loc.userId) === String(member._id));
    let lat, lon;
    if (location) {
      if (typeof location.latitude === 'number') {
        lat = location.latitude;
        lon = location.longitude;
      } else if (location.location?.coordinates?.length === 2) {
        lon = location.location.coordinates[0];
        lat = location.location.coordinates[1];
      }
    }
    return { ...member, location, latitude: lat, longitude: lon };
  });

  const hasLocation = m => typeof m?.latitude === 'number' && typeof m?.longitude === 'number';

  const handleSearch = async () => {
    if (!searchEmail) return;
    setSearchLoading(true);
    const user = await searchUserByEmail(searchEmail);
    const result = Array.isArray(user) ? user[0] : user?.data?.[0];
    setSearchResult(result);
    setSearchLoading(false);
  };

  const handleInvite = async () => {
    if (!groupId || !searchResult) return;
    await inviteToGroup(groupId, searchResult.email);
    setInvitedMembers([...invitedMembers, { email: searchResult.email }]);
    setSearchEmail('');
    setSearchResult(null);
  };

  const handleLeaveGroup = async () => {
  try {
    await leaveGroup(groupId, userId);
    Alert.alert('Thành công', 'Bạn đã rời nhóm.');
    navigation.goBack();
  } catch (e) {
    Alert.alert('Lỗi', 'Không thể rời nhóm.');
  }
};

const handleDeleteGroup = async () => {
  try {
    await deleteGroup(groupId);
    Alert.alert('Đã xóa nhóm');
    navigation.goBack();
  } catch (e) {
    Alert.alert('Lỗi', 'Không thể xóa nhóm.');
  }
};


  const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (dist) => {
    return dist < 1
      ? `Khoảng cách: ${(dist * 1000).toFixed(0)} m`
      : `Khoảng cách: ${dist.toFixed(2)} km`;
  };

  const handleTargetMember = (member) => {
    setTargetMember(null);
    setTimeout(() => {
      setTargetMember(member);
      if (myLocation && hasLocation(member)) {
        const dist = getDistanceInKm(myLocation.latitude, myLocation.longitude, member.latitude, member.longitude);
        setDistanceText(formatDistance(dist));
      } else {
        setDistanceText('');
      }
    }, 50);
  };

  const onlineMembers = membersWithLocation.filter(hasLocation);
  const offlineMembers = membersWithLocation.filter(m => !hasLocation(m));

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
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <MaterialIcons name="event" size={24} color="#fff" />
            <Text style={styles.headerTitle}>{groupName || 'Nhóm sự kiện'}</Text>
          </View>
          {isOwner ? (
            <TouchableOpacity
              onPress={() => {
                setConfirmType('delete');
                setConfirmModalVisible(true);
              }}
              style={styles.optionsButton}
            >
              <MaterialIcons name="delete" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setConfirmType('leave');
                setConfirmModalVisible(true);
              }}
              style={styles.optionsButton}
            >
              <MaterialIcons name="logout" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="people" size={20} color="#6C5CE7" />
            <Text style={styles.statNumber}>{members.length}</Text>
            <Text style={styles.statLabel}>Thành viên</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="location-on" size={20} color="#00B894" />
            <Text style={styles.statNumber}>{onlineMembers.length}</Text>
            <Text style={styles.statLabel}>Đang online</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Map Container */}
        <View style={styles.mapContainer}>
          <GroupMap members={onlineMembers} myLocation={myLocation} targetMember={targetMember} />
          {distanceText !== '' && (
            <View style={styles.distanceContainer}>
              <MaterialIcons name="straighten" size={16} color="#6C5CE7" />
              <Text style={styles.distanceText}>{distanceText}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: appColors.primary, borderWidth: 0 }]}
            onPress={() => setIsSharing(p => !p)}
          >
            <MaterialIcons name={isSharing ? "location-on" : "location-off"} size={20} color="#fff" />
            <Text style={[styles.buttonText, { color: '#fff' }]}>{isSharing ? 'Đang chia sẻ' : 'Chia sẻ vị trí'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#fff', borderColor: appColors.primary, borderWidth: 2 }]}
            onPress={() => setInviteModal(true)}
          >
            <MaterialIcons name="person-add" size={20} color={appColors.primary} />
            <Text style={[styles.buttonText, { color: appColors.primary }]}>Mời thành viên</Text>
          </TouchableOpacity>
        </View>

        {/* Members Section */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Thành viên ({members.length})</Text>
          
          {/* Online Members */}
          {onlineMembers.length > 0 && (
            <View style={styles.memberGroup}>
              <View style={styles.memberGroupHeader}>
                <MaterialIcons name="circle" size={12} color="#00B894" />
                <Text style={styles.memberGroupTitle}>Đang online ({onlineMembers.length})</Text>
              </View>
              <FlatList
                data={onlineMembers.filter(m => m._id !== userId)}
                keyExtractor={m => m._id}
                renderItem={({ item }) => (
                  <Animated.View
                    style={[
                      styles.memberItem,
                      {
                        transform: [{
                          translateY: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                          }),
                        }],
                        opacity: animatedValue,
                      },
                    ]}
                  >
                    <TouchableOpacity 
                      style={styles.memberContent} 
                      onPress={() => setSelectedMember(item)}
                    >
                      <View style={styles.memberLeft}>
                        <View style={styles.avatarContainer}>
                          {item.picUrl ? (
                            <Image source={{ uri: item.picUrl }} style={styles.avatarImg} />
                          ) : (
                            <View style={styles.avatarPlaceholder}>
                              <MaterialIcons name="person" size={24} color="#6C5CE7" />
                            </View>
                          )}
                          <View style={styles.onlineIndicator} />
                        </View>
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>{item.name}</Text>
                          <Text style={styles.memberEmail}>{item.email}</Text>
                          <Text style={styles.memberStatus}>🌍 Đang chia sẻ vị trí</Text>
                          {myLocation && hasLocation(item) && (
                            <Text style={{color: '#6C5CE7', fontSize: 12, fontWeight: 'bold'}}>
                              {formatDistance(getDistanceInKm(myLocation.latitude, myLocation.longitude, item.latitude, item.longitude))}
                            </Text>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={styles.navButton} 
                        onPress={() => handleTargetMember(item)}
                      >
                        <MaterialIcons name="directions" size={20} color="#fff" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Animated.View>
                )}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Offline Members */}
          {offlineMembers.length > 0 && (
            <View style={styles.memberGroup}>
              <View style={styles.memberGroupHeader}>
                <MaterialIcons name="circle" size={12} color="#DDD" />
                <Text style={styles.memberGroupTitle}>Offline ({offlineMembers.length})</Text>
              </View>
              <FlatList
                data={offlineMembers.filter(m => m._id !== userId)}
                keyExtractor={m => m._id}
                renderItem={({ item }) => (
                  <View style={[styles.memberItem, styles.memberItemOffline]}>
                    <TouchableOpacity 
                      style={styles.memberContent} 
                      onPress={() => setSelectedMember(item)}
                    >
                      <View style={styles.memberLeft}>
                        <View style={styles.avatarContainer}>
                          {item.picUrl ? (
                            <Image source={{ uri: item.picUrl }} style={[styles.avatarImg, styles.avatarOffline]} />
                          ) : (
                            <View style={[styles.avatarPlaceholder, styles.avatarOffline]}>
                              <MaterialIcons name="person" size={24} color="#999" />
                            </View>
                          )}
                        </View>
                        <View style={styles.memberInfo}>
                          <Text style={[styles.memberName, styles.memberNameOffline]}>{item.name}</Text>
                          <Text style={styles.memberEmail}>{item.email}</Text>
                          <Text style={styles.memberStatusOffline}>📍 Chưa chia sẻ vị trí</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Enhanced Invite Modal */}
      <Modal
        visible={inviteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mời thành viên mới</Text>
              <TouchableOpacity onPress={() => setInviteModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>
              Nhập email để mời thành viên tham gia sự kiện
            </Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                value={searchEmail}
                onChangeText={setSearchEmail}
                placeholder="user@example.com"
                style={styles.modalInput}
                onSubmitEditing={handleSearch}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                <MaterialIcons name="search" size={20} color="#6C5CE7" />
              </TouchableOpacity>
            </View>
            {searchLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#6C5CE7" size="small" />
                <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
              </View>
            )}
            {searchResult && (
              <View style={styles.searchResultContainer}>
                <View style={styles.searchResultContent}>
                  <MaterialIcons name="person" size={24} color="#6C5CE7" />
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{searchResult.username || searchResult.email}</Text>
                    <Text style={styles.searchResultEmail}>{searchResult.email}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
                  <LinearGradient
                    colors={['#00B894', '#00A085']}
                    style={styles.inviteButtonGradient}
                  >
                    <MaterialIcons name="send" size={16} color="#fff" />
                    <Text style={styles.inviteButtonText}>Gửi lời mời</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Enhanced Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.dragIndicator} />
            {isOwner ? (
              <TouchableOpacity style={styles.optionItem} onPress={() => {
                setShowOptions(false);
                Alert.alert(
                  'Xác nhận xóa nhóm',
                  'Nhóm sẽ bị xóa vĩnh viễn và không thể khôi phục.',
                  [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xác nhận', style: 'destructive', onPress: handleDeleteGroup },
                  ]
                );
              }}>
                <MaterialIcons name="delete" size={24} color="#E53935" />
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Xóa nhóm</Text>
                  <Text style={styles.optionSubtitle}>Nhóm sẽ bị xóa vĩnh viễn</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.optionItem} onPress={() => {
                setShowOptions(false);
                Alert.alert(
                  'Xác nhận rời nhóm',
                  'Bạn sẽ không còn là thành viên nhóm này.',
                  [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xác nhận', style: 'destructive', onPress: handleLeaveGroup },
                  ]
                );
              }}>
                <MaterialIcons name="logout" size={24} color="#E53935" />
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Rời nhóm</Text>
                  <Text style={styles.optionSubtitle}>Bạn sẽ không còn là thành viên nhóm</Text>
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.optionItem} onPress={() => setShowOptions(false)}>
              <MaterialIcons name="close" size={24} color="#666" />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Đóng</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal xác nhận rời nhóm hoặc xóa nhóm */}
      <CustomLogoutDialog
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={async () => {
          setConfirmModalVisible(false);
          if (confirmType === 'delete') {
            await handleDeleteGroup();
          } else {
            await handleLeaveGroup();
          }
        }}
        title={confirmType === 'delete' ? 'Xác nhận xóa nhóm' : 'Xác nhận rời nhóm'}
        message={confirmType === 'delete'
          ? 'Nhóm sẽ bị xóa vĩnh viễn và không thể khôi phục.'
          : 'Bạn sẽ không còn là thành viên nhóm này.'}
        confirmText={confirmType === 'delete' ? 'Xác nhận' : 'Xác nhận'}
        cancelText="Hủy"
      />

      {/* Xóa các modal xác nhận rời nhóm và xóa nhóm */}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: '100%',
    // Không marginTop/marginBottom
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555',
    alignSelf: 'center',
    marginBottom: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionTextContainer: {
    marginLeft: 12,
  },
  optionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  optionSubtitle: {
    color: '#aaa',
    fontSize: 13,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButton: {
    marginRight: 4,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mapContainer: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  distanceContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  distanceText: {
    marginLeft: 5,
    color: '#6C5CE7',
    fontWeight: '600',
    fontSize: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  membersSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  memberGroup: {
    marginBottom: 20,
  },
  memberGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  memberItem: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  memberItemOffline: {
    backgroundColor: '#F5F5F5',
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8E6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOffline: {
    opacity: 0.6,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#00B894',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  memberNameOffline: {
    color: '#999',
  },
  memberEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  memberStatus: {
    fontSize: 12,
    color: '#00B894',
    fontWeight: '500',
  },
  memberStatusOffline: {
    fontSize: 12,
    color: '#999',
  },
  navButton: {
    backgroundColor: '#6C5CE7',
    padding: 10,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    maxWidth: width * 0.9,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  modalInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    padding: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
  },
  searchResultContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  searchResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchResultInfo: {
    marginLeft: 15,
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  searchResultEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  inviteButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  inviteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  inviteButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
  leaveModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 0,
    margin: 0,
  },
});

export default GroupScreen;