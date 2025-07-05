import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createGroup, getGroupsByUser } from './services/connectApi';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AxiosInstance from '../../services/api/AxiosInstance';

const ConnectScreen = ({navigation}) => {
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = useSelector(state => state.auth.userId);
  const userLocation = useSelector(state => state.auth.location);
  const [myGroups, setMyGroups] = useState([]);

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
    fetchGroups();
  }, [userId, showGroupForm]);

  // Tạo group mới
  const handleCreateGroup = async () => {
    if (!groupName || !selectedEvent) {
      alert('Nhập tên nhóm và chọn sự kiện!');
      return;
    }
    setLoading(true);
    try {
      const res = await createGroup(selectedEvent._id, groupName, [], userId);
      setLoading(false);
      setShowGroupForm(false);
      setGroupName('');
      setSelectedEvent(null);

      console.log('Kết quả tạo group:', res);

      if (res && res._id) {
        navigation.navigate('GroupScreen', { groupId: res._id, userLocation });
      } else {
        alert('Tạo nhóm thất bại!');
      }
    } catch (error) {
      setLoading(false);
      alert('Có lỗi khi tạo nhóm!');
      console.log('Lỗi tạo group:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo nhóm cho sự kiện</Text>
      <TouchableOpacity style={styles.inviteBtn} onPress={() => navigation.navigate('InviteScreen')}>
        <Icon name="mail-outline" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>Lời mời nhóm</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.groupBtn} onPress={() => setShowGroupForm(true)}>
        <Icon name="group-add" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>Tạo nhóm mới</Text>
      </TouchableOpacity>
      {/* Danh sách group đã tham gia */}
      {myGroups.length > 0 && (
        <View style={styles.myGroupsSection}>
          <Text style={styles.myGroupsTitle}>Nhóm của bạn</Text>
          <FlatList
            data={myGroups}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.myGroupItem} onPress={() => navigation.navigate('GroupScreen', { groupId: item._id })}>
                <Text style={styles.myGroupName}>{item.groupName}</Text>
                {/* <Text style={styles.myGroupEvent}>Sự kiện: {item.name}</Text> */}
              </TouchableOpacity>
            )}
            style={{ maxHeight: 180 }}
          />
        </View>
      )}
      <Modal visible={showGroupForm} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.groupForm}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 18 }}>Tạo nhóm mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên nhóm"
              value={groupName}
              onChangeText={setGroupName}
            />
            <Text style={{ marginVertical: 8 }}>Chọn sự kiện:</Text>
            <FlatList
              data={events}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.eventItem,
                    selectedEvent && selectedEvent._id === item._id && styles.eventItemSelected
                  ]}
                  onPress={() => setSelectedEvent(item)}
                >
                  <Text style={{ color: '#222', fontWeight: 'bold' }}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 120 }}
            />
            <TouchableOpacity
              style={[
                styles.groupBtn,
                (!groupName || !selectedEvent) && { backgroundColor: '#ccc' }
              ]}
              onPress={handleCreateGroup}
              disabled={!groupName || !selectedEvent}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tạo nhóm</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowGroupForm(false)} style={{ marginTop: 8 }}>
              <Text style={{ color: '#007AFF' }}>Đóng</Text>
            </TouchableOpacity>
            {loading && <ActivityIndicator color="#007AFF" style={{ marginTop: 10 }} />}
          </View>
        </View>
      </Modal>
      {loading && !showGroupForm && <ActivityIndicator color="#007AFF" style={{ marginTop: 10 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f8fb' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#007AFF' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 4 },
  groupBtn: { flexDirection: 'row', backgroundColor: '#ff9800', padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20, elevation: 2 },
  groupForm: { backgroundColor: '#fff', padding: 20, borderRadius: 16, width: 330, alignItems: 'stretch', elevation: 5 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  eventItem: { padding: 10, borderRadius: 8, backgroundColor: '#f7faf9', marginBottom: 6 },
  eventItemSelected: { backgroundColor: '#e0f7fa', borderWidth: 1, borderColor: '#007AFF' },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', padding: 10, borderRadius: 8, marginBottom: 10, alignSelf: 'flex-end' },
  myGroupsSection: { marginTop: 18, marginBottom: 8 },
  myGroupsTitle: { fontWeight: 'bold', fontSize: 17, color: '#007AFF', marginBottom: 8 },
  myGroupItem: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, elevation: 1 },
  myGroupName: { fontWeight: 'bold', color: '#222', fontSize: 15 },
  myGroupEvent: { color: '#666', fontSize: 13 },
});

export default ConnectScreen;
