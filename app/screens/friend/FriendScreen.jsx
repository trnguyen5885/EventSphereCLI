import { AxiosInstance } from '../../../app/services';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import debounce from 'lodash.debounce';

import Ionicons from 'react-native-vector-icons/Ionicons';
import UserItem from './components/UserItem';
import FriendListTab from './components/FriendListTab';
import PendingRequestTab from './components/PendingRequestTab';
import SentRequestTab from './components/SentRequestTab';
import { handleSendRequest as handleSendRequestApi, handleUnfriend, fetchPendingRequests } from './services/friendApi';
import { RowComponent } from '../../components';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingCount } from '../../../app/redux/slices/friendRequestSlice';

const FriendScreen = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const friendListReloadRef = useRef();
  const dispatch = useDispatch();
  const pendingCount = useSelector(state => state.friendRequest.pendingCount);

  const debouncedSearch = useCallback(
    debounce(async (text) => {
      if (text.trim().length < 2) {
        setData([]);
        setShowSuggestions(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await AxiosInstance().get(`friends/search?searchTerm=${text}`);
        setData(res);
        setShowSuggestions(true);
      } catch (e) {
        console.log("Search Failure: " + e);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleSendRequest = async (userId) => {
    try {
      await handleSendRequestApi(userId, 'none');
      setData(prevData =>
        prevData.map(user =>
          user._id === userId ? { ...user, role: 'sent' } : user
        )
      );
    } catch (e) {
      // Xử lý lỗi nếu cần
    }
  };

  const renderUserItem = ({ item }) => (
    <UserItem
      item={item}
      role={item.role}
      activeTab="search"
      setSelectedUser={setSelectedUser}
      setModalVisible={setModalVisible}
      handleSendRequest={() => handleSendRequest(item._id)}
      styles={styles}
    />
  );

  const renderTabView = () => {
    switch (activeTab) {
      case 'friends':
        return (
          <FriendListTab
            styles={styles}
            setSelectedUser={setSelectedUser}
            setModalVisible={setModalVisible}
            onReloadRef={friendListReloadRef}
            ref={friendListReloadRef}
          />
        );
      case 'pending':
        return (
          <PendingRequestTab
            styles={styles}
            setSelectedUser={setSelectedUser}
            setModalVisible={setModalVisible}
          />
        );
      case 'sent':
        return (
          <SentRequestTab
            styles={styles}
            setSelectedUser={setSelectedUser}
            setModalVisible={setModalVisible}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    dispatch(fetchPendingCount());
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f8f8f8" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bạn bè</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm người dùng..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={value => {
            setQuery(value);
            debouncedSearch(value);
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity 
            onPress={() => {
              setQuery('');
              setShowSuggestions(false);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {isLoading && (
        <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
      )}

      {showSuggestions && query.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Kết quả tìm kiếm</Text>
          {data.length > 0 ? (
            <FlatList
              data={data}
              renderItem={renderUserItem}
              keyExtractor={item => item._id}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
            />
          ) : !isLoading && (
            <Text style={styles.noResultsText}>Không tìm thấy người dùng nào.</Text>
          )}
        </View>
      )}

      {/* Tabs Navigation */}
      {!showSuggestions && (
        <>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
              onPress={() => setActiveTab('friends')}
            >
              <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
                Bạn bè
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
              onPress={() => setActiveTab('pending')}
            >
              <RowComponent>
                <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                  Lời mời nhận
                </Text>
                {pendingCount > 0 && (
                  <View style={{ marginLeft: 6, backgroundColor: '#FF3B30', borderRadius: 10, minWidth: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
                      {pendingCount}
                    </Text>
                  </View>
                )}
              </RowComponent>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
              onPress={() => setActiveTab('sent')}
            >
              <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
                Đã gửi
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {renderTabView()}
          </View>
        </>
      )}

      {/* Unfriend Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận hủy kết bạn</Text>
            {selectedUser && (
              <Text style={styles.modalText}>
                Bạn có chắc chắn muốn hủy kết bạn với {selectedUser.username}?
              </Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={async () => {
                  await handleUnfriend(selectedUser._id);
                  setModalVisible(false);
                  if (friendListReloadRef.current) {
                    friendListReloadRef.current();
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  loader: {
    marginTop: 12,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxHeight: '60%',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  suggestionsList: {
    maxHeight: '100%',
  },
  noResultsText: {
    color: '#888',
    textAlign: 'center',
    padding: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#888',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#888',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonIcon: {
    marginRight: 6,
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  sentButton: {
    backgroundColor: '#8E8E93',
  },
  acceptButton: {
    backgroundColor: '#2075FF',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  rejectButton: {
    backgroundColor: '#E2E5E9',
    padding: 10,
    borderRadius: 20,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textReject: {
    color: '#0C2747',
    fontSize: 14,
    fontWeight: '600',
  },
  friendButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
  },
  confirmButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  }
});

export default FriendScreen;
