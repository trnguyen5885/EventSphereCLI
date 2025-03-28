import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { globalStyles } from "../../constants/globalStyles";
import { SpaceComponent } from "../../components";
import { appColors } from "../../constants/appColors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WelcomeScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Onbroading"); // Sau 3 giây, chuyển sang màn hình đăng nhập
    }, 3000);
  }, [navigation]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userId = await AsyncStorage.getItem("userId");

      setTimeout(() => {
        if (userId) {
          navigation.replace("Home");
        }
      }, 3000);
    };

    checkLoginStatus();
  }, [navigation]);
  return (
    <ImageBackground
      style={globalStyles.container}
      source={require("../../../assets/images/splash-img.png")}
      imageStyle={{ flex: 1 }}>
      <Image
        source={require("../../../assets/images/logo.png")}
        style={{
          width: Dimensions.get("window").width * 0.7,
          resizeMode: "contain",
        }}
      />
      <SpaceComponent height={20} />
      <ActivityIndicator color={appColors.gray} size={22} />
    </ImageBackground>
  );
};

export default WelcomeScreen;
