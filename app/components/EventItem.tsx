/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  Dimensions,
  Image,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { CardComponent, TextComponent } from '.';
import { appColors } from '../constants/appColors';
import { formatDate } from '../services';
import { formatPrice } from '../services/utils/price';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../constants/globalStyles';

interface Props {
  item: any;
  type: 'list' | 'card';
  styles?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const getValidShowtime = (showtimes: any[]) => {
  const now = new Date();

  // Tìm xuất chiếu đang diễn ra (startTime <= now <= endTime)
  const currentShowtime = showtimes.find(st => {
    const startTime = new Date(st.startTime);
    const endTime = new Date(st.endTime);
    return startTime <= now && now <= endTime;
  });

  // Nếu có xuất chiếu đang diễn ra, ưu tiên hiển thị
  if (currentShowtime) {
    return currentShowtime;
  }

  // Tìm xuất chiếu gần nhất với thời gian hiện tại
  const sortedShowtimes = showtimes
    .map(st => ({
      ...st,
      startTime: new Date(st.startTime),
      endTime: new Date(st.endTime),
      timeDiff: Math.abs(new Date(st.startTime).getTime() - now.getTime())
    }))
    .sort((a, b) => a.timeDiff - b.timeDiff);

  return sortedShowtimes[0];
};

const EventItem = (props: Props) => {
  const { item, type, styles, onPress } = props;
  
  const validShowtime =
    item?.showtimes ? getValidShowtime(item.showtimes) : null;

  

  return type === 'card' ? (
    <CardComponent
      onPress={onPress}
      styles={[
        {
          width: Dimensions.get('window').width * 0.6,
          alignItems: 'flex-start',
          position: 'relative',
        },
        styles,
      ]}>
      <Image
        style={{
          width: '100%',
          height: 140,
          objectFit: 'cover',
          borderRadius: 15,
        }}
        source={{ uri: item.avatar }}
      />
      <View
        style={{
          width: '100%',
          rowGap: 5,
        }}>
        <TextComponent
          numberOfLine={2}
          title
          size={16}
          text={item.name}
          styles={{ marginTop: 15, fontWeight: 'bold', height: 39 }}
        />
        <TextComponent
          text={`Từ ${formatPrice(item.minTicketPrice)}`}
          styles={{ fontSize: 17, fontWeight: 'bold', color: appColors.primary }}
        />

        <View style={[globalStyles.row, { columnGap: 5, alignItems: 'center' }]}>
          <View>
            <Ionicons name="calendar" size={18} color={appColors.primary} />
          </View>
          <View style={[globalStyles.row, { flex: 1 }]}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: 14,
                color: '#666',
                flex: 1,
              }}
            >
              {item?.showtimes?.length > 0 && (
                <>
                  {validShowtime && (

                    `${formatDate(validShowtime.startTime)}`

                  )}
                </>
              )}
            </Text>
          </View>
        </View>
      </View>
    </CardComponent>
  ) : (
    <></>
  );
};

export default EventItem;