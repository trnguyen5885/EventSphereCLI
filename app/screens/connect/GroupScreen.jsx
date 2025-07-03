import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Dimensions, Modal, TextInput, Switch, Pressable, Linking, ActivityIndicator,
  Image
} from 'react-native';
import GroupMap from './components/GroupMap';
import { getGroupMembers, updateLocation, inviteToGroup, searchUserByEmail } from './services/connectApi';
import Geolocation from '@react-native-community/geolocation';
import { useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../../constants/appColors';

const { width } = Dimensions.get('window');

const GroupScreen = ({ route }) => {
  const { groupId, userLocation } = route?.params || { groupId: 'group123', userLocation: null };
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [myLocation, setMyLocation] = useState(userLocation || null);
  const [selectedMember, setSelectedMember] = useState(null);
  const userId = useSelector(state => state.auth.userId);
  const userEmail = useSelector(state => state.auth.userData?.email);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState([]);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGroupMembers(groupId);
      console.log('Group members:', data);
      setMembers(data);
    } catch (error) {
      alert('Không thể tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMembers();
    const interval = setInterval(fetchMembers, 30000); // refresh mỗi 30s
    return () => clearInterval(interval);
  }, [fetchMembers]);

  useEffect(() => {
    let watchId = null;
    if (isSharing) {
      watchId = Geolocation.watchPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setMyLocation(coords);
          try {
            await updateLocation(groupId, userId, coords.latitude, coords.longitude);
          } catch (e) {
            console.error('Update location failed:', e);
          }
        },
        (error) => {
          alert('Không lấy được vị trí: ' + error.message);
          setIsSharing(false);
        },
        { enableHighAccuracy: true, distanceFilter: 10 }
      );
    } else {
      setMyLocation(userLocation || null);
    }

    return () => {
      if (watchId !== null) Geolocation.clearWatch(watchId);
    };
  }, [isSharing, groupId, userId, userLocation]);

  const handleSearch = async () => {
    if (!searchEmail || invitedMembers.some(m => m.email === searchEmail)) return;
    setSearchLoading(true);
    const user = await searchUserByEmail(searchEmail);
    let foundUser = null;
    if (Array.isArray(user) && user.length > 0) {
      foundUser = user[0];
    } else if (user && user.data && Array.isArray(user.data) && user.data.length > 0) {
      foundUser = user.data[0];
    }
    setSearchResult(foundUser);
    setSearchLoading(false);
  };

  const handleInviteModal = async () => {
    if (!groupId || !searchResult) return;
    setSearchLoading(true);
    await inviteToGroup(groupId, searchResult.email);
    setInvitedMembers([...invitedMembers, { email: searchResult.email, user: searchResult, invited: true }]);
    setSearchResult(null);
    setSearchEmail('');
    setSearchLoading(false);
  };

  const handleRemoveInvited = (email) => {
    setInvitedMembers(invitedMembers.filter(m => m.email !== email));
  };

  const handleNavigateToMember = (member) => setSelectedMember(member);
  const closeMemberModal = () => setSelectedMember(null);

  const handleOpenMaps = () => {
    if (!selectedMember?.location) return;
    const { latitude, longitude } = selectedMember.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
    setSelectedMember(null);
  };

  const handleShareLocation = () => setIsSharing(prev => !prev);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nhóm sự kiện</Text>
        <TouchableOpacity onPress={fetchMembers}>
          <MaterialIcons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.memberListCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.subtitle}>Thành viên nhóm</Text>
          <TouchableOpacity onPress={() => setInviteModal(true)} style={styles.fabInvite}>
            <MaterialIcons name="person-add-alt" size={20} color="#fff" />
            <Text style={styles.inviteBtnText}>Mời</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 12 }} />
        ) : members?.length === 0 ? (
          <Text style={{ color: '#999', textAlign: 'center', marginVertical: 12 }}>Chưa có thành viên trong nhóm</Text>
        ) : (
          <FlatList
            data={members}
            keyExtractor={item => item.id || item._id}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleNavigateToMember(item)}>
                <View style={styles.memberItem}>
                  <View style={styles.avatar}>
                    <Image source={{ uri: item.picUrl }} style={styles.avatarImage} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{item.name}</Text>
                    <Text style={styles.memberEmail}>{item.email}</Text>
                  </View>
                  <View style={styles.statusDot(item.location ? 'green' : 'gray')} />
                </View>
              </Pressable>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Invite Modal */}
      <Modal visible={inviteModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContentLarge}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Mời thành viên vào group</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Nhập email thành viên"
                value={searchEmail}
                onChangeText={setSearchEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onSubmitEditing={handleSearch}
                onBlur={handleSearch}
              />
              <TouchableOpacity onPress={handleSearch} style={{ marginLeft: 8 }}>
                <MaterialIcons name="search" size={22} color="#007AFF" />
              </TouchableOpacity>
            </View>
            {searchLoading && <ActivityIndicator size="small" color="#007AFF" style={{ marginBottom: 8 }} />}
            {searchResult && (
              <View style={styles.searchResultBox}>
                {searchResult.picUrl && (
                  <Image source={{ uri: searchResult.picUrl }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', color: '#222' }}>{searchResult.username || searchResult.email}</Text>
                  <Text style={{ color: '#666', fontSize: 13 }}>{searchResult.email}</Text>
                </View>
                {searchResult.email !== userEmail && (
                  <TouchableOpacity style={styles.inviteBtnSmall} onPress={handleInviteModal}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Mời</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {/* Danh sách thành viên đã mời */}
            {invitedMembers.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Thành viên đã mời:</Text>
                {invitedMembers.map((m, idx) => (
                  <View key={m.email} style={styles.invitedItem}>
                    {m.user && m.user.picUrl && (
                      <Image source={{ uri: m.user.picUrl }} style={{ width: 28, height: 28, borderRadius: 14, marginRight: 8 }} />
                    )}
                    <Text style={{ flex: 1 }}>{m.user?.username || m.email}</Text>
                    <TouchableOpacity onPress={() => handleRemoveInvited(m.email)}>
                      <MaterialIcons name="close" size={18} color="#e53935" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity onPress={() => setInviteModal(false)} style={{ marginTop: 8 }}>
              <Text style={{ color: '#007AFF' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Member Modal */}
      <Modal visible={!!selectedMember} transparent animationType="fade">
        <View style={styles.memberModalContainer}>
          <View style={styles.memberModalContent}>
            <Text style={styles.memberNameModal}>{selectedMember?.name}</Text>
            <Text style={styles.memberEmail}>{selectedMember?.email}</Text>
            {selectedMember?.location ? (
              <TouchableOpacity style={styles.navBtn} onPress={handleOpenMaps}>
                <Text style={{ color: "#fff", fontWeight: 'bold', marginLeft: 4 }}>Chỉ đường</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: 'gray', marginTop: 8 }}>Chưa chia sẻ vị trí</Text>
            )}
            <TouchableOpacity onPress={closeMemberModal} style={{ marginTop: 8 }}>
              <Text style={{ color: '#007AFF' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.shareRowCustom}>
        <TouchableOpacity
          style={[styles.shareBtn, isSharing && styles.shareBtnActive]}
          onPress={handleShareLocation}
          activeOpacity={0.7}
        >
          <MaterialIcons name="my-location" size={22} color={isSharing ? '#fff' : '#007AFF'} style={{ marginRight: 8 }} />
          <Text style={[styles.shareBtnText, isSharing && { color: '#fff' }]}> {isSharing ? 'Đang chia sẻ vị trí' : 'Chia sẻ vị trí'} </Text>
        </TouchableOpacity>
      </View>

      <GroupMap
        members={members.filter(m => m.location && typeof m.location.latitude === 'number' && typeof m.location.longitude === 'number')}
        myLocation={myLocation}
        targetMember={selectedMember}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#fff', padding: 10, borderRadius: 10, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#007AFF' },
  memberListCard: { backgroundColor: '#fff', padding: 14, borderRadius: 12, elevation: 2, marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  memberItem: { flexDirection: 'row', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee', borderRadius: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e3e3e3', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontWeight: 'bold', color: '#007AFF', fontSize: 18 },
  memberName: { fontWeight: 'bold', color: '#222' },
  memberEmail: { color: '#666', fontSize: 13 },
  statusDot: color => ({
    width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginLeft: 8
  }),
  fabInvite: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: appColors.primary,
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, elevation: 2
  },
  inviteBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 4 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: 300, alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 4,
    width: '100%',
  },
  modalBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', width: '100%' },
  memberModalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  memberModalContent: { backgroundColor: '#fff', padding: 26, borderRadius: 14, alignItems: 'center', width: width * 0.8 },
  memberNameModal: { fontWeight: 'bold', fontSize: 19, marginBottom: 6, color: "#007AFF" },
  navBtn: { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginTop: 16 },
  shareRowCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4ff',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 22,
    elevation: 2,
  },
  shareBtnActive: {
    backgroundColor: '#007AFF',
  },
  shareBtnText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inviteBtnSmall: { backgroundColor: '#007AFF', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, marginLeft: 10 },
  searchResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
  },
  invitedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    elevation: 1,
    width: '100%',
  },
  modalContentLarge: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: width * 0.96,
    minHeight: 200,
    alignItems: 'stretch',
    alignSelf: 'center',
  },
});

export default GroupScreen;
