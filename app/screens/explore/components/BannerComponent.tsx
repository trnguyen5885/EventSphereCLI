import React, {useRef} from 'react';
import {View, Image, ImageBackground, Dimensions, Pressable, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {appColors} from '../../../constants/appColors';
import Carousel from 'react-native-snap-carousel';
const {width} = Dimensions.get('window');

const BannerComponent = ({bannerData}: any) => {
  const carouselRef = useRef<any>(null);
  const navigation = useNavigation();

  const renderItem = ({item}: any) => {
    return (
      <Pressable
        key={item._id}
        onPress={() => {
          navigation.navigate('Detail', {
            id: item._id,
          });
        }}
        style={styles.imageContainer}>
        <ImageBackground 
          style={styles.imageBackground}
          blurRadius={10}
          source={{uri: item.avatar}}>
          <View style={styles.overlay}>
            <Image style={styles.image} source={{uri: item.avatar}} />
          </View>
        </ImageBackground>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        data={bannerData}
        renderItem={renderItem}
        sliderWidth={width}
        itemWidth={width * 0.8} // giảm width để có không gian cho ảnh 2 bên
        inactiveSlideScale={0.85} // scale ảnh kế cận
        inactiveSlideOpacity={0.6} // opacity ảnh kế cận
        containerCustomStyle={styles.carouselContainer}
        contentContainerCustomStyle={styles.carouselContentContainer}
        layout="default" // đổi từ "stack" sang "default"
        activeSlideAlignment="center" // căn giữa slide active
        enableMomentum={false}
        decelerationRate={0.9}
        loop={true}
        activeSlideOffset={20} // khoảng cách để hiển thị ảnh kế cận
      />
    </View>
  );
};

export default BannerComponent;

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    width: width,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 5, // thêm margin để tạo khoảng cách
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5, // shadow cho Android
    shadowColor: '#000', // shadow cho iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carouselContainer: {
    overflow: 'visible', // để thấy ảnh kế cận
  },
  carouselContentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10, // thêm padding ngang
  },
});