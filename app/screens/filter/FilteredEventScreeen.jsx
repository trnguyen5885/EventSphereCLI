import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import AxiosInstance from '../../services/api/AxiosInstance';

const EventFilteredScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { filterParams } = route.params || {};
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    selectedCategories = [],
    selectedDate = null,
    locationInput = '',
    minPrice = '',
    maxPrice = ''
  } = filterParams || {};

  const min = parseFloat(minPrice);
  const max = parseFloat(maxPrice);

  useEffect(() => {
    const getEvents = async () => {
      try {
        const response = await AxiosInstance().get('events/home');
        console.log('Response from API:', response);
        setEvents(response.data);
      } catch (e) {
        console.log('Fetch error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    getEvents();
  }, []);

  const filteredEvents = Array.isArray(events)
    ? events.filter(event => {
        const matchesCategory =
          selectedCategories.length === 0 || selectedCategories.includes(event.categories); // Sửa ở đây

        const matchesDate = selectedDate
          ? new Date(event.timeStart).toDateString() === new Date(selectedDate).toDateString()
          : true;

        const matchesLocation = locationInput
          ? event.location?.toLowerCase().includes(locationInput.toLowerCase())
          : true;


        return matchesCategory && matchesDate && matchesLocation ;
      })
    : [];

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${String(
      date.getHours()
    ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const renderItem = ({ item }) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sự kiện đã lọc</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e90ff" />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không có sự kiện phù hợp.</Text>
          }
        />
      )}
    </View>
  );
};

export default EventFilteredScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    height: 60,
    backgroundColor: '#1e90ff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 3,
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
});
