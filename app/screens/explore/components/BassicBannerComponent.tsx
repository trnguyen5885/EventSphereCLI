import React, {useRef, useEffect} from 'react';
import {
  View,
  Animated,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {appColors} from '../../../constants/appColors';

const {width} = Dimensions.get('window');

interface EventItem {
  _id: string | number;
  avatar: string; // hoặc image, tuỳ theo model của bạn
  // ... các trường khác nếu cần
}

interface BannerProps {
  events: EventItem[];
}

const MAX_BANNERS = 5;

export default function AnimatedBanner({events}: BannerProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation<StackNavigationProp<any>>();

  // Lấy tối đa 5 sự kiện đầu tiên
  const displayEvents = events ? events.slice(0, MAX_BANNERS) : [];

  // Tự động chuyển slide
  useEffect(() => {
    if (!displayEvents || displayEvents.length === 0) return;
    let currentIndex = 0;
    const timer = setInterval(() => {
      currentIndex = (currentIndex + 1) % displayEvents.length;
      if (scrollRef.current) {
        scrollRef.current.scrollTo({x: width * currentIndex, animated: true});
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [displayEvents.length]);

  if (!displayEvents || displayEvents.length === 0) return null;

  return (
    <View style={{marginTop: 1}}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}
        style={{width, height: 200}}>
        {displayEvents.map((event, i) => (
          <View key={event._id} style={{width, height: 200}}>
            <Image
              source={{uri: event.avatar}}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => navigation.navigate('Detail', {id: event._id})}>
              <Text style={styles.detailText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Animated.ScrollView>
      {/* Animated Pagination */}
      <View style={styles.indicatorContainer}>
        {displayEvents.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.5, 1],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.indicator,
                {
                  transform: [{scale}],
                  opacity,
                  backgroundColor: appColors.primary,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerImage: {
    width: '100%',
    height: 200,
  },
  detailButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  detailText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  indicator: {
    width: 7,
    height: 7,
    borderRadius: 5,
    marginHorizontal: 4,
    backgroundColor: '#2ecc71',
  },
});
