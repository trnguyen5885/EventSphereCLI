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
import React, {useState} from 'react';
import {CardComponent, RowComponent, TextComponent} from '.';
import {appColors} from '../constants/appColors';
import {formatDate} from '../services';
import {formatPrice} from '../services/utils/price';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {globalStyles} from '../constants/globalStyles';

interface Props {
  item: any;
  type: 'list' | 'card';
  styles?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const EventItem = (props: Props) => {
  const {item, type, styles, onPress} = props;
  const [isFilled, setIsFilled] = useState(false);

  const handlePressHeart = () => {
    setIsFilled(!isFilled);
  };

  return type === 'card' ? (
    <CardComponent
      onPress={onPress}
      styles={[
        {
          width: Dimensions.get('window').width * 0.7,
          alignItems: 'flex-start',
        },
        styles,
      ]}>
      <Image
        style={{
          width: '100%',
          height: 150,
          objectFit: 'cover',
          borderRadius: 15,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
        }}
        source={{uri: item.avatar}}
      />
      <View
        style={{
          paddingHorizontal: 10,
          paddingBottom: 10,
          width: '100%'
        }}
      >
      <RowComponent styles={{marginTop: 10}}  justify='flex-start'>
        <View
          style={{
            backgroundColor: appColors.danger,
            paddingVertical: 2,
            paddingHorizontal: 12,
            borderRadius: 20,
            marginRight: 3
          }}>
          <TextComponent text="Giải trí" color='white' size={12}/>
        </View>
        <View
          style={{
            backgroundColor: appColors.link,
            paddingVertical: 2,
            paddingHorizontal: 12,
            borderRadius: 20,
            marginRight: 3
          }}>
          <TextComponent text="Concert" color='white' size={12}/>
        </View>
        <View
          style={{
            backgroundColor: 'green',
            paddingVertical: 2,
            paddingHorizontal: 12,
            borderRadius: 20,
            marginRight: 3
          }}>
          <TextComponent text="Âm nhạc" color='white' size={12}/>
        </View>
      </RowComponent>
      <TextComponent
        numberOfLine={1}
        title
        size={18}
        text={item.name}
        styles={{marginTop: 5}}
      />
      <TextComponent
        text={`Từ ${formatPrice(item.minTicketPrice)}`}
        styles={{fontSize: 17, fontWeight: 'bold', color: appColors.primary}}
      />

      <View style={[globalStyles.row, {marginTop: 5, columnGap: 5}]}>
        <View>
          <Ionicons name="calendar" size={18} color={appColors.primary} />
        </View>
        <View style={globalStyles.row}>
          <Text>{`${formatDate(item.timeStart)} - `}</Text>
          <Text>{formatDate(item.timeEnd)}</Text>
        </View>
      </View>
      <RowComponent justify='flex-end' styles={{alignItems: 'center', marginTop: 5}}>
        <TouchableOpacity
          onPress={handlePressHeart}
          style={{
          }}>
          <Ionicons
            name={isFilled ? "heart" : "heart-outline"}
            size={22}
            color={isFilled ? appColors.danger : 'black'}
          />
        </TouchableOpacity>
        <TextComponent text='10k' size={15} styles={{marginLeft: 1}}/>
      </RowComponent>
      </View>
    </CardComponent>
  ) : (
    <></>
  );
};

export default EventItem;
