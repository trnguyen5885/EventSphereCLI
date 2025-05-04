import { AxiosInstance } from '../../../app/services';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

const FriendScreen = () => {
    const [query, setQuery] = useState("");
    const [data, setData] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);

    const handleSendRequest = async(id, role) => {
        try {
          if (role === 'none') {
            const body = { receiverId: id };
            const sendRequest = await AxiosInstance().post(`friends/friendRequest`, body);
            if(sendRequest.status == 200 || true){
              setData(prevData => 
                prevData.map(user =>
                  user._id === id ? { ...user, role: 'sent' } : user
                )
              );
              console.log("Successfully sent request");
            }
          } else if (role === 'sent') {
            // Hủy lời mời kết bạn
            const cancelRequest = await AxiosInstance().post(`friends/cancelRequest/${id}`);
            if(cancelRequest.status == 200){
              setData(prevData => prevData.map(user =>
                user._id === id ? { ...user, role: 'none' } : user
              ));
              console.log("Successfully canceled request");
            }
          } else if (role === 'friend') {
            // Hủy kết bạn
            const unfriend = await AxiosInstance().post(`friends/unfriend/${id}`);
            if(unfriend.status == 200){
              setData(prevData => prevData.map(user =>
                user._id === id ? { ...user, role: 'none' } : user
              ));
              console.log("Successfully unfriended");
            }
          } else if (role === 'received') {
            // Chấp nhận lời mời kết bạn
            const acceptRequest = await AxiosInstance().post(`friends/accept/${id}`);
            if(acceptRequest.status == 200){
              setData(prevData => prevData.map(user =>
                user._id === id ? { ...user, role: 'friend' } : user
              ));
              console.log("Successfully accepted friend request");
            }
          }
        } catch (error) {
          console.log(error);
        }
      };
  const handleSearchUser = async () => {
    try{
      const res = await AxiosInstance().get(`friends/search?searchTerm=${query}`);
      console.log(res);
      setData(res);
    }catch(e){
      console.log("Search Failue: "+e);
    }
  }

  // Hàm chuyển đổi thời gian gửi lời mời thành chuỗi mô tả
  function getRelativeTime(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) {
      return `${diffSec} giây`;
    }
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return `${diffMin} phút`;
    }
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) {
      return `${diffHour} giờ`;
    }
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) {
      return `${diffDay} ngày`;
    }
    const diffWeek = Math.floor(diffDay / 7);
    if (diffDay < 30) {
      return `${diffWeek} tuần`;
    }
    const diffMonth = Math.floor(diffDay / 30);
    if (diffDay < 365) {
      return `${diffMonth} tháng`;
    }
    const diffYear = Math.floor(diffDay / 365);
    return `${diffYear} năm`;
  }

  const renderUserItem = ({ item }) => {
    let buttonStyle = [styles.friendButton];
    let buttonText = '';
    let buttonDisabled = false;
    if (item.role === 'none') {
      buttonStyle.push(styles.addFriendButton);
      buttonText = 'Kết bạn';
    } else if (item.role === 'sent') {
      buttonStyle.push({ backgroundColor: '#ccc' });
      buttonText = 'Đã gửi lời mời';
      buttonDisabled = true;
    } else if (item.role === 'received') {
      buttonStyle.push({ backgroundColor: '#007AFF' });
      buttonText = 'Chấp nhận';
    } else if (item.role === 'friend') {
      buttonStyle.push(styles.unfriendButton);
      buttonText = 'Bạn bè';
      buttonDisabled = true;
    }
    return (
      <View style={styles.userItem}>
        <Image
          source={{ uri: item.picUrl }}
          style={styles.avatar}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.userName}>{item.username}</Text>
          {/* Hiển thị thời gian gửi lời mời nếu có trường createdAt */}
          {item.createdAt && (
            <Text style={{ color: '#888', fontSize: 12 }}>
              {getRelativeTime(item.createdAt)}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={buttonStyle}
          onPress={() => handleSendRequest(item._id, item.role)}
          disabled={buttonDisabled}
        >
          <Text style={styles.buttonText}>
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bạn bè..."
          value={query}
          onChangeText={value=>setQuery(value)}
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearchUser}
        >
          <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={data}
        renderItem={renderUserItem}
        keyExtractor={item => item._id}
        extraData={data}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  friendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addFriendButton: {
    backgroundColor: '#007AFF',
  },
  unfriendButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FriendScreen;
