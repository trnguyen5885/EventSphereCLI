import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, ScrollView, StyleSheet, Animated, Alert, Modal,
  Dimensions, Text, TextInput, TouchableOpacity, ActivityIndicator, Image
} from 'react-native';
import { useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// Components
import GroupHeader from './components/GroupHeader';
import ActionButtons from './components/ActionButtons';
import MembersList from './components/MembersList';
import GroupMap from './components/GroupMap';
import CustomLogoutDialog from '../../components/CustomLogoutDialog';

// Hooks
import { useLocationSharing } from './components/useLocationSharing';
import { useGroupMembers } from './hooks/useGroupMembers';
import { useErrorHandler } from './hooks/useErrorHandler';

// Services
import {
  inviteToGroup,
  searchUserByEmail,
  leaveGroup,
  deleteGroup
} from './services/connectApi';

// Types
import { 
  GroupScreenProps, 
  ConfirmationType, 
  SearchResult,
  MemberWithLocation 
} from './types/GroupTypes';

// Constants
import { appColors } from '../../constants/appColors';

const { width, height } = Dimensions.get('window');

const GroupScreen: React.FC<GroupScreenProps> = ({ route, navigation }) => {
  const { 
    groupId, 
    userLocation: initialUserLocation, 
    groupName, 
    ownerId 
  } = route?.params || {};
  
  const userId = useSelector((state: any) => state.auth.userId);
  const isOwner = String(userId) === String(ownerId?._id);

  // Animation
  const [animatedValue] = useState(new Animated.Value(0));

  // State
  const [isSharing, setIsSharing] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberWithLocation | null>(null);
  const [distanceText, setDistanceText] = useState('');
  
  // Modal states
  const [inviteModal, setInviteModal] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmationType, setConfirmationType] = useState<ConfirmationType | null>(null);
  
  // Invite states
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<{ email: string }[]>([]);

  // Custom hooks
  const { error, handleError, clearError, showErrorAlert } = useErrorHandler();
  
  const {
    members,
    locations,
    loading: locationLoading,
    myLocation, // Real-time GPS location from useLocationSharing
    refetch
  } = useLocationSharing({ groupId, userId, isSharing, userLocation: initialUserLocation });

  const {
    membersWithLocation,
    onlineMembers,
    offlineMembers,
    getVisibleMembers,
    calculateMemberDistance,
    isUserOnline,
    stats
  } = useGroupMembers({
    members,
    locations,
    userId,
    initialUserLocation: myLocation || undefined // Use real-time location as fallback
  });

  // Initialize animation
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [animatedValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsSharing(false);
    };
  }, []);

  // Update distance text when target changes
  useEffect(() => {
    if (targetMemberId) {
      const member = membersWithLocation.find(m => 
        (m._id || m.id) === targetMemberId
      );
      if (member) {
        const distance = calculateMemberDistance(member);
        setDistanceText(distance);
      }
    } else {
      setDistanceText('');
    }
  }, [targetMemberId, membersWithLocation, calculateMemberDistance]);

  // Handlers
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleToggleSharing = useCallback(async () => {
    try {
      setSharingLoading(true);
      const newSharingState = !isSharing;
      setIsSharing(newSharingState);
      
      // Gọi fetchAllData ngay lập tức khi bật sharing
      if (newSharingState) {
        refetch();
      }
    } catch (err) {
      handleError(err, 'toggle location sharing');
    } finally {
      setSharingLoading(false);
    }
  }, [handleError, isSharing, refetch]);

  const handleTargetMember = useCallback((member: MemberWithLocation) => {
    const id = member._id || member.id;
    if (!id) return; // Skip if no valid id
    if (targetMemberId === id) {
      setTargetMemberId(null);
      return;
    }
    setTargetMemberId(id);
  }, [targetMemberId]);

  const handleMemberPress = useCallback((member: MemberWithLocation) => {
    setSelectedMember(member);
  }, []);

  const handleNavigateToMember = useCallback((member: MemberWithLocation) => {
    handleTargetMember(member);
  }, [handleTargetMember]);

  // Search and invite handlers
  const handleSearch = useCallback(async () => {
    if (!searchEmail.trim()) return;
    
    setSearchLoading(true);
    try {
      // Check if email already exists in group
      const isExistingMember = members.some(member => 
        member.email.toLowerCase() === searchEmail.toLowerCase()
      );
      
      if (isExistingMember) {
        setSearchResult({ email: searchEmail, isExisting: true });
        return;
      }

      const user = await searchUserByEmail(searchEmail);
      const result = Array.isArray(user) ? user[0] : user?.data?.[0];
      setSearchResult(result ? { ...result, isExisting: false } : null);
    } catch (err) {
      handleError(err, 'search user');
    } finally {
      setSearchLoading(false);
    }
  }, [searchEmail, members, handleError]);

  const handleInvite = useCallback(async () => {
    if (!groupId || !searchResult) return;
    
    try {
      await inviteToGroup(groupId, searchResult.email);
      refetch();
      setInvitedMembers(prev => [...prev, { email: searchResult.email }]);
      setSearchEmail('');
      setSearchResult(null);
      Alert.alert('Thành công', 'Đã gửi lời mời thành công');
    } catch (err) {
      handleError(err, 'invite member');
    }
  }, [groupId, searchResult, refetch, handleError]);

  // Group management handlers
  const handleLeaveGroup = useCallback(async () => {
    try {
      await leaveGroup(groupId, userId);
      Alert.alert('Thành công', 'Bạn đã rời nhóm.');
      navigation.goBack();
    } catch (err) {
      handleError(err, 'leave group');
    }
  }, [groupId, userId, navigation, handleError]);

  const handleDeleteGroup = useCallback(async () => {
    try {
      await deleteGroup(groupId);
      Alert.alert('Thành công', 'Đã xóa nhóm');
      navigation.goBack();
    } catch (err) {
      handleError(err, 'delete group');
    }
  }, [groupId, navigation, handleError]);

  const showConfirmModal = useCallback((type: ConfirmationType) => {
    setConfirmationType(type);
    setConfirmModalVisible(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    setConfirmModalVisible(false);
    if (confirmationType === 'delete') {
      await handleDeleteGroup();
    } else {
      await handleLeaveGroup();
    }
  }, [confirmationType, handleDeleteGroup, handleLeaveGroup]);

  // Get visible members for map
  const visibleMembers = useMemo(() => 
    getVisibleMembers(targetMemberId), 
    [getVisibleMembers, targetMemberId]
  );

  // Show error if exists
  useEffect(() => {
    if (error) {
      showErrorAlert();
    }
  }, [error, showErrorAlert]);

  return (
    <View style={styles.container}>
      <GroupHeader
        groupName={groupName || 'Nhóm sự kiện'}
        isOwner={isOwner}
        stats={stats}
        onBack={handleBack}
        onDeleteGroup={() => showConfirmModal('delete')}
        onLeaveGroup={() => showConfirmModal('leave')}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Map Container */}
        <View style={styles.mapContainer}>
          <GroupMap 
            members={visibleMembers} 
            myLocation={myLocation} 
            targetMemberId={targetMemberId} 
            setTargetMemberId={setTargetMemberId} 
          />
          {distanceText !== '' && (
            <View style={styles.distanceContainer}>
              <MaterialIcons name="straighten" size={16} color="#6C5CE7" />
              <Text style={styles.distanceText}>{distanceText}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <ActionButtons
          isSharing={isSharing}
          onToggleSharing={handleToggleSharing}
          onInviteMember={() => setInviteModal(true)}
          isUserOnline={isUserOnline}
          isLoading={sharingLoading || locationLoading}
        />

        {/* Members List */}
        <MembersList
          onlineMembers={onlineMembers}
          offlineMembers={offlineMembers}
          currentUserId={userId}
          onMemberPress={handleMemberPress}
          onNavigateToMember={handleNavigateToMember}
          calculateDistance={calculateMemberDistance}
          animatedValue={animatedValue}
        />
      </ScrollView>

      {/* Invite Modal */}
      <InviteModal
        visible={inviteModal}
        onClose={() => setInviteModal(false)}
        searchEmail={searchEmail}
        onSearchEmailChange={setSearchEmail}
        searchResult={searchResult}
        searchLoading={searchLoading}
        onSearch={handleSearch}
        onInvite={handleInvite}
      />

      {/* Confirmation Modal */}
      <CustomLogoutDialog
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={handleConfirm}
        title={confirmationType === 'delete' ? 'Xác nhận xóa nhóm' : 'Xác nhận rời nhóm'}
        message={confirmationType === 'delete'
          ? 'Nhóm sẽ bị xóa vĩnh viễn và không thể khôi phục.'
          : 'Bạn sẽ không còn là thành viên nhóm này.'}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
    </View>
  );
};

// Invite Modal Component
interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  searchEmail: string;
  onSearchEmailChange: (email: string) => void;
  searchResult: SearchResult | null;
  searchLoading: boolean;
  onSearch: () => void;
  onInvite: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({
  visible,
  onClose,
  searchEmail,
  onSearchEmailChange,
  searchResult,
  searchLoading,
  onSearch,
  onInvite
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Mời thành viên mới</Text>
          <TouchableOpacity onPress={onClose}>
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
            onChangeText={(text) => {
              onSearchEmailChange(text);
              // Clear search result when text changes
              if (searchResult) {
                onSearchEmailChange(text);
              }
            }}
            placeholder="user@example.com"
            style={styles.modalInput}
            onSubmitEditing={onSearch}
            keyboardType="email-address"
            autoCapitalize="none"
            onEndEditing={onSearch}
          />
          <TouchableOpacity onPress={onSearch} style={styles.searchButton}>
            <MaterialIcons name="search" size={20} color="#6C5CE7" />
          </TouchableOpacity>
        </View>

        {searchLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={appColors.primary} size="small" />
            <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
          </View>
        )}

        {searchResult && (
          <View style={styles.searchResultContainer}>
            <View style={styles.searchResultContent}>
              {searchResult.picUrl ? (
                <Image 
                  source={{ uri: searchResult.picUrl }} 
                  style={styles.searchResultAvatar} 
                />
              ) : (
                <View style={styles.searchResultAvatarPlaceholder}>
                  <MaterialIcons name="person" size={24} color={appColors.primary} />
                </View>
              )}
              <View style={styles.searchResultInfo}>
                <Text style={styles.searchResultName}>
                  {searchResult.username || searchResult.email}
                </Text>
                <Text style={styles.searchResultEmail}>{searchResult.email}</Text>
              </View>
            </View>
            
            {searchResult.isExisting ? (
              <View style={[styles.inviteButton, {backgroundColor: '#ddd'}]}>
                <Text style={[styles.inviteButtonText, {color: '#666'}]}>
                  Đã là thành viên nhóm
                </Text>
              </View>
            ) : searchResult.email !== null ? (
              <TouchableOpacity 
                style={[styles.inviteButton, {backgroundColor: appColors.primary}]} 
                onPress={onInvite}
              >
                <MaterialIcons name="send" size={16} color="#fff" />
                <Text style={styles.inviteButtonText}>Gửi lời mời</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.inviteButton, {backgroundColor: '#ddd'}]}>
                <Text style={[styles.inviteButtonText, {color: '#666'}]}>
                  Không thể mời chính mình
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  // Modal styles
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
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchResultAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E6FF',
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  inviteButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default GroupScreen; 