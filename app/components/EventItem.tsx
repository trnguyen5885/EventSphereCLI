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
import {CardComponent, TextComponent} from '.';
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
        source={{uri: item.avatar}}
      />
      <TouchableOpacity
        onPress={handlePressHeart}
        style={{position: 'absolute', top: 15, right: 15, zIndex: 2}}>
        <Ionicons
          name={isFilled ? 'heart' : 'heart-outline'}
          size={24}
          color={isFilled ? appColors.danger : 'white'}
        />
      </TouchableOpacity>
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
          styles={{marginTop: 15, fontWeight: 'bold', height: 39}}
        />
        <TextComponent
          text={`Từ ${formatPrice(item.minTicketPrice)}`}
          styles={{fontSize: 17, fontWeight: 'bold', color: appColors.primary}}
        />

        <View style={[globalStyles.row, {columnGap: 5, alignItems: 'center'}]}>
          <View>
            <Ionicons name="calendar" size={18} color={appColors.primary} />
          </View>
          <View style={[globalStyles.row, {flex: 1}]}>
            <Text 
              numberOfLines={1} 
              ellipsizeMode="tail"
              style={{
                fontSize: 14,
                color: '#666',
                flex: 1,
              }}
            >
              {`${formatDate(item.timeStart)}`}
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