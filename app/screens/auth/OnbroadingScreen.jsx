import React, {useState, useRef} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Swiper from 'react-native-swiper';
import {appColors} from '../../constants/appColors';
import {appInfo} from '../../constants/appInfos';
import {globalStyles} from '../../constants/globalStyles';
import {TextComponent} from '../../components';
import {fontFamilies} from '../../constants/fontFamilies';

const OnboardingScreen = ({navigation}) => {
  const [index, setIndex] = useState(0);
  const swiperRef = useRef(null);

  const handleNext = () => {
    if (index < 2) {
      // Chuyển đến slide tiếp theo với hiệu ứng
      swiperRef.current?.scrollBy(1);
    } else {
      // Ảnh cuối cùng, chuyển đến màn hình Welcome
      navigation.navigate('Welcome');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Welcome');
  };

  return (
    <View style={[globalStyles.container]}>
      <Swiper
        ref={swiperRef}
        style={{}}
        loop={false}
        onIndexChanged={num => setIndex(num)}
        index={index}
        activeDotColor={appColors.white}
        showsPagination={true}
        paginationStyle={styles.pagination}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        // Cấu hình hiệu ứng chuyển ảnh
        scrollEnabled={true}
        removeClippedSubviews={false}
        autoplay={false}>
        <Image
          source={require('../../../assets/images/onboarding-1.png')}
          style={styles.image}
        />
        <Image
          source={require('../../../assets/images/onboarding-2.png')}
          style={styles.image}
        />
        <Image
          source={require('../../../assets/images/onboarding-3.png')}
          style={styles.image}
        />
      </Swiper>
      
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.button}>
          <TextComponent
            text="Bỏ qua"
            color={appColors.gray2}
            font={fontFamilies.medium}
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleNext} style={styles.button}>
          <TextComponent
            text={index === 2 ? "Bắt đầu" : "Tiếp theo"}
            color={appColors.white}
            font={fontFamilies.medium}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: appInfo.sizes.WIDTH,
    height: appInfo.sizes.HEIGHT,
    resizeMode: 'cover',
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    position: 'absolute',
    bottom: 20,
    right: 20,
    left: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pagination: {
    bottom: 50, // Đẩy dots lên trên buttons
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  activeDot: {
    backgroundColor: appColors.white,
    width: 20,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  text: {
    color: appColors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});