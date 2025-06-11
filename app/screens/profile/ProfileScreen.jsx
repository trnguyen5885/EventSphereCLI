import { StyleSheet, Text, View, Image, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ButtonComponent, RowComponent, TextComponent } from '../../components'
import { ScrollView, TouchableOpacity } from 'react-native'
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ProfileHeader from './ProfileHeader'
import { AxiosInstance } from '../../services';

const getRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const ProfileScreen = ({navigation}) => {
  const interests = ["Nhạc sống", "Thể thao", "Hội thảo", "Nghệ thuật", "Ẩm thực", "Công nghệ", "Du lịch", "Giải trí"];
  
  // Mock data - trong thực tế sẽ lấy từ API
  const [userStats, setUserStats] = useState({
    eventsAttended: 12,
    upcomingEvents: 3,
    totalSpent: 2500000,
    favoriteEvents: 8
  });

  const [recentTickets, setRecentTickets] = useState([
    {
      id: 1,
      eventName: "Concert Sơn Tùng M-TP",
      date: "15/06/2025",
      status: "upcoming",
      image: "https://via.placeholder.com/80x80"
    },
    {
      id: 2,
      eventName: "Hội thảo Marketing 2025",
      date: "10/06/2025", 
      status: "completed",
      image: "https://via.placeholder.com/80x80"
    }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        {/* Header với avatar và tên */}
        <ProfileHeader onPress={()=>navigation.navigate('FriendScreen')}/>
        
        {/* Nút chỉnh sửa */}
        <View style={styles.editBtnContainer}>
          <ButtonComponent
            text='Chỉnh sửa'
            textStyles={{ fontSize: 16, color: '#5669FF', margin: 0 }}
            icon={<MaterialCommunityIcons name="square-edit-outline" size={20} color="#5669FF" />}
            iconFlex='left'
            type='primary'
            styles={styles.editBtn}
            onPress={() => navigation.navigate("ProfileEdit")}
          />
        </View>

        {/* Thống kê người dùng */}
        <View style={styles.statsContainer}>
          <TextComponent
            text='Thống kê của tôi'
            styles={styles.sectionTitle}
          />
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MaterialIcons name="event-available" size={24} color="#4CAF50" />
              <TextComponent text={userStats.eventsAttended.toString()} styles={styles.statNumber} />
              <TextComponent text="Sự kiện đã tham gia" styles={styles.statLabel} />
            </View>
            
            <View style={styles.statItem}>
              <MaterialIcons name="event-note" size={24} color="#FF9800" />
              <TextComponent text={userStats.upcomingEvents.toString()} styles={styles.statNumber} />
              <TextComponent text="Sự kiện sắp tới" styles={styles.statLabel} />
            </View>
            
            <View style={styles.statItem}>
              <FontAwesome5 name="money-bill-wave" size={20} color="#E91E63" />
              <TextComponent text={formatCurrency(userStats.totalSpent)} styles={styles.statMoney} />
              <TextComponent text="Tổng chi tiêu" styles={styles.statLabel} />
            </View>
            
            <View style={styles.statItem}>
              <MaterialIcons name="favorite" size={24} color="#F44336" />
              <TextComponent text={userStats.favoriteEvents.toString()} styles={styles.statNumber} />
              <TextComponent text="Sự kiện yêu thích" styles={styles.statLabel} />
            </View>
          </View>
        </View>

        {/* Vé gần đây */}
        <View style={styles.recentTicketsContainer}>
          <View style={styles.sectionHeader}>
            <TextComponent
              text='Vé của tôi'
              styles={styles.sectionTitle}
            />
            <TouchableOpacity onPress={() => navigation.navigate('MyTickets')}>
              <TextComponent
                text='Xem tất cả'
                styles={styles.viewAllText}
              />
            </TouchableOpacity>
          </View>
          
          {recentTickets.map((ticket) => (
            <View key={ticket.id} style={styles.ticketItem}>
              <Image source={{ uri: ticket.image }} style={styles.ticketImage} />
              <View style={styles.ticketInfo}>
                <TextComponent text={ticket.eventName} styles={styles.ticketEventName} />
                <TextComponent text={ticket.date} styles={styles.ticketDate} />
              </View>
              <View style={[
                styles.ticketStatus,
                { backgroundColor: ticket.status === 'upcoming' ? '#E8F5E8' : '#F5F5F5' }
              ]}>
                <TextComponent 
                  text={ticket.status === 'upcoming' ? 'Sắp diễn ra' : 'Đã tham gia'} 
                  styles={[
                    styles.ticketStatusText,
                    { color: ticket.status === 'upcoming' ? '#4CAF50' : '#757575' }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Sở thích */}
        <View style={styles.interestSection}>
          <View style={styles.interestContainer}>
            <TextComponent
              text='Sở thích sự kiện'
              styles={styles.sectionTitle}
            />
            <TouchableOpacity 
              style={styles.changeBtn}
              onPress={() => navigation.navigate('InterestSettings')}
            >
              <TextComponent text="Thay đổi" styles={styles.changeBtnText} />
              <MaterialCommunityIcons name="chevron-right" size={16} color="#5669FF" />
            </TouchableOpacity>
          </View>

          <View style={styles.interestBtnContainer}>
            {interests.map((item, index) => (
              <View
                key={index}
                style={[styles.interestBtn, { backgroundColor: getRandomColor() }]}
              >
                <TextComponent
                  text={item}
                  styles={styles.interestTitle}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Menu hành động */}
        <View style={styles.menuContainer}>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Notification')}
          >
            <MaterialIcons name="notifications" size={24} color="#5669FF" />
            <TextComponent text="Thông báo" styles={styles.menuText} />
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Support')}
          >
            <MaterialIcons name="help-outline" size={24} color="#5669FF" />
            <TextComponent text="Hỗ trợ khách hàng" styles={styles.menuText} />
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "ios" ? 66 : 23,
  },
  editBtnContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20
  },
  editBtn: {
    width: 180,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#5669FF',
    borderRadius: 22,
    backgroundColor: 'white',
    paddingVertical: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  viewAllText: {
    fontSize: 14,
    color: '#5669FF',
    fontWeight: '500'
  },
  
  // Styles cho phần thống kê
  statsContainer: {
    marginBottom: 25
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 8
  },
  statMoney: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 8,
    textAlign: 'center'
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4
  },
  
  // Styles cho vé gần đây
  recentTicketsContainer: {
    marginBottom: 25
  },
  ticketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10
  },
  ticketImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12
  },
  ticketInfo: {
    flex: 1
  },
  ticketEventName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A'
  },
  ticketDate: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2
  },
  ticketStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  ticketStatusText: {
    fontSize: 10,
    fontWeight: '500'
  },
  
  // Styles cho sở thích
  interestSection: {
    marginBottom: 25
  },
  interestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  changeBtn: {
    flexDirection: 'row',
    backgroundColor: '#F0F2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  changeBtnText: {
    fontSize: 12,
    color: '#5669FF',
    marginRight: 4
  },
  interestBtnContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  interestBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20
  },
  interestTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500'
  },
  
  // Styles cho menu
  menuContainer: {
    marginTop: 10
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 15
  }
})

export default ProfileScreen