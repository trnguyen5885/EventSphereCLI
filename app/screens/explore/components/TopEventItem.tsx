/* eslint-disable react-native/no-inline-styles */
import {Dimensions, Image, StyleProp, View, ViewStyle} from 'react-native';
import React from 'react';
import {CardComponent} from '../../../components';
import {SvgProps} from 'react-native-svg';

interface Props {
  item: any;
  styles?: StyleProp<ViewStyle>;
  onPress?: () => void;
  SVGIcon?: React.FC<SvgProps>;
}

const TopEventItem = (props: Props) => {
  const {item, SVGIcon, styles, onPress} = props;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
      }}>
      {SVGIcon && (
        <View style={{marginRight: -9}}>
          <SVGIcon />
        </View>
      )}
      <CardComponent
        onPress={onPress}
        styles={[
          {
            width: Dimensions.get('window').width * 0.6,
            alignItems: 'flex-start',
          },
          styles,
        ]}>
        <Image
          style={{
            width: '100%',
            height: 150,
            objectFit: 'cover',
            borderRadius: 10,
          }}
          source={{uri: item.avatar}}
        />
      </CardComponent>
    </View>
  );
};

export default TopEventItem;
