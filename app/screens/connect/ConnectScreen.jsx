import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { searchUserByEmail, sendFriendRequest, createGroup } from './services/connectApi';

const mockFriends = [
  { id: '1', name: 'Nguyen Van A', email: 'a@email.com' },
  { id: '2', name: 'Tran Thi B', email: 'b@email.com' },
];

const ConnectScreen = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [friends, setFriends] = useState(mockFriends);
  const [searchResult, setSearchResult] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tìm kiếm user qua email
  const handleSearch = async () => {
    if (!searchEmail) return;
    setLoading(true);
    const result = await searchUserByEmail(searchEmail);
    setSearchResult(result);
    setLoading(false);
  };

  // Gửi lời mời kết bạn
  const handleAddFriend = async (user) => {
    setLoading(true);
    await sendFriendRequest(user.id);
    alert(`Đã gửi lời mời kết bạn tới ${user.email}`);
    setLoading(false);
  };

  // Chọn bạn bè khi tạo group
  const handleSelectFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Tạo group mới
  const handleCreateGroup = async () => {
    if (!groupName || selectedFriends.length === 0) {
      alert('Nhập tên nhóm và chọn ít nhất 1 bạn!');
      return;
    }
    setLoading(true);
    const res = await createGroup(groupName, selectedFriends);
    setLoading(false);
    setShowGroupForm(false);
    setGroupName('');
    setSelectedFriends([]);
    alert(`Tạo nhóm thành công! GroupId: ${res.groupId}`); // TODO: Navigate sang GroupScreen nếu muốn
  };

  // UI avatar chữ cái đầu
  const getAvatar = (name) => name?.[0]?.toUpperCase() || '?';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kết nối bạn bè</Text>

      {/* Search bạn bè */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Nhập email bạn bè..."
          value={searchEmail}
          onChangeText={setSearchEmail}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Icon name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Kết quả tìm kiếm */}
      {searchResult && (
        <View style={styles.resultBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getAvatar(searchResult.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.friendName}>{searchResult.name}</Text>
            <Text style={styles.friendEmail}>{searchResult.email}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => handleAddFriend(searchResult)}>
            <Text style={{ color: '#fff' }}>Kết bạn</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Danh sách bạn bè */}
      <Text style={styles.subtitle}>Bạn bè của bạn</Text>
      <FlatList
        data={friends}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarText}>{getAvatar(item.name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.friendName}>{item.name}</Text>
              <Text style={styles.friendEmail}>{item.email}</Text>
            </View>
          </View>
        )}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingBottom: 8 }}
      />

      {/* Nút tạo group */}
      <TouchableOpacity style={styles.groupBtn} onPress={() => setShowGroupForm(true)}>
        <Icon name="group-add" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>Tạo nhóm cho sự kiện</Text>
      </TouchableOpacity>

      {/* Modal form tạo group */}
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
            <Text style={{ marginVertical: 8 }}>Chọn bạn bè:</Text>
            <FlatList
              data={friends}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedFriends.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.friendItemSelectable,
                      isSelected && styles.friendItemSelected
                    ]}
                    onPress={() => handleSelectFriend(item.id)}
                  >
                    <View style={styles.avatarSmall}>
                      <Text style={styles.avatarText}>{getAvatar(item.name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.friendName}>{item.name}</Text>
                      <Text style={styles.friendEmail}>{item.email}</Text>
                    </View>
                    {isSelected && <Icon name="check-circle" color="#009688" size={22} />}
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 160 }}
            />
            <TouchableOpacity
              style={[
                styles.groupBtn,
                (!groupName || selectedFriends.length === 0) && { backgroundColor: '#ccc' }
              ]}
              onPress={handleCreateGroup}
              disabled={!groupName || selectedFriends.length === 0}
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
  searchRow: { flexDirection: 'row', marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8, backgroundColor: '#fff' },
  searchBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8 },
  resultBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12, elevation: 1 },
  addBtn: { backgroundColor: '#28a745', paddingVertical: 7, paddingHorizontal: 16, borderRadius: 8, marginLeft: 10 },
  subtitle: { fontSize: 18, fontWeight: '600', marginVertical: 12, color: '#444' },
  friendItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginBottom: 6, borderRadius: 8, padding: 10, elevation: 1 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e3e3e3', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e0f2f1', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontWeight: 'bold', color: '#007AFF', fontSize: 18 },
  friendName: { fontWeight: 'bold', color: '#222' },
  friendEmail: { color: '#666', fontSize: 13 },
  groupBtn: { flexDirection: 'row', backgroundColor: '#ff9800', padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20, elevation: 2 },
  groupForm: { backgroundColor: '#fff', padding: 20, borderRadius: 16, width: 330, alignItems: 'stretch', elevation: 5 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  friendItemSelectable: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f7faf9', marginBottom: 6, borderRadius: 8, padding: 10 },
  friendItemSelected: { backgroundColor: '#e0f7fa' },
});

export default ConnectScreen;
