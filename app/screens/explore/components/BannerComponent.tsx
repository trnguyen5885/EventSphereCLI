import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  Pressable,
  Animated,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {TextComponent} from '../../../../app/components';
import {appColors} from '../../../../app/constants/appColors';

const {width, height} = Dimensions.get('window');

interface BannerItem {
  avatar: string;
  name: string;
  description: string;
  // Add other properties if they exist in your banner data
}

const colors = {
  primary: '#6366F1',
  text: '#1E293B',
  white: '#FFFFFF',
  secondaryText: '#64748B',
};

const BannerComponent = ({bannerData}: {bannerData: BannerItem[]}) => {
  const carouselRef = useRef<FlatList>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentImage, setCurrentImage] = useState(bannerData?.[0]?.avatar);
  const [displayItem, setDisplayItem] = useState<BannerItem | undefined>(
    bannerData?.[0],
  );

  const itemWidth = width * 0.8;
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const nextItem = bannerData[activeSlide];
    setDisplayItem(nextItem);

    const nextImage = nextItem?.avatar;

    if (nextImage && nextImage !== currentImage) {
      setCurrentImage(nextImage);
    }
  }, [activeSlide, bannerData, currentImage]);

  const renderItem = ({item, index}: {item: BannerItem; index: number}) => {
    const inputRange = [
      (index - 1) * itemWidth,
      index * itemWidth,
      (index + 1) * itemWidth,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.slide,
          {width: itemWidth, transform: [{scale}], opacity},
        ]}>
        <Image
          source={{uri: item.avatar}}
          style={styles.poster}
          resizeMode="cover"
        />
      </Animated.View>
    );
  };

  const onScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.setValue(offsetX);

    const newActiveSlide = Math.round(offsetX / itemWidth);
    if (newActiveSlide !== activeSlide) {
      setActiveSlide(newActiveSlide);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image + Fade */}
      <View style={styles.backgroundWrapper}>
        <Animated.Image
          source={{uri: currentImage}}
          style={[styles.backgroundImage, {opacity: 1}]}
          resizeMode="cover"
          blurRadius={20}
        />
        <LinearGradient
          colors={['transparent', '#ffffff']}
          style={styles.gradient}
        />
        {/* Top Gradient */}
        <LinearGradient
          colors={['#ffffff', 'transparent']}
          style={styles.topGradient}
        />
      </View>

      {/* Custom Carousel with FlatList */}
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={carouselRef}
          data={bannerData}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          keyExtractor={(item, index) => index.toString()}
          getItemLayout={(data, index) => ({
            length: itemWidth,
            offset: itemWidth * index,
            index,
          })}
          contentContainerStyle={{paddingHorizontal: (width - itemWidth) / 2}}
        />
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        {/* <TextComponent
          styles={styles.title}
          text={displayItem?.name || ''}
          numberOfLine={1}
        />
        <Text style={styles.subtitle}>Sắp diễn ra</Text> */}

        {/* <View style={styles.buttonRow}>
          <Pressable style={styles.watchNowButton}>
            <Text style={styles.watchNowText}>Xem ngay</Text>
          </Pressable>
          <Pressable style={styles.infoButton}>
            <Text style={styles.infoButtonText}>Yêu thích</Text>
          </Pressable>
        </View> */}

        {/* Pagination */}
        <View style={styles.paginationContainer}>
          {bannerData.map((_, index) => (
            <View
              key={index.toString()}
              style={[
                styles.paginationDot,
                activeSlide === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: height * 0.45,
    backgroundColor: 'white',
    overflow: 'hidden',
    marginTop: 10,
  },
  backgroundWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  backgroundImage: {
    width: '100%',
    height: '120%',
    position: 'absolute',
    top: -50,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    height: 200,
    width: '100%',
  },
  carouselContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  slide: {
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 3,
  },
  poster: {
    width: '100%',
    height: height * 0.3,
    // objectFit: 'cover',
    // borderRadius: 5,
  },
  infoBox: {
    paddingHorizontal: 20,
    marginTop: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  watchNowButton: {
    backgroundColor: appColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  watchNowText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'white',
  },
  infoButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  infoButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  metaTag: {
    backgroundColor: '#FDE68A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  metaText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 10,
    fontSize: 13,
    color: colors.secondaryText,
  },
  paginationContainer: {
    flexDirection: 'row',
    marginTop: 40,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: appColors.primary,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    height: 100,
    width: '100%',
  },
});

export default BannerComponent;
