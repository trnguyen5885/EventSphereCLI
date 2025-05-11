import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const UserItem = ({
  item,
  activeTab,
  handleAccept,
  handleReject,
  handleSendRequest,
  setSelectedUser,
  setModalVisible,
  styles,
  getRelativeTime,
  role
}) => {
  // Tab bạn bè: chỉ render nút Hủy kết bạn
  if (activeTab === 'friends') {
    return (
      <View style={styles.userItem}>
        <Image
          source={{ uri: item.picUrl || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username}</Text>
          {item.createdAt && (
            <Text style={styles.timeText}>{getRelativeTime(item.createdAt)}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.actionButton, styles.friendButton]}
          onPress={() => {
            if (setSelectedUser && setModalVisible) {
              setSelectedUser(item);
              setModalVisible(true);
            }
          }}
        >
          <Text style={styles.buttonText}>Hủy kết bạn</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Tab pending: chỉ render accept/reject
  if (activeTab === 'pending') {
    const sender = item.senderId || {};
    return (
      <View style={styles.userItem}>
        <Image
          source={{ uri: sender.picUrl || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{sender.name || sender.username}</Text>
          {item.createdAt && (
            <Text style={styles.timeText}>{getRelativeTime(item.createdAt)}</Text>
          )}
        </View>
        {item.status === 'accepted' ? (
          <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
            <Text style={{ color: '#2E7D32', fontSize: 14, fontWeight: '500' }}>Đã trở thành bạn bè</Text>
          </View>
        ) : item.status === 'declined' ? (
          <View style={{ backgroundColor: '#FFEBEE', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
            <Text style={{ color: '#C62828', fontSize: 14, fontWeight: '500' }}>Đã từ chối</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept && handleAccept(item._id)}>
              <Text style={styles.buttonText}>Chấp nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject && handleReject(item._id)}>
              <Text style={styles.textReject}>Từ chối</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Tab sent: chỉ render nút hủy lời mời
  if (activeTab === 'sent') {
    return (
      <View style={styles.userItem}>
        <Image
          source={{ uri: item.picUrl || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username}</Text>
          {item.createdAt && (
            <Text style={styles.timeText}>{getRelativeTime(item.createdAt)}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.actionButton, styles.sentButton]}
          onPress={() => handleSendRequest && handleSendRequest(item._id, 'sent')}
        >
          <MaterialIcons name="close" size={16} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Hủy lời mời</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Mặc định (nếu có tab khác): không render gì
  if (activeTab === 'search' || role) {
    return (
      <View style={styles.userItem}>
        <Image
          source={{ uri: item.picUrl || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username}</Text>
        </View>
        {role === 'friend' ? (
          <View style={[styles.actionButton, styles.friendButton]}>
            <Text style={styles.buttonText}>Đã kết bạn</Text>
          </View>
        ) : role === 'sent' ? (
          <View style={[styles.actionButton, styles.sentButton]}>
            <Text style={styles.buttonText}>Đã gửi</Text>
          </View>
        ) : role === 'received' ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAccept && handleAccept(item._id)}
          >
            <Text style={styles.buttonText}>Chấp nhận</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={() => handleSendRequest && handleSendRequest(item._id, 'none')}
          >
            <Text style={styles.buttonText}>Kết bạn</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return null;
};

export default UserItem; 