import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Component skeleton cho từng event card
const EventCardSkeleton = ({ style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnim]);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View style={[styles.cardContainer, style]}>
      {/* Image skeleton */}
      <Animated.View style={[styles.imageSkeleton, shimmerStyle]} />
      
      {/* Content skeleton */}
      <View style={styles.contentSkeleton}>
        {/* Title skeleton */}
        <Animated.View style={[styles.titleSkeleton, shimmerStyle]} />
        <Animated.View style={[styles.titleSkeletonShort, shimmerStyle]} />
        
        {/* Date skeleton */}
        <Animated.View style={[styles.dateSkeleton, shimmerStyle]} />
        <Animated.View style={[styles.dateSkeleton, shimmerStyle]} />
        
        {/* Sold tickets skeleton */}
        <Animated.View style={[styles.soldSkeleton, shimmerStyle]} />
      </View>
      
      {/* Actions skeleton */}
      <View style={styles.actionsSkeleton}>
        <Animated.View style={[styles.btnSkeleton, shimmerStyle]} />
        <Animated.View style={[styles.btnSkeleton, { marginTop: 6 }, shimmerStyle]} />
      </View>
    </View>
  );
};

// Component skeleton cho search bar
const SearchBarSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnim]);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View style={styles.searchContainer}>
      <Animated.View style={[styles.searchBarSkeleton, shimmerStyle]} />
    </View>
  );
};

// Component skeleton chính cho trang search
const SearchEventSkeletonLoader = ({ itemCount = 6 }) => {
  return (
    <View style={styles.container}>
      {/* Search bar skeleton */}
      <SearchBarSkeleton />
      
      {/* Results header skeleton */}
      <View style={styles.resultsHeader}>
        <View style={styles.resultCountSkeleton} />
      </View>
      
      {/* Event cards skeleton */}
      <View style={styles.listContainer}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </View>
    </View>
  );
};

// Component skeleton với shimmer effect nâng cao
const ShimmerSkeleton = ({ width, height, borderRadius = 8, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnim]);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    }),
    transform: [
      {
        translateX: shimmerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-width, width],
        }),
      },
    ],
  };

  return (
    <View style={[{ width, height, borderRadius, backgroundColor: '#E0E0E0', overflow: 'hidden' }, style]}>
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
            backgroundColor: '#F0F0F0',
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
};

// Component skeleton sử dụng ShimmerSkeleton
const AdvancedEventCardSkeleton = ({ style }) => {
  return (
    <View style={[styles.cardContainer, style]}>
      {/* Image skeleton */}
      <ShimmerSkeleton width={70} height={70} borderRadius={12} />
      
      {/* Content skeleton */}
      <View style={styles.contentSkeleton}>
        {/* Title skeleton */}
        <ShimmerSkeleton width={150} height={16} style={{ marginBottom: 4 }} />
        <ShimmerSkeleton width={120} height={12} style={{ marginBottom: 2 }} />
        <ShimmerSkeleton width={120} height={12} style={{ marginBottom: 2 }} />
        
        
        {/* Sold tickets skeleton */}
        <ShimmerSkeleton width={80} height={12} style={{ marginTop: 2 }} />
      </View>
      
      {/* Actions skeleton */}
      <View style={styles.actionsSkeleton}>
        <ShimmerSkeleton width={60} height={28} borderRadius={8} />
        <ShimmerSkeleton width={60} height={28} borderRadius={8} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
};

export default SearchEventSkeletonLoader;
export { EventCardSkeleton, SearchBarSkeleton, ShimmerSkeleton, AdvancedEventCardSkeleton };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBarSkeleton: {
    height: 48,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  resultCountSkeleton: {
    width: 150,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  cardContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageSkeleton: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#E0E0E0',
  },
  contentSkeleton: {
    flex: 1,
    marginRight: 12,
    marginLeft: 8,
  },
  titleSkeleton: {
    width: '80%',
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 4,
  },
  titleSkeletonShort: {
    width: '60%',
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  dateSkeleton: {
    width: '70%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 2,
  },
  soldSkeleton: {
    width: '50%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginTop: 2,
  },
  actionsSkeleton: {
    alignItems: 'flex-end',
  },
  btnSkeleton: {
    width: 60,
    height: 28,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
});