import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { inviteToGroup, searchUserByEmail, getGroupInvites } from './services/connectApi';
import { useSelector } from 'react-redux';

const InviteToGroupScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState([]); // {email, user, invited}
  const [loading, setLoading] = useState(false);
  const userEmail = useSelector(state => state.auth.userData?.email);

  // Tìm user qua email
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

  // Mời thành viên
  const handleInvite = async () => {
    if (!groupId || !searchResult) return;
    setSearchLoading(true);
    await inviteToGroup(groupId, searchResult.email);
    setInvitedMembers([...invitedMembers, { email: searchResult.email, user: searchResult, invited: true }]);
    setSearchResult(null);
    setSearchEmail('');
    setSearchLoading(false);
  };

  // Xóa thành viên đã mời
  const handleRemoveInvited = (email) => {
    setInvitedMembers(invitedMembers.filter(m => m.email !== email));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mời thành viên vào nhóm</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Nhập email thành viên"
          value={searchEmail}
          onChangeText={setSearchEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity onPress={handleSearch} style={{ marginLeft: 8 }}>
          <Icon name="search" size={22} color="#007AFF" />
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
            <TouchableOpacity style={styles.inviteBtnSmall} onPress={handleInvite}>
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
                <Icon name="close" size={18} color="#e53935" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f8fb' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#007AFF' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 4 },
  inviteBtnSmall: { backgroundColor: '#007AFF', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, marginLeft: 10 },
  searchResultBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 8 },
  invitedItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 8, marginBottom: 6, elevation: 1 },
});

export default InviteToGroupScreen; 