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
  type: 'list' | 'card' | 'grid';
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
          numberOfLine={1}
          title
          size={14}
          text={item.name}
          styles={{ marginTop: 12, fontWeight: 'bold', height: 20 }}
        />
        <TextComponent
          text={`Từ ${formatPrice(item.minTicketPrice)}`}
          styles={{ fontSize: 13, fontWeight: 'bold', color: appColors.primary, marginTop: 4 }}
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
                fontSize: 12,
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
  ) : type === 'grid' ? (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          borderRadius: 12,
          backgroundColor: '#fff',
          overflow: 'hidden',
        },
        styles,
      ]}
    >
      <Image
        source={{ uri: item.avatar }}
        style={{
          width: '100%',
          height: 100,
          borderRadius: 10,
          resizeMode: 'cover',
        }}
      />
      <View style={{ padding: 8 }}>
        <TextComponent
          text={item.name}
          title
          numberOfLine={1}
          size={14}
          styles={{ fontWeight: 'bold', height: 20 }}
        />
        <TextComponent
          text={`Từ ${formatPrice(item.minTicketPrice)}`}
          styles={{
            fontSize: 13,
            fontWeight: 'bold',
            color: appColors.primary,
            marginTop: 4,
          }}
        />
        {validShowtime && (
          <View style={[globalStyles.row, { marginTop: 4 }]}>
            <Ionicons name="calendar-outline" size={14} color="#888" />
            <Text
              style={{ marginLeft: 4, fontSize: 12, color: '#666' }}
              numberOfLines={1}
            >
              {formatDate(validShowtime.startTime)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ) : (
    <></>
  );
};

export default EventItem;