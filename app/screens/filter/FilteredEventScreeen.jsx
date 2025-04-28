import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AxiosInstance } from '../../services/api/AxiosInstance'; 

const EventFilteredScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [eventsIscoming, setEventsIscoming] = useState([]);
  const [eventsUpcoming, setEventsUpcoming] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // const { selectedCategories, selectedTime, selectedDate, locationInput, minPrice, maxPrice } = route.params;

  // const eventsMock = [
  //   {
  //     _id: '1',
  //     name: 'Giải bóng đá Vô địch Quốc gia',
  //     location: 'Hà Nội',
  //     timeStart: new Date().getTime(),
  //     timeEnd: new Date().getTime() + 2 * 60 * 60 * 1000,
  //     categoryId: 'sports',
  //     price: 50000,
  //     avatar: 'https://source.unsplash.com/featured/?soccer',
  //   },
  //   {
  //     _id: '2',
  //     name: 'Lễ hội Âm nhạc Mùa hè',
  //     location: 'TP. Hồ Chí Minh',
  //     timeStart: new Date().getTime() + 24 * 60 * 60 * 1000,
  //     timeEnd: new Date().getTime() + 26 * 60 * 60 * 1000,
  //     categoryId: 'music',
  //     price: 150000,
  //     avatar: 'https://source.unsplash.com/featured/?music',
  //   },
  //   {
  //     _id: '3',
  //     name: 'Triển lãm Công nghệ 2025',
  //     location: 'Đà Nẵng',
  //     timeStart: new Date().getTime() + 48 * 60 * 60 * 1000,
  //     timeEnd: new Date().getTime() + 50 * 60 * 60 * 1000,
  //     categoryId: 'technology',
  //     price: 100000,
  //     avatar: 'https://source.unsplash.com/featured/?technology',
  //   },
  // ];

  const [events, setEvents] = useState(allEvents); 

  useEffect(() => {
  
    const getEvents = async () => {
      try {
        const response = await AxiosInstance().get('events/home');
        console.log(e);
        setEvents(response);
      } catch (e) {
        console.log(e);
      }
    };
    getEvents();
  }, []);

  const allEvents = [...eventsIscoming, ...eventsUpcoming];

  const filteredEvents = allEvents.filter(event => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.categoryId);
    const matchesDate = selectedDate ? (new Date(event.timeStart).toDateString() === new Date(selectedDate).toDateString()) : true;
    const matchesLocation = locationInput ? event.location.includes(locationInput) : true;
    const matchesPrice = (minPrice ? event.price >= minPrice : true) && (maxPrice ? event.price <= maxPrice : true);
    return matchesCategory && matchesDate && matchesLocation && matchesPrice;
  });
  console.log('filteredEvents:', filteredEvents);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity style={styles.card}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.location}>{item.location}</Text>
          <Text style={styles.time}>
            {formatDate(item.timeStart)} - {formatDate(item.timeEnd)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sự kiện đã lọc</Text>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default EventFilteredScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    backgroundColor: '#1e90ff',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  avatar: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
});
