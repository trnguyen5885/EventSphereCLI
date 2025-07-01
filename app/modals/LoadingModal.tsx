import { View, Text, Modal, Animated, Easing, Image } from "react-native";
import React, { useEffect, useRef } from "react";
import { appColors } from "../constants/appColors";
import { TextComponent } from "../components";

interface Props {
  visible: boolean;
  mess?: string;
}

const LoadingModal = (props: Props) => {
  const { visible, mess } = props;
  
  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible) {
      // Rotation animation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      // Scale pulse animation
      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Opacity breathing animation
      const opacityAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Start animations
      rotateAnimation.start();
      scaleAnimation.start();
      opacityAnimation.start();

      return () => {
        rotateAnimation.stop();
        scaleAnimation.stop();
        opacityAnimation.stop();
      };
    } else {
      // Reset animations when modal is hidden
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);
      opacityAnim.setValue(0.7);
    }
  }, [visible, rotateAnim, scaleAnim, opacityAnim]);

  // Convert animated value to rotation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
        }}>
        
        {/* Loading Container */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: 30,
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)", // For iOS blur effect
          }}>
          
          {/* Animated Icon */}
          <Animated.View
            style={{
              transform: [
                { rotate },
                { scale: scaleAnim }
              ],
              opacity: opacityAnim,
              marginBottom: 20,
            }}>
            <Image
              source={require('../../assets/images/icon.png')} // Đường dẫn tới icon.png của bạn
              style={{
                width: 60,
                height: 60,
                tintColor: appColors.white, // Tùy chỉnh màu icon nếu cần
              }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Loading Text */}
          <TextComponent 
            text={mess || "Loading..."} 
            flex={0} 
            color={appColors.white}
            style={{
              fontSize: 16,
              fontWeight: '500',
              textAlign: 'center',
            }}
          />
          
          {/* Loading Dots Animation */}
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: appColors.white,
                  marginHorizontal: 3,
                  opacity: opacityAnim,
                  transform: [
                    {
                      translateY: Animated.multiply(
                        scaleAnim.interpolate({
                          inputRange: [1, 1.2],
                          outputRange: [0, -5],
                        }),
                        new Animated.Value(index * 0.3 + 1)
                      ),
                    },
                  ],
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal;