import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getGroupInvited, acceptInvite, declineInvite } from './services/connectApi';
import { useSelector } from 'react-redux';

const InviteScreen = ({ navigation }) => {
  const userEmail = useSelector(state => state.auth.userData?.email);
  const userId = useSelector(state => state.auth.userId);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvites = async () => {
      setLoading(true);
      const invitesRes = await getGroupInvited(userId);
      console.log('invitesRes:', invitesRes);
      let allInvites = [];
      if (invitesRes && invitesRes.invites) {
        allInvites = invitesRes.invites.map(invite => ({
          ...invite,
          groupName: invite.groupName,
          groupId: invite.groupId,
          eventId: invite.eventId,
          status: invite.status || 'pending',
          owner: invite.owner,
          invitedAt: invite.invitedAt
        }));
      }
      setInvites(allInvites);
      setLoading(false);
    };
    fetchInvites();
  }, [userId, userEmail]);

  const handleAccept = async (groupId) => {
    await acceptInvite(groupId, userId);
    setInvites(invites.map(inv => inv.groupId === groupId ? { ...inv, status: 'accepted' } : inv));
    navigation.navigate('GroupScreen', { groupId });

  };

  const handleDecline = async (groupId) => {
    await declineInvite(groupId, userId);
    setInvites(invites.filter(inv => inv.groupId !== groupId));
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color="#007AFF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lời mời tham gia nhóm</Text>
      <FlatList
        data={invites}
        keyExtractor={item => item.groupId}
        renderItem={({ item }) => (
          <View style={styles.inviteItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inviteGroup}>{item.groupName}</Text>
              <Text style={styles.inviteStatus}>Trạng thái: {item.status}</Text>
            </View>
            {item.status === 'pending' && (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.groupId)}>
                  <Text style={{ color: '#fff' }}>Chấp nhận</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn} onPress={() => handleDecline(item.groupId)}>
                  <Text style={{ color: '#fff' }}>Từ chối</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Không có lời mời nào.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#007AFF', marginBottom: 18 },
  inviteItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10, elevation: 1 },
  inviteGroup: { fontWeight: 'bold', color: '#222' },
  inviteStatus: { color: '#888', fontSize: 13 },
  acceptBtn: { backgroundColor: '#28a745', padding: 8, borderRadius: 8, marginRight: 8 },
  declineBtn: { backgroundColor: '#e53935', padding: 8, borderRadius: 8 },
});

export default InviteScreen; 