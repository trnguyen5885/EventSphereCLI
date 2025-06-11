import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ButtonComponent, TextComponent } from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosInstance } from '../../services';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

const ProfileHeader = ({ onPress }) => {
  const userId = useSelector(state => state.auth.userId);
  
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [email, setEmail] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [userLevel, setUserLevel] = useState('Bronze'); // Bronze, Silver, Gold, Platinum

  useFocusEffect(
    useCallback(() => {
      const getUserInfo = async () => {
        try {
          if (userId) {
            const response = await AxiosInstance().get(`users/getUser/${userId}`);
            setName(response.data.username);
            setImage(response.data.picUrl);
            setEmail(response.data.email);
            
            // Tính toán thành viên từ khi nào (mock data)
            const joinDate = new Date(response.data.createdAt || '2024-01-01');
            const currentDate = new Date();
            const monthsDiff = Math.floor((currentDate - joinDate) / (1000 * 60 * 60 * 24 * 30));
            setMemberSince(`${monthsDiff} tháng`);
            
            // Xác định level dựa trên số sự kiện đã tham gia (mock logic)
            const eventsCount = response.data.eventsAttended || 0;
            if (eventsCount >= 50) setUserLevel('Platinum');
            else if (eventsCount >= 20) setUserLevel('Gold');
            else if (eventsCount >= 10) setUserLevel('Silver');
            else setUserLevel('Bronze');
          }
        } catch (error) {
          console.log('Lỗi khi lấy thông tin người dùng:', error);
        }
      };

      getUserInfo();
    }, [userId])
  );

  const getLevelColor = (level) => {
    switch (level) {
      case 'Platinum': return '#E5E4E2';
      case 'Gold': return '#FFD700';
      case 'Silver': return '#C0C0C0';
      default: return '#CD7F32';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'Platinum': return 'diamond-stone';
      case 'Gold': return 'crown';
      case 'Silver': return 'medal';
      default: return 'shield-account';
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar với badge level */}
      <View style={styles.avatarContainer}>
        <View style={styles.profileAVTContainer}>
          <Image 
            style={styles.profileAVT} 
            source={{ 
              uri: image ? image : 'https://avatar.iran.liara.run/public' 
            }} 
          />
          {/* Badge level */}
          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(userLevel) }]}>
            <MaterialCommunityIcons 
              name={getLevelIcon(userLevel)} 
              size={16} 
              color="white" 
            />
          </View>
        </View>
      </View>

      {/* Thông tin cơ bản */}
      <View style={styles.userInfoContainer}>
        <TextComponent
          text={name || 'Người dùng'}
          styles={styles.userName}
        />
        
        <View style={styles.levelContainer}>
          <MaterialCommunityIcons 
            name={getLevelIcon(userLevel)} 
            size={16} 
            color={getLevelColor(userLevel)} 
          />
          <TextComponent
            text={`Thành viên ${userLevel}`}
            styles={[styles.userLevel, { color: getLevelColor(userLevel) }]}
          />
        </View>

        {email ? (
          <View style={styles.emailContainer}>
            <MaterialIcons name="email" size={14} color="#666666" />
            <TextComponent
              text={email}
              styles={styles.userEmail}
            />
          </View>
        ) : null}

        <View style={styles.memberSinceContainer}>
          <MaterialIcons name="access-time" size={14} color="#666666" />
          <TextComponent
            text={`Thành viên từ ${memberSince} trước`}
            styles={styles.memberSinceText}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        
        <TouchableOpacity 
          style={styles.quickActionBtn}
          onPress={() => onPress && onPress('Wallet')}
        >
          <MaterialIcons name="account-balance-wallet" size={20} color="#5669FF" />
          <TextComponent text="Ví của tôi" styles={styles.quickActionText} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionBtn}
          onPress={() => onPress && onPress('History')}
        >
          <MaterialIcons name="history" size={20} color="#5669FF" />
          <TextComponent text="Lịch sử" styles={styles.quickActionText} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 20
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15
  },
  profileAVTContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileAVT: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#F0F2FF'
  },
  levelBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white'
  },
  
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  userLevel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6
  },
  memberSinceContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  memberSinceText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6
  },
  
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 10
  },
  quickActionBtn: {
    alignItems: 'center',
    flex: 1
  },
  quickActionText: {
    fontSize: 12,
    color: '#5669FF',
    marginTop: 6,
    textAlign: 'center'
  }
});