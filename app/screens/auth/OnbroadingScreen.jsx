import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import React, {useState, useRef} from 'react';
import Swiper from 'react-native-swiper';
import {globalStyles} from '../../constants/globalStyles';
import {Dimensions} from 'react-native';
import {appColors} from '../../constants/appColors';
import {fontFamilies} from '../../constants/fontFamilies';

const {width, height} = Dimensions.get('window');

const OnbroadingScreen = ({navigation}) => {
  const [index, setIndex] = useState(0);
  const swiperRef = useRef(null);

  const handleNext = () => {
    if (index < 2) {
      // Sử dụng scrollBy để có animation mượt mà từ phải sang trái
      swiperRef.current?.scrollBy(1, true);
    } else {
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
        showsButtons={false}
        loop={false}
        index={index}
        onIndexChanged={num => setIndex(num)}
        activeDotColor={appColors.white}
        dotColor={appColors.gray2}
        // Cấu hình cho animation mượt mà
        scrollEnabled={true}
        removeClippedSubviews={false}
        loadMinimal={false}
        // Tùy chỉnh animation transition
        autoplayTimeout={0}
        showsPagination={true}
        paginationStyle={styles.pagination}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      >
        <Image
          source={require('../../../assets/images/onboarding-4.png')}
          style={styles.image}
        />

        <Image
          source={require('../../../assets/images/onboarding-5.png')}
          style={styles.image}
        />

        <Image
          source={require('../../../assets/images/onboarding-6.png')}
          style={styles.image}
        />
      </Swiper>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>
            Skip
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.nextText}>
            {index === 2 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnbroadingScreen;

const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: 'contain',
    width: width,
    height: height * 0.95, // Giảm chiều cao xuống 85% để tránh bị che
    alignSelf: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    position: 'absolute',
    bottom: 20,
    right: 20,
    left: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    color: appColors.gray5,
    fontFamily: fontFamilies.medium,
    fontSize: 16,
  },
  nextText: {
    color: appColors.white,
    fontFamily: fontFamilies.medium,
    fontSize: 16,
  },
  pagination: {
    bottom: 45,
  },
  dot: {
    backgroundColor: appColors.gray2,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: appColors.white,
    width: 12,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
});