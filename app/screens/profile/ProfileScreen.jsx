import { StyleSheet, Text, View, Image, Platform, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ButtonComponent, RowComponent, TextComponent } from '../../components'
import { ScrollView, TouchableOpacity } from 'react-native'
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AxiosInstance } from '../../services';
import { useSelector, useDispatch } from 'react-redux';
import { appColors } from '../../constants/appColors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { logout } from '../../redux/slices/authSlice';
import CustomLogoutDialog from '../../components/CustomLogoutDialog'; // Import component dialog
import { ToastAndroid, Alert } from 'react-native'
const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth.userId);

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [email, setEmail] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false); // State cho dialog

  const getUserInfo = async () => {
    try {
      if (userId) {
        const response = await AxiosInstance().get(`users/getUser/${userId}`);
        setName(response.data.username);
        setImage(response.data.picUrl);
        setEmail(response.data.email);
      }
    } catch (error) {
      console.log('Lỗi khi lấy thông tin người dùng:', error);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, [userId]);

  // Hàm hiển thị dialog đăng xuất
  const showLogoutConfirmation = () => {
    setShowLogoutDialog(true);
  };

  // Hàm đóng dialog
  const hideLogoutDialog = () => {
    setShowLogoutDialog(false);
  };

  const handleSignout = async () => {
    setIsLoading(true);
    try {
      // Xoá trong AsyncStorage
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("savedCredentials");
      await AsyncStorage.removeItem("rememberMe");

      // Xoá trong Redux
      dispatch(logout());

      // Đóng dialog
      setShowLogoutDialog(false);

      // Reset về màn Login
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.log("Sign out failed:", error);
      // Có thể hiện thị thông báo lỗi ở đây
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Gọi lại API để cập nhật thông tin
      await getUserInfo();

      // Thêm delay nhỏ để người dùng thấy hiệu ứng loading
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    } catch (error) {
      console.log('Lỗi khi refresh:', error);
      setRefreshing(false);
    }
  }, [userId]);

  const showLanguageToast = () => {
  if (Platform.OS === 'android') {
    ToastAndroid.show('Ngôn ngữ khác đang được phát triển', ToastAndroid.SHORT);
  } else {
    Alert.alert('Thông báo', 'Ngôn ngữ khác đang được phát triển');
  }
};

  return (
    <View style={styles.container}>
      {/* Header với background pattern */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../../assets/images/bannerprofile.png')}
          style={styles.headerBackground}
          resizeMode="cover"
        />
      </View>

      {/* Avatar container - nằm giữa header và content */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image
            style={styles.profileAVT}
            source={{
              uri: image ? image : 'https://avatar.iran.liara.run/public'
            }}
          />
        </View>

        {/* Tên người dùng nằm dưới avatar */}
        <View>
          <TextComponent
            text={name || 'Người dùng'}
            styles={styles.userName}
          />
        </View>
      </View>

      {/* Nội dung chính */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[appColors.primary]} // Android
            tintColor={appColors.primary} // iOS
            title="Đang cập nhật..." // iOS
            titleColor={appColors.primary} // iOS
          />
        }
      >

        {/* Phần Cài đặt tài khoản */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={20} color="#333" />
            <TextComponent text="Cài đặt tài khoản" styles={styles.sectionTitle} />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ProfileEdit')}
          >
            <View style={styles.menuItemContent}>
              <TextComponent text="Thông tin tài khoản" styles={styles.menuText} />
              <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('SetupPIN')}
          >
            <View style={styles.menuItemContent}>
              <TextComponent text="Thiết lập mã PIN" styles={styles.menuText} />
              <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Phần Cài đặt ứng dụng */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="settings" size={20} color="#333" />
            <TextComponent text="Cài đặt ứng dụng" styles={styles.sectionTitle} />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={showLanguageToast}
          >
            <View style={styles.menuItemContent}>
              <TextComponent text="Thay đổi ngôn ngữ" styles={styles.menuText} />
              <View style={styles.languageContainer}>
                <Image
                  source={{ uri: 'https://flagcdn.com/w20/vn.png' }}
                  style={styles.flagIcon}
                />
                <TextComponent text="Vie" styles={styles.languageText} />
                <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Menu khác */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Support')}
          >
            <View style={styles.menuItemContent}>
              <MaterialIcons name="help-outline" size={20} color="#333" />
              <TextComponent text="Trung tâm trợ giúp" styles={styles.menuText} />
              <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={showLogoutConfirmation}
            disabled={isLoading}
          >
            <View style={styles.menuItemContent}>
              <MaterialIcons name="logout" size={20} color="black" />
              <TextComponent
                text={isLoading ? "Đang đăng xuất..." : "Đăng xuất"}
                styles={styles.menuText}
              />
              {!isLoading && <MaterialCommunityIcons name="chevron-right" size={20} color="#E53E3E" />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Version info */}
        <View style={styles.versionContainer}>
          <TextComponent text="Phiên bản 1.0.1(21625)" styles={styles.versionText} />
        </View>

      </ScrollView>

      {/* Custom Logout Dialog */}
      <CustomLogoutDialog
        visible={showLogoutDialog}
        onClose={hideLogoutDialog}
        onConfirm={handleSignout}
        isLoading={isLoading}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header styles - chỉ background
  headerContainer: {
    backgroundColor: appColors.primary, // Màu xanh lá như trong ảnh
    height: 120, // Chiều cao cố định cho header
    
    position: 'relative',
  },

  headerBackground: {
    position: 'absolute',
    
    width: '100%',
    height: '100%',
    zIndex: 1, // đẩy ảnh nền xuống dưới các thành phần khác
  },



  // Avatar section - nằm giữa header và content
  avatarSection: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 10, // Đẩy avatar lên để nằm một nửa trên header
    zIndex: 1,
  },

  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
    // Shadow cho avatar
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  profileAVT: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF', // Đảm bảo có background trắng
  },

  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },

  // Content styles
  contentContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },

  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 20,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },

  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },

  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  menuText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },

  // Logout specific styles
  logoutItem: {
    borderBottomWidth: 0,
  },

  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  flagIcon: {
    width: 20,
    height: 15,
    marginRight: 8,
  },

  languageText: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },

  versionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  versionText: {
    fontSize: 12,
    color: '#999',
  },
})

export default ProfileScreen