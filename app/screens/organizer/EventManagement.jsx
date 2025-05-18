import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import OrganizerHeaderComponent from '../../components/OrganizerHeaderComponent';
import AxiosInstance from '../../services/api/AxiosInstance';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


const formatDate = (timestamp) => {
  const date = new Date(
    timestamp.toString().length === 13 ? timestamp : timestamp * 1000
  );
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EventCard = ({ name, timeStart, timeEnd, ticketPrice, soldTickets, image, navigation, eventId }) => (
  <View style={styles.card}>
    <View style={styles.cardLeft}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.date}>Bắt đầu: {formatDate(timeStart)}</Text>
      <Text style={styles.date}>Kết thúc: {formatDate(timeEnd)}</Text>
      <Text style={styles.status}>Đã bán: {soldTickets}</Text>
      <Text style={styles.price}>Giá vé: {ticketPrice.toLocaleString()}đ</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('EventDetailOrganizer', { eventId })}
      >
        <Text style={styles.buttonText}>Chi tiết</Text>
      </TouchableOpacity>
    </View>
    <Image source={{ uri: image }} style={styles.image} />
  </View>
);


const EventManagement = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchEvents = async () => {
    try {
      const axiosJWT = AxiosInstance();
      const res = await axiosJWT.get('users/eventOfOrganization');
      setEvents(res.events || []);
    } catch (error) {
      console.error('Lỗi khi lấy sự kiện:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  return (
    <View style={styles.container}>
      <OrganizerHeaderComponent title="Quản lý sự kiện" />
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          style={{ padding: 10 }}
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <EventCard
              name={item.name}
              timeStart={item.timeStart}
              timeEnd={item.timeEnd}
              ticketPrice={item.ticketPrice}
              soldTickets={item.soldTickets}
              image={item.avatar}
              eventId={item._id}
              navigation={navigation}
            />
          )}

          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default EventManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  status: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  price: {
    fontSize: 13,
    color: '#000',
    marginTop: 4,
    fontWeight: '500',
  },
  button: {
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
  },
});
