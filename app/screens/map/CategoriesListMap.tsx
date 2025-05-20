import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Alert} from 'react-native';
import {RowComponent, SpaceComponent, TextComponent} from '../../components';
import {globalStyles} from '../../constants/globalStyles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {AxiosInstance} from '../../services';
import {useNavigation} from '@react-navigation/native';

interface Props {
  isColor?: boolean;
  onSelectEvents?: (events: Event[]) => void;
  userLocation?: {latitude: number; longitude: number};
  onCategoryIconsChange?: (
    categoryIcons: {id: string; icon: string; color: string}[],
  ) => void;
}

interface Category {
  _id: string;
  name: string;
}

interface Event {
  _id: string;
  avatar?: string;
  location_map?: {
    coordinates: [number, number]; // [lng, lat]
  };
  // thêm các trường khác nếu cần
}

const CategoriesListMap: React.FC<Props> = ({
  isColor,
  onSelectEvents,
  userLocation,
  onCategoryIconsChange,
}) => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryIcons, setCategoryIcons] = useState<
    {id: string; icon: string; color: string}[]
  >([]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await AxiosInstance().get<Category[]>(
          'categories/all',
        );
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Dữ liệu danh mục không hợp lệ');
        }
        const extendedCategories = [
          {_id: 'all', name: 'Tất cả'},
          {_id: 'nearby', name: 'Gần bạn'},
          ...response.data,
        ];
        setCategories(extendedCategories);
        createCategoryIcons(extendedCategories);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
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

  const getEventIcon = (indexOrId: number | string): string => {
    if (typeof indexOrId === 'string') {
      if (indexOrId === 'all') return 'apps'; // Icon cho "Tất cả"
      if (indexOrId === 'nearby') return 'place'; // Icon cho "Gần bạn"
    }

    const icons = [
      'sports-baseball',
      'music-note',
      'gamepad',
      'videogame-asset',
      'biotech',
    ];
    const iconIndex = (Number(indexOrId) - 1) % icons.length;
    return icons[iconIndex];
  };

  const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const deg2rad = (deg: number) => deg * (Math.PI / 180);
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const createCategoryIcons = (categories: Category[]) => {
    console.log('createCategoryIcons được gọi với categories:', categories);
    const colors = ['#EE544A', '#F59762', '#29D697', '#46CDFB', '#33FFDD'];
    const iconsArray = categories.map((category, index) => {
      const iconName =
        category._id === 'all' || category._id === 'nearby'
          ? getEventIcon(category._id)
          : getEventIcon(index + 1);
      const color = colors[index % colors.length];
      return {id: category._id, icon: iconName, color};
    });
    console.log('iconsArray tạo ra:', iconsArray);
    setCategoryIcons(iconsArray);
    if (onCategoryIconsChange) {
      console.log('Gọi onCategoryIconsChange với iconsArray');
      onCategoryIconsChange(iconsArray);
    } else {
      console.log('onCategoryIconsChange không được truyền vào props');
    }
  };

  const handleCategoryPress = async (categoryId: string) => {
    if (categoryId === 'all') {
      try {
        const response = await AxiosInstance().get<Event[]>('events/home');
        if (onSelectEvents) onSelectEvents(response.data);
      } catch (error) {
        console.error('Error fetching all events:', error);
      }
    } else if (categoryId === 'nearby') {
      if (!userLocation) {
        Alert.alert('Thông báo', 'Chưa có vị trí của bạn!');
        return;
      }
      try {
        const response = await AxiosInstance().get<Event[]>('events/home');
        const events = response.data;

        const nearbyEvents = events.filter(event => {
          const coords = event.location_map?.coordinates;
          if (
            coords &&
            coords.length === 2 &&
            typeof coords[0] === 'number' &&
            typeof coords[1] === 'number'
          ) {
            const [lng, lat] = coords;
            const distance = getDistanceFromLatLonInKm(
              userLocation.latitude,
              userLocation.longitude,
              lat,
              lng,
            );
            return distance <= 10; // 5km radius
          }
          return false;
        });

        if (onSelectEvents) onSelectEvents(nearbyEvents);
      } catch (error) {
        console.error('Error fetching nearby events:', error);
      }
    } else {
      try {
        const response = await AxiosInstance().get<Event[]>(
          `events/categories/${categoryId}`,
        );
        const validEvents = response.data.filter(
          event => event.avatar && typeof event.avatar === 'string',
        );
        if (onSelectEvents) onSelectEvents(validEvents);
      } catch (error) {
        console.error('Error fetching category events:', error);
      }
    }
  };

  const renderTagCategory = ({
    item,
    index,
  }: {
    item: Category;
    index: number;
  }) => {
    // Lấy màu từ categoryIcons nếu có, fallback dùng colors mặc định
    const color =
      categoryIcons.find(c => c.id === item._id)?.color ||
      ['#EE544A', '#F59762', '#29D697', '#46CDFB', '#33FFDD'][index % 5];
    const iconName =
      categoryIcons.find(c => c.id === item._id)?.icon ||
      getEventIcon(
        item._id === 'all' || item._id === 'nearby' ? item._id : index + 1,
      );

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
        <TextComponent text={item.name} styles={{color: 'black'}} />
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

export default CategoriesListMap;
