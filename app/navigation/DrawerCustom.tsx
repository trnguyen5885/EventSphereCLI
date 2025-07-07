import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Image,
  FlatList,
  Alert, // Thêm Alert import
} from "react-native";
import React, { useState } from "react";
import {
  ButtonComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from "../components";
import { globalStyles } from "../constants/globalStyles";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { appColors } from "../constants/appColors";
import {
  Bookmark2,
  Calendar,
  Logout,
  Message2,
  MessageQuestion,
  Setting2,
  Sms,
  User,
} from "iconsax-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingModal from "../modals/LoadingModal";
import { CommonActions } from "@react-navigation/native";
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const DrawerCustom = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const size = 20;
  const color = appColors.gray;
  const profileMenu = [
    {
      key: "MyProfile",
      title: "Trang cá nhân",
      icon: <User size={size} color={color} />,
    },
    {
      key: "Message",
      title: "Thông báo",
      icon: <Message2 size={size} color={color} />,
    },
    {
      key: "ContactUs",
      title: "Liên hệ chúng tôi",
      icon: <Sms size={size} color={color} />,
    },
    {
      key: "Settings",
      title: "Cài đặt",
      icon: <Setting2 size={size} color={color} />,
    },
    {
      key: "HelpAndFAQs",
      title: "Trợ giúp & Câu hỏi",
      icon: <MessageQuestion size={size} color={color} />,
    },
    {
      key: "SignOut",
      title: "Đăng xuất",
      icon: <Logout size={size} color={color} />,
    },
  ];

  // Hàm hiển thị thông báo xác nhận đăng xuất
  const showLogoutConfirmation = () => {
    Alert.alert(
      "Đăng xuất", // Tiêu đề
      "Bạn có muốn đăng xuất không?", // Nội dung
      [
        {
          text: "Hủy",
          style: "cancel", // Style cho nút hủy
        },
        {
          text: "Đăng xuất",
          style: "destructive", // Style cho nút đăng xuất (màu đỏ)
          onPress: handleSignout, // Gọi hàm đăng xuất khi nhấn OK
        },
      ],
      { cancelable: false } // Cho phép hủy bằng cách nhấn ra ngoài
    );
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

      // Reset về màn Login
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.log("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingModal visible />;
  }

  return (
    <View style={[localStyles.container]}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={profileMenu}
        style={localStyles.menuList}
        renderItem={({ item, index }) => (
          <RowComponent
            styles={[localStyles.listItem]}
            onPress={
              item.key === "SignOut"
                ? showLogoutConfirmation
                : item.key === "Message"
                  ? () => {
                    navigation.navigate('Notification');
                    navigation.closeDrawer();
                  }
                  : item.key === "MyProfile"
                    ? () => {
                      navigation.navigate('ProfileScreen');
                      navigation.closeDrawer();
                    }
                    : item.key === "Settings"
                      ? () => {
                        navigation.navigate('ProfileEdit');
                        navigation.closeDrawer();
                      }
                      : item.key === "ContactUs"
                        ? () => {
                          navigation.navigate('ContactScreen');
                          navigation.closeDrawer();
                        }
                        : item.key === "HelpAndFAQs"
                          ? () => {
                            navigation.navigate('FAQScreen');
                            navigation.closeDrawer();
                          }
                          : () => {
                            console.log(item.key);
                            navigation.closeDrawer();
                          }
            }>
            {item.icon}
            <TextComponent
              text={item.title}
              styles={localStyles.listItemText}
            />
          </RowComponent>
        )}
      />
      <TouchableOpacity
        style={[
          globalStyles.button,
          localStyles.upgradeButton,
        ]}>
        <MaterialCommunityIcons name="crown" size={22} color={"#00F8FF"} />
        <SpaceComponent width={8} />
        <TextComponent color="#00F8FF" text="Upgrade Pro" />
      </TouchableOpacity>
    </View>
  );
};

export default DrawerCustom;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 48,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },

  menuList: {
    flex: 1,
    marginVertical: 20,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 100,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  listItem: {
    paddingVertical: 12,
    justifyContent: "flex-start",
  },

  listItemText: {
    paddingLeft: 12,
  },

  upgradeButton: {
    backgroundColor: "#00F8FF33",
    height: "auto",
    alignSelf: 'flex-start',
    marginTop: 10,
  },
});