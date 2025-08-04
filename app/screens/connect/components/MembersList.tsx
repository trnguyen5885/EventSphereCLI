import React, { memo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MemberWithLocation } from '../types/GroupTypes';

interface MembersListProps {
  onlineMembers: MemberWithLocation[];
  offlineMembers: MemberWithLocation[];
  currentUserId: string;
  onMemberPress: (member: MemberWithLocation) => void;
  onNavigateToMember: (member: MemberWithLocation) => void;
  calculateDistance: (member: MemberWithLocation) => string;
  animatedValue: Animated.Value;
}

const MembersList: React.FC<MembersListProps> = ({
  onlineMembers,
  offlineMembers,
  currentUserId,
  onMemberPress,
  onNavigateToMember,
  calculateDistance,
  animatedValue
}) => {
  const renderOnlineMember = useCallback(({ item }: { item: MemberWithLocation }) => (
    <MemberItem
      member={item}
      isOnline={true}
      onPress={onMemberPress}
      onNavigate={onNavigateToMember}
      distanceText={calculateDistance(item)}
      animatedValue={animatedValue}
    />
  ), [onMemberPress, onNavigateToMember, calculateDistance, animatedValue]);

  const renderOfflineMember = useCallback(({ item }: { item: MemberWithLocation }) => (
    <MemberItem
      member={item}
      isOnline={false}
      onPress={onMemberPress}
      onNavigate={onNavigateToMember}
      distanceText=""
      animatedValue={animatedValue}
    />
  ), [onMemberPress, onNavigateToMember, animatedValue]);

  const keyExtractor = useCallback((item: MemberWithLocation) => item._id, []);

  const filteredOnlineMembers = onlineMembers.filter(m => m._id !== currentUserId);
  const filteredOfflineMembers = offlineMembers.filter(m => m._id !== currentUserId);

  return (
    <View style={styles.membersSection}>
      <Text style={styles.sectionTitle}>
        Thành viên ({onlineMembers.length + offlineMembers.length})
      </Text>
      
      {/* Online Members */}
      {filteredOnlineMembers.length > 0 && (
        <View style={styles.memberGroup}>
          <View style={styles.memberGroupHeader}>
            <MaterialIcons name="circle" size={12} color="#00B894" />
            <Text style={styles.memberGroupTitle}>
              Đang online ({filteredOnlineMembers.length})
            </Text>
          </View>
          <FlatList
            data={filteredOnlineMembers}
            keyExtractor={keyExtractor}
            renderItem={renderOnlineMember}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>
      )}

      {/* Offline Members */}
      {filteredOfflineMembers.length > 0 && (
        <View style={styles.memberGroup}>
          <View style={styles.memberGroupHeader}>
            <MaterialIcons name="circle" size={12} color="#DDD" />
            <Text style={styles.memberGroupTitle}>
              Offline ({filteredOfflineMembers.length})
            </Text>
          </View>
          <FlatList
            data={filteredOfflineMembers}
            keyExtractor={keyExtractor}
            renderItem={renderOfflineMember}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>
      )}
    </View>
  );
};

interface MemberItemProps {
  member: MemberWithLocation;
  isOnline: boolean;
  onPress: (member: MemberWithLocation) => void;
  onNavigate: (member: MemberWithLocation) => void;
  distanceText: string;
  animatedValue: Animated.Value;
}

const MemberItem = memo<MemberItemProps>(({ 
  member, 
  isOnline, 
  onPress, 
  onNavigate, 
  distanceText,
  animatedValue 
}) => {
  const handlePress = useCallback(() => {
    onPress(member);
  }, [onPress, member]);

  const handleNavigatePress = useCallback(() => {
    onNavigate(member);
  }, [onNavigate, member]);

  return (
    <Animated.View
      style={[
        styles.memberItem,
        !isOnline && styles.memberItemOffline,
        {
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
          opacity: animatedValue,
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.memberContent} 
        onPress={handlePress}
        accessibilityLabel={`Xem thông tin ${member.username}`}
        accessibilityRole="button"
      >
        <View style={styles.memberLeft}>
          <View style={styles.avatarContainer}>
            {member.picUrl ? (
              <Image 
                source={{ uri: member.picUrl }} 
                style={[
                  styles.avatarImg,
                  !isOnline && styles.avatarOffline
                ]} 
              />
            ) : (
              <View style={[
                styles.avatarPlaceholder,
                !isOnline && styles.avatarOffline
              ]}>
                <MaterialIcons 
                  name="person" 
                  size={24} 
                  color={isOnline ? "#6C5CE7" : "#999"} 
                />
              </View>
            )}
            {isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.memberInfo}>
            <Text style={[
              styles.memberName,
              !isOnline && styles.memberNameOffline
            ]}>
              {member.username}
            </Text>
            <Text style={styles.memberEmail}>{member.email}</Text>
            <Text style={[
              styles.memberStatus,
              !isOnline && styles.memberStatusOffline
            ]}>
              {isOnline ? '🌍 Đang chia sẻ vị trí' : '📍 Chưa chia sẻ vị trí'}
            </Text>
            {isOnline && distanceText && (
              <Text style={styles.distanceText}>
                {distanceText}
              </Text>
            )}
          </View>
        </View>
        
        {isOnline && (
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={handleNavigatePress}
            accessibilityLabel={`Điều hướng đến ${member.username}`}
            accessibilityRole="button"
          >
            <MaterialIcons name="directions" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

MemberItem.displayName = 'MemberItem';

const styles = StyleSheet.create({
  membersSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  memberGroup: {
    marginBottom: 20,
  },
  memberGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  memberItem: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  memberItemOffline: {
    backgroundColor: '#F5F5F5',
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8E6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOffline: {
    opacity: 0.6,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#00B894',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  memberNameOffline: {
    color: '#999',
  },
  memberEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  memberStatus: {
    fontSize: 12,
    color: '#00B894',
    fontWeight: '500',
  },
  memberStatusOffline: {
    fontSize: 12,
    color: '#999',
  },
  distanceText: {
    color: '#6C5CE7',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  navButton: {
    backgroundColor: '#6C5CE7',
    padding: 10,
    borderRadius: 20,
  },
});

export default memo(MembersList); 