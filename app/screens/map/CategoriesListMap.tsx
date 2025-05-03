import {View, Text, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {RowComponent, SpaceComponent, TextComponent} from '../../components';
import {globalStyles} from '../../constants/globalStyles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {AxiosInstance} from '../../services';
import {useNavigation} from '@react-navigation/native';

interface Props {
  isColor?: boolean;
}

interface Category {
  _id: string;
  name: string;
}

const CategoriesListMap = (props: Props) => {
  const {isColor} = props;
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryIcons, setCategoryIcons] = useState<
    {id: string; icon: string}[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await AxiosInstance().get('categories/all');
        console.log('Categories API Response:', response.data); // Debug API
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Dữ liệu danh mục không hợp lệ');
        }
        setCategories(response.data);
        createCategoryIcons(response.data);
      } catch (e) {
        console.error('Error fetching categories:', e);
        setError('Không thể tải danh mục');
      }
    };

    const createCategoryIcons = (categories: Category[]) => {
      const iconsArray = categories.map((category, index) => {
        const iconName = getEventIcon(index + 1);
        return {id: category._id, icon: iconName};
      });
      setCategoryIcons(iconsArray);
    };

    getCategories();

    return () => {
      setCategories([]);
      setCategoryIcons([]);
    };
  }, []);

  useEffect(() => {
    if (categoryIcons.length > 0 && navigation) {
      navigation.navigate('Map', {categoryIcons});
    }
  }, [categoryIcons, navigation]);

  const getEventIcon = (index: number) => {
    const icons = [
      'sports-baseball',
      'music-note',
      'gamepad',
      'videogame-asset',
      'biotech',
    ];
    const iconIndex = (index - 1) % icons.length;
    return icons[iconIndex];
  };

  const handleCategoryPress = async (categoryId: string) => {
    try {
      const response = await AxiosInstance().get(
        `/events/categories/${categoryId}`,
      );
      console.log('Events for category:', response.data); // Debug API
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Dữ liệu sự kiện không hợp lệ');
      }
      // Lọc các sự kiện để đảm bảo có avatar
      const validEvents = response.data.filter(
        event => event && typeof event.avatar === 'string' && event.avatar,
      );
      navigation.navigate('Map', {eventsForCategory: validEvents});
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Không thể tải sự kiện');
    }
  };

  const renderTagCategory = ({item, index}: any) => {
    const color = ['#EE544A', '#F59762', '#29D697', '#46CDFB', '#33FFDD'][
      index % 5
    ];
    const iconName = getEventIcon(index + 1);
    return (
      <RowComponent
        onPress={() => handleCategoryPress(item._id)}
        styles={[
          globalStyles.tag,
          {
            backgroundColor: 'white',
            borderColor: color,
            borderWidth: 1,
          },
        ]}>
        <MaterialIcons name={iconName} size={24} color={color} />
        <SpaceComponent width={8} />
        <TextComponent
          text={item.name}
          styles={{
            color: 'black',
          }}
        />
      </RowComponent>
    );
  };

  if (error) {
    return (
      <View style={globalStyles.container}>
        <TextComponent text={error} color="red" />
      </View>
    );
  }

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

export default CategoriesListMap;
