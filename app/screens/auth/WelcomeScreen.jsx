import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { globalStyles } from "../../constants/globalStyles";
import {
  ButtonComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from "../../components";
import { appColors } from "../../constants/appColors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WelcomeScreen = ({ navigation }) => {
  return (
    <ImageBackground
      style={globalStyles.container}
      source={require("../../../assets/images/splash-img.png")}
      imageStyle={{ flex: 1 }}
    >
      <View style={styles.centerContent}>
        <Image source={require("../../../assets/images/logo.png")} />
        <SpaceComponent height={20} />
        <TextComponent size={24} title text="Tiếp tục với tư cách" />
      </View>

      <SpaceComponent height={40} />
      <SectionComponent>
        <ButtonComponent
          text="NGƯỜI DÙNG"
          type="primary"
          onPress={() => navigation.navigate("Login")}
        />
      </SectionComponent>
      <SectionComponent>
        <ButtonComponent
          text="NHÀ TỔ CHỨC"
          type="primary"
          styles={{ backgroundColor: appColors.gray }}
          onPress={() => navigation.navigate("LoginOrganizer")}
        />
      </SectionComponent>
    </ImageBackground>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
});
