import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import React, {useState} from 'react';
import {appColors} from '../../../constants/appColors';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

const BannerComponent = ({bannerData}: any) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation();

  const handleScroll = (event: {nativeEvent: {contentOffset: {x: any}}}) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setActiveIndex(currentIndex);
  };
  return (
    <View style={styles.container}>
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        pagingEnabled
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}>
        {bannerData?.map(({_id, avatar}: any) => (
          <Pressable
            onPress={() => {
              navigation.navigate('Detail', {
                id: _id,
              });
            }}
            style={styles.imageContainer}
            key={_id}>
            <Image style={styles.image} source={{uri: avatar}} />
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.dotsContainer}>
        {bannerData.map(
          (item: {_id: React.Key | null | undefined}, index: number) => {
            const activeDot = activeIndex === index;
            return (
              <View
                key={item._id}
                style={[styles.dot, activeDot ? styles.activeDot : null]}
              />
            );
          },
        )}
      </View>
    </View>
  );
};

export default BannerComponent;

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    width: width,
  },
  imageContainer: {
    width: width,
    height: 220,
    padding: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(86, 105, 255, 0.5)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: appColors.primary,
  },
});
