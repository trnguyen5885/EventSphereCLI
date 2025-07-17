import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { appColors } from "../../../constants/appColors";
import { fontFamilies } from "../../../constants/fontFamilies";
import { Google } from "iconsax-react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { socialLogin } from "../../../services/authService";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../redux/slices/authSlice";

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
        const { id, token, refreshToken, role, tags,...userData } = res.data;
        console.log("Data: ", JSON.stringify(res.data));
        // Lưu thông tin đăng nhập vào Redux
        dispatch(
          loginSuccess({
            userId: id,
            userData: {
              id,
              token,
              refreshToken,
              role,
              ...userData
            },
          }),
        );

        // Điều hướng theo role
        if (role === 3) {
          if (Array.isArray(tags) && tags.length === 0) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'FavoriteTag' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Drawer' }],
            });
          }
        } else if (role === 2) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'OrganizerTabs' }],
          });
        } else {
          navigation.navigate('Drawer'); // Mặc định
        }
      }
      
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled Google Sign-In");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Google Sign-In is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Google Play Services not available or outdated");
      } else {
        console.log("Google Sign-In Error:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* OR Text */}
      <Text style={styles.orText}>HOẶC</Text>
      
      {/* Spacing */}
      <View style={styles.spacing} />
      
      {/* Google Login Button */}
      <TouchableOpacity 
        style={styles.googleButton} 
        onPress={handleGoogleLogin}
        activeOpacity={0.8}
      >
        <Google size={20} color={appColors.text} />
        <Text style={styles.buttonText}>Login with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 15,
    alignItems: 'center',
  },
  orText: {
    textAlign: 'center',
    color: appColors.gray4,
    fontSize: 16,
    fontFamily: fontFamilies.medium,
  },
  spacing: {
    height: 16,
  },
  googleButton: {
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
    flexDirection: 'row',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: appColors.gray2 || '#E5E5E5',
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
    color: appColors.text,
    fontFamily: fontFamilies.regular,
  },
});

export default SocialLogin;