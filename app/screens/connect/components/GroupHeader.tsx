import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../../../constants/appColors';
import { GroupStats } from '../types/GroupTypes';

interface GroupHeaderProps {
  groupName: string;
  isOwner: boolean;
  stats: GroupStats;
  onBack: () => void;
  onDeleteGroup: () => void;
  onLeaveGroup: () => void;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  groupName,
  isOwner,
  stats,
  onBack,
  onDeleteGroup,
  onLeaveGroup
}) => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6C5CE7" />
      
      <LinearGradient
        colors={[appColors.primary, appColors.primary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={onBack} 
              style={styles.backButton}
              accessibilityLabel="Quay lại"
              accessibilityRole="button"
            >
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <MaterialIcons name="event" size={24} color="#fff" />
            <Text style={styles.headerTitle} numberOfLines={1}>
              {groupName || 'Nhóm sự kiện'}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={isOwner ? onDeleteGroup : onLeaveGroup}
            style={styles.optionsButton}
            accessibilityLabel={isOwner ? "Xóa nhóm" : "Rời nhóm"}
            accessibilityRole="button"
          >
            <MaterialIcons 
              name={isOwner ? "delete" : "logout"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatsCard
            icon="people"
            iconColor="#6C5CE7"
            number={stats.totalMembers}
            label="Thành viên"
          />
          <StatsCard
            icon="location-on"
            iconColor="#00B894"
            number={stats.onlineMembers}
            label="Đang online"
          />
        </View>
      </LinearGradient>
    </>
  );
};

interface StatsCardProps {
  icon: string;
  iconColor: string;
  number: number;
  label: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, iconColor, number, label }) => (
  <View style={styles.statCard}>
    <MaterialIcons name={icon as any} size={20} color={iconColor} />
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  backButton: {
    marginRight: 4,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  optionsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default GroupHeader; 