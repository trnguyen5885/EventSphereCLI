import React, {useEffect, useState} from 'react';
import {FlatList, Alert} from 'react-native';
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
}

const iconMap: {[key: string]: string} = {
  all: 'apps',
  nearby: 'place',
  'Thể Thao': 'sports-baseball',
  'Giải trí': 'videogame-asset',
  Kịch: 'theater-comedy',
  'Hội Thảo': 'group',
  'Du Lịch': 'map',
  'Âm Nhạc': 'music-note',
  'Lịch sử': 'history',
};

const defaultIcons = [
  'event',
  'star',
  'local-offer',
  'local-activity',
  'explore',
];

const defaultColors = ['#EE544A', '#F59762', '#29D697', '#46CDFB', '#33FFDD'];

const CategoriesListMap: React.FC<Props> = ({
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
    const fetchCategories = async () => {
      try {
        const response = await AxiosInstance().get<Category[]>(
          'categories/all',
        );
        const data = response.data || [];
        const extended = [
          {_id: 'all', name: 'Tất cả'},
          {_id: 'nearby', name: 'Gần bạn'},
          ...data,
        ];
        setCategories(extended);
        buildIcons(extended);
      } catch (e) {
        console.error('Lỗi khi tải danh mục:', e);
      }
    };

    fetchCategories();
    return () => {
      setCategories([]);
      setCategoryIcons([]);
    };
  }, []);

  useEffect(() => {
    if (categoryIcons.length > 0 && navigation) {
      navigation.navigate('Map', {categoryIcons});
    }
  }, [categoryIcons]);

  const buildIcons = (cats: Category[]) => {
    const result = cats.map((cat, index) => {
      const icon =
        iconMap[cat.name] ||
        iconMap[cat._id] ||
        defaultIcons[index % defaultIcons.length];
      const color = defaultColors[index % defaultColors.length];
      return {id: cat._id, icon, color};
    });

    setCategoryIcons(result);
    onCategoryIconsChange?.(result);
  };

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const rad = (deg: number) => deg * (Math.PI / 180);
    const R = 6371;
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handlePress = async (categoryId: string) => {
    try {
      const res = await AxiosInstance().get<Event[]>('events/home');
      const events = res.data;

      if (categoryId === 'all') {
        onSelectEvents?.(events);
      } else if (categoryId === 'nearby') {
        if (!userLocation) {
          Alert.alert('Thông báo', 'Chưa xác định vị trí người dùng.');
          return;
        }

        const filtered = events.filter(event => {
          const coords = event.location_map?.coordinates;
          if (!coords || coords.length !== 2) return false;
          const [lng, lat] = coords;
          return (
            getDistance(
              userLocation.latitude,
              userLocation.longitude,
              lat,
              lng,
            ) <= 10
          );
        });

        onSelectEvents?.(filtered);
      } else {
        const catRes = await AxiosInstance().get<Event[]>(
          `events/categories/${categoryId}`,
        );
        const valid = catRes.data.filter(ev => typeof ev.avatar === 'string');
        onSelectEvents?.(valid);
      }
    } catch (err) {
      console.error('Lỗi khi xử lý danh mục:', err);
    }
  };

  const renderCategory = ({item, index}: {item: Category; index: number}) => {
    const found = categoryIcons.find(c => c.id === item._id);
    const icon = found?.icon || 'category';
    const color = found?.color || defaultColors[index % defaultColors.length];

    return (
      <RowComponent
        onPress={() => handlePress(item._id)}
        styles={[
          globalStyles.tag,
          {backgroundColor: 'white', borderColor: color, borderWidth: 1},
        ]}>
        <MaterialIcons name={icon} size={24} color={color} />
        <SpaceComponent width={8} />
        <TextComponent text={item.name} styles={{color: 'black'}} />
      </RowComponent>
    );
  };

  return (
    <FlatList
      style={{paddingHorizontal: 16}}
      data={categories}
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      renderItem={renderCategory}
      keyExtractor={item => item._id}
    />
  );
};

export default CategoriesListMap;
