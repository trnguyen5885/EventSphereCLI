import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Image,
  FlatList,
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
      title: "My Profile",
      icon: <User size={size} color={color} />,
    },
    {
      key: "Message",
      title: "Message",
      icon: <Message2 size={size} color={color} />,
    },
    {
      key: "Calendar",
      title: "Calendar",
      icon: <Calendar size={size} color={color} />,
    },
    {
      key: "Bookmark",
      title: "Bookmark",
      icon: <Bookmark2 size={size} color={color} />,
    },
    {
      key: "ContactUs",
      title: "Contact Us",
      icon: <Sms size={size} color={color} />,
    },
    {
      key: "Settings",
      title: "Settings",
      icon: <Setting2 size={size} color={color} />,
    },
    {
      key: "HelpAndFAQs",
      title: "Help & FAQs",
      icon: <MessageQuestion size={size} color={color} />,
    },
    {
      key: "SignOut",
      title: "Sign Out",
      icon: <Logout size={size} color={color} />,
    },
  ];

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
        style={{ flex: 1, marginVertical: 20 }}
        renderItem={({ item, index }) => (
          <RowComponent
            styles={[localStyles.listItem]}
            onPress={
              item.key === "SignOut"
                ? () => handleSignout()
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
      <RowComponent justify="flex-start">
        <TouchableOpacity
          style={[
            globalStyles.button,
            { backgroundColor: "#00F8FF33", height: "auto" },
          ]}>
          <MaterialCommunityIcons name="crown" size={22} color={"#00F8FF"} />
          <SpaceComponent width={8} />
          <TextComponent color="#00F8FF" text="Upgrade Pro" />
        </TouchableOpacity>
      </RowComponent>
    </View>
  );
};

export default DrawerCustom;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingVertical: Platform.OS === "android" ? StatusBar.currentHeight : 48,
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
});
