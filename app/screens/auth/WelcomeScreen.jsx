import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { globalStyles } from "../../constants/globalStyles";
import {
  ButtonComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from "../../components";
import { appColors } from "../../constants/appColors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fontFamilies } from "../../constants/fontFamilies";

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  // Chỉ sử dụng 2 animation đơn giản
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Animation đơn giản: fade in và slide up nhẹ
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      style={globalStyles.container}
      source={require("../../../assets/images/splash-img.png")}
      imageStyle={styles.backgroundImage}
    >
      {/* Overlay gradient */}
      <View style={styles.overlay} />
      
      {/* Header Section */}
      <Animated.View 
        style={[
          styles.headerSection,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require("../../../assets/images/logo.png")} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }}
        >
          <TextComponent 
            size={28} 
            title 
            text="Chào mừng bạn!" 
            color={appColors.primary || '#4A90E2'}
            styles={styles.welcomeText}
          />
          <SpaceComponent height={8} />
          <TextComponent 
            size={16} 
            text="Tiếp tục với tư cách" 
            color={appColors.black}
            styles={styles.subtitleText}
          />
        </Animated.View>
      </Animated.View>

      {/* Buttons Section */}
      <Animated.View 
        style={[
          styles.buttonSection,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.buttonContainer}>
          {/* User Button */}
          <TouchableOpacity
            style={[styles.customButton, styles.userButton]}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>👤</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.buttonTitle}>NGƯỜI DÙNG</Text>
                <Text style={styles.buttonSubtitle}>Tham gia sự kiện</Text>
              </View>
            </View>
          </TouchableOpacity>

          <SpaceComponent height={16} />

          {/* Organizer Button */}
          <TouchableOpacity
            style={[styles.customButton, styles.organizerButton]}
            onPress={() => navigation.navigate("LoginOrganizer")}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={[styles.iconContainer, styles.organizerIcon]}>
                <Text style={[styles.iconText, { color: appColors.white }]}>⚡</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.buttonTitle, { color: appColors.white }]}>NHÀ TỔ CHỨC</Text>
                <Text style={[styles.buttonSubtitle, { color: appColors.white, opacity: 0.9 }]}>Quản lý sự kiện</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer text */}
        <SpaceComponent height={24} />
        <TextComponent 
          size={14} 
          text="Bằng cách tiếp tục, bạn đồng ý với điều khoản sử dụng" 
          color={appColors.black}
          styles={styles.footerText}
        />
      </Animated.View>
    </ImageBackground>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Làm overlay nhẹ hơn
  },
  headerSection: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    
    
    backgroundColor: 'white',
    
  },
  logo: {
    width: 250,
    height: 250,
  },
  welcomeText: {
    textAlign: 'center',
    fontFamily: fontFamilies.bold,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitleText: {
    textAlign: 'center',
    fontFamily: fontFamilies.medium,
    opacity: 0.8,
  },
  buttonSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
  customButton: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  userButton: {
    backgroundColor: appColors.white,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  organizerButton: {
    backgroundColor: appColors.primary || '#4A90E2',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  organizerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconText: {
    fontSize: 24,
    color: appColors.primary || '#4A90E2',
  },
  textContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontFamily: fontFamilies.bold,
    fontWeight: '700',
    color: appColors.text || '#333',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    color: appColors.gray || '#666',
    opacity: 0.8,
  },
  footerText: {
    textAlign: 'center',
    fontFamily: fontFamilies.regular,
    opacity: 0.7,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});