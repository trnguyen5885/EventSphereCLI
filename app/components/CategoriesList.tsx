import {View, Text, FlatList} from 'react-native';
import React, {ReactNode, useEffect, useState} from 'react';
import {RowComponent, SpaceComponent, TextComponent} from '.';
import {globalStyles} from '../constants/globalStyles';
import {appColors} from '../constants/appColors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {AxiosInstance} from '../services';
import {useNavigation} from '@react-navigation/native';

interface Props {
  isColor?: boolean;
}

interface Category {
  _id: string;
  name: string;
}

const CategoriesList = (props: Props) => {
  const {isColor} = props;
  const [categories, setCategories] = useState<Category[] | undefined>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await AxiosInstance().get('categories/all');
        setCategories(response.data);
      } catch (e) {
        console.log(e);
      }
    };
    getCategories();

    return () => {
      setCategories([]);
    };
  }, []);

  const colors = ['#EE544A', '#F59762', '#29D697', '#46CDFB', '#33FFDD'];
  const getEventIcon = (id: any) => {
    const icons = [
      'sports-baseball',
      'music-note',
      'gamepad',
      'videogame-asset',
      'biotech',
    ];
    const index = (id - 1) % icons.length;
    return icons[index];
  };

  const renderTagCategory = ({item, index}: any) => {
    const color = colors[index % colors.length];
    const iconName = getEventIcon(index + 1);
    return (
      <RowComponent
        onPress={() => {
          navigation.navigate('Category', {
            id: item._id,
            name: item.name,
            color: color,
            icon: iconName,
          });
        }}
        styles={[
          [
            globalStyles.tag,
            {
              backgroundColor: color,
            },
          ],
        ]}>
        <MaterialIcons
          name={iconName}
          size={24}
          color={isColor ? appColors.white : color}
        />
        <SpaceComponent width={8} />
        <TextComponent
          text={item.name}
          styles={{
            color: isColor ? appColors.white : color,
          }}
        />
      </RowComponent>
    );
  };

  return (
    <FlatList
      style={{paddingHorizontal: 16}}
      showsHorizontalScrollIndicator={false}
      horizontal
      nestedScrollEnabled
      data={categories}
      renderItem={renderTagCategory}
      keyExtractor={item => item._id}
    />
  );
};

export default CategoriesList;
