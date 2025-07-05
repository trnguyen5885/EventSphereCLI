import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Platform
} from 'react-native';
import { TextComponent } from '../../components';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { appColors } from '../../constants/appColors';
import { ToastAndroid, Alert } from 'react-native';
import { policies } from '../../constants/policies';


const SupportScreen = ({ navigation }) => {

  // Danh sách các mục hỗ trợ
  const supportItems = [
    { id: 1, title: 'Câu hỏi thường gặp', icon: 'help-outline' },
    { id: 2, title: 'Liên hệ', icon: 'contact-support' },
    { id: 3, title: 'Quy chế hoạt động', icon: 'description' },
    { id: 4, title: 'Chính sách bảo mật thông tin', icon: 'security' },
    { id: 5, title: 'Cơ chế giải quyết tranh chấp/khiếu nại', icon: 'gavel' },
    { id: 6, title: 'Chính sách bảo mật thanh toán', icon: 'payment' },
    { id: 7, title: 'Chính sách đổi trả và kiểm hàng', icon: 'swap-horiz' },
    { id: 8, title: 'Điều kiện vận chuyển và giao nhận', icon: 'local-shipping' },
    { id: 9, title: 'Điều khoản sử dụng cho khách hàng', icon: 'person' },
    { id: 10, title: 'Điều khoản sử dụng cho ban tổ chức', icon: 'business' },
    { id: 11, title: 'Phương thức thanh toán', icon: 'credit-card' }
  ];

  // Xử lý nhấn vào mục hỗ trợ
  const handleSupportItemPress = (item) => {
    if (item.title === 'Câu hỏi thường gặp') {
      navigation.navigate('FAQScreen');
      return;
    }

    if (item.title === 'Liên hệ') {
      navigation.navigate('ContactScreen');
      return;
    }

    const content = policies[item.title];
    if (content) {
      navigation.navigate('PolicyViewer', {
        title: item.title,
        content,
      });
    } else {
      Platform.OS === 'android'
        ? ToastAndroid.show(`Tính năng ${item.title} đang được phát triển`, ToastAndroid.SHORT)
        : Alert.alert('Thông báo', `Tính năng ${item.title} đang được phát triển`);
    }
  };



  // Xử lý gọi hotline
  const handleCallHotline = () => {
    Linking.openURL('tel:19001234');
  };

  // Xử lý gửi email
  const handleSendEmail = () => {
    Linking.openURL('mailto:support@ticketbox.vn');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Trung tâm trợ giúp</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeCard}>
            <TextComponent
              text="EventSphere giúp bạn mua và bán vé một cách dễ dàng và an toàn. Dưới đây là những thông tin hữu ích về nền tảng của chúng tôi"
              styles={styles.welcomeText}
            />
          </View>

          {/* Mascot placeholder - bạn có thể thêm hình ảnh mascot ở đây */}
          <View style={styles.mascotContainer}>
            <View style={styles.mascotPlaceholder}>
              <Image
                source={require('../../../assets/images/icon.png')}
                style={{ width: "75%", height: "75%" }}
              />
            </View>
          </View>
        </View>

        {/* Support Items */}
        <View style={styles.supportList}>
          {supportItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.supportItem,
                index === supportItems.length - 1 && styles.lastItem
              ]}
              onPress={() => handleSupportItemPress(item)}
            >
              <View style={styles.supportItemContent}>
                <MaterialIcons
                  name={item.icon}
                  size={20}
                  color="#666"
                  style={styles.supportIcon}
                />
                <TextComponent
                  text={item.title}
                  styles={styles.supportItemText}
                />
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color="#999"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Buttons */}
        <View style={styles.contactSection}>
          <TouchableOpacity
            style={styles.hotlineButton}
            onPress={handleCallHotline}
          >
            <MaterialIcons name="phone" size={20} color="white" />
            <Text style={styles.hotlineText}>Gọi hotline 1900.1234</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emailButton}
            onPress={handleSendEmail}
          >
            <MaterialIcons name="email" size={20} color={appColors.primary} />
            <Text style={styles.emailText}>Email đến support@eventsphere.vn</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header styles
  header: {
    backgroundColor: appColors.primary,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 40, // Để cân bằng với back button
  },

  // Content styles
  content: {
    flex: 1,
  },

  welcomeSection: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  welcomeCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 10,
  },

  welcomeText: {
    fontSize: 14,
    lineHeight: 20,
    color: appColors.primary,
  },

  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  mascotPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },

  mascotText: {
    fontSize: 30,
  },

  // Support list styles
  supportList: {
    backgroundColor: 'white',
    marginTop: 0,
  },

  supportItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  supportItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  supportIcon: {
    marginRight: 12,
  },

  supportItemText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },

  // Contact section styles
  contactSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },

  hotlineButton: {
    backgroundColor: appColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },

  hotlineText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  emailButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: appColors.primary,
  },

  emailText: {
    color: appColors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  bottomSpacing: {
    height: 30,
  },
});

export default SupportScreen;