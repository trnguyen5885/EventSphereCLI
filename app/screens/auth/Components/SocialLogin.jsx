import { View, Text } from "react-native";
import React from "react";
import {
  ButtonComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from "../../../components";
import { appColors } from "../../../constants/appColors";
import { fontFamilies } from "../../../constants/fontFamilies";
import { Facebook, Google } from "iconsax-react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { socialLogin } from "../../../services/authService";
import { useDispatch } from "react-redux";
import { loginSuccess, setRememberMe, setSavedCredentials } from "../../../redux/slices/authSlice";

GoogleSignin.configure({
  webClientId: '518691740711-hpgf2l7sj9ec9f0uh8695ov0lnfoscka.apps.googleusercontent.com',
});

const SocialLogin = ({ navigation }) => {
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();
      console.log("Google User Info:", userInfo);
      
      if (userInfo.data.idToken) {
        const res = await socialLogin(userInfo.data.idToken);
        const { id, token, refreshToken, role, ...userData } = res.data;

        dispatch(
          loginSuccess({
            userId: id,
            userData,
            role,
          }),
        );

        // You might want to add remember me logic here for social logins as well
        // For now, let's assume no remember me for social login or handle it differently
        dispatch(setRememberMe(false));
        dispatch(setSavedCredentials(null));

        navigation.navigate('Drawer');

      }
      
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log("User cancelled Google Sign-In");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        console.log("Google Sign-In is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        console.log("Google Play Services not available or outdated");
      } else {
        // some other error happened
        console.log("Google Sign-In Error:", error);
      }
    }
  };

  return (
    <View>
      <SectionComponent>
        <TextComponent
          styles={{ textAlign: "center" }}
          text="OR"
          color={appColors.gray4}
          size={16}
          font={fontFamilies.medium}
        />
        <SpaceComponent height={16} />
        <ButtonComponent
          type="primary"
          color={appColors.white}
          textColor={appColors.text}
          text="Login with Google"
          textFont={fontFamilies.regular}
          icon={<Google />}
          iconFlex="left"
          onPress={handleGoogleLogin}
        />
        <ButtonComponent
          type="primary"
          color={appColors.white}
          textColor={appColors.text}
          text="Login with Facebook"
          textFont={fontFamilies.regular}
          icon={<Facebook />}
          iconFlex="left"
        />
      </SectionComponent>
    </View>
  );
};

export default SocialLogin;