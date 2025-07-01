import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Dimensions, Modal, TextInput, Switch, Pressable
} from 'react-native';
import GroupMap from './components/GroupMap';
import { getGroupMembers, updateLocation } from './services/connectApi';
import Geolocation from '@react-native-community/geolocation';
import { useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const GroupScreen = ({ route }) => {
  const { groupId } = route?.params || { groupId: 'group123' };
  const [members, setMembers] = useState([]);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const userId = useSelector(state => state.auth.userId);

  useEffect(() => {
    const fetchMembers = async () => {
      const data = await getGroupMembers(groupId);
      setMembers(data);
    };
    fetchMembers();
  }, [groupId]);

  useEffect(() => {
    if (isSharing) {
      Geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setMyLocation(coords);
          await updateLocation(groupId, userId, coords);
        },
        (error) => {
          alert('Không lấy được vị trí: ' + error.message);
          setIsSharing(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setMyLocation(null);
    }
  }, [isSharing, groupId, userId]);

  // Mock API mời thành viên
  const inviteToGroup = async (groupId, email) => {
    // TODO: Gọi API thực tế
    return { success: true };
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    await inviteToGroup(groupId, inviteEmail);
    alert('Đã gửi lời mời!');
    setInviteModal(false);
    setInviteEmail('');
  };

  const handleShareLocation = () => setIsSharing(!isSharing);

  // Handle chọn thành viên để chỉ đường
  const handleNavigateToMember = (member) => {
    setSelectedMember(member);
  };

  const closeMemberModal = () => setSelectedMember(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nhóm sự kiện</Text>
      </View>

      <View style={styles.memberListCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.subtitle}>Thành viên nhóm</Text>
          <TouchableOpacity onPress={() => setInviteModal(true)} style={styles.fabInvite}>
            <MaterialIcons name="person-add-alt" size={20} color="#fff" />
            <Text style={styles.inviteBtnText}>Mời</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={members}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleNavigateToMember(item)}>
              <View style={styles.memberItem}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={styles.memberEmail}>{item.email}</Text>
                </View>
                <View style={styles.statusDot(item.location ? 'green' : 'gray')} />
              </View>
            </Pressable>
          )}
          style={{ marginBottom: 6 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Modal visible={inviteModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Mời thành viên vào group</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email..."
              value={inviteEmail}
              onChangeText={setInviteEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.modalBtn} onPress={handleInvite}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Mời</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setInviteModal(false)} style={{ marginTop: 8 }}>
              <Text style={{ color: '#007AFF' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedMember} transparent animationType="fade">
        <View style={styles.memberModalContainer}>
          <View style={styles.memberModalContent}>
            <Text style={styles.memberNameModal}>{selectedMember?.name}</Text>
            <Text style={styles.memberEmail}>{selectedMember?.email}</Text>
            {selectedMember?.location ? (
              <TouchableOpacity style={styles.navBtn} onPress={() => {
                // Gửi thông tin selectedMember cho GroupMap để vẽ đường
                setSelectedMember(null);
                // Ví dụ: bạn có thể set state selectedTarget cho GroupMap
              }}>
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

      <View style={styles.shareRow}>
        <Text style={{ fontWeight: 'bold', color: '#007AFF', marginRight: 8 }}>Chia sẻ vị trí real-time</Text>
        <Switch value={isSharing} onValueChange={handleShareLocation} />
      </View>
      <GroupMap
        members={members}
        myLocation={myLocation}
        targetMember={selectedMember}
      />
      {isSharing && <Text style={styles.sharingText}>Đang chia sẻ vị trí...</Text>}
      {myLocation && <Text style={styles.sharedText}>Đã chia sẻ vị trí!</Text>}
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
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ff9800',
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, elevation: 2
  },
  inviteBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 4 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: 300, alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, width: '100%', marginBottom: 12 },
  modalBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', width: '100%' },
  memberModalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  memberModalContent: { backgroundColor: '#fff', padding: 26, borderRadius: 14, alignItems: 'center', width: width * 0.8 },
  memberNameModal: { fontWeight: 'bold', fontSize: 19, marginBottom: 6, color: "#007AFF" },
  navBtn: { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginTop: 16 },
  shareRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 8 },
  sharingText: { color: 'blue', marginTop: 8, fontWeight: 'bold' },
  sharedText: { color: 'green', marginTop: 4, fontWeight: 'bold' }
});

export default GroupScreen;
