import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import OrganizerHeaderComponent from '../../components/OrganizerHeaderComponent';

const events = [
  {
    id: '1',
    title: 'Rock Festival',
    date: 'Oct 20, 2023',
    status: 'Sold Out',
    buttonLabel: 'View',
    image: 'https://via.placeholder.com/100x80.png?text=🎸',
  },
  {
    id: '2',
    title: 'Art Expo 2023',
    date: 'Nov 5, 2023',
    status: 'Open',
    buttonLabel: 'Edit',
    image: 'https://via.placeholder.com/100x80.png?text=🖼️',
  },
  {
    id: '3',
    title: 'Food Fiesta',
    date: 'Dec 12, 2023',
    status: 'Limited Tickets',
    buttonLabel: 'Notify',
    image: 'https://via.placeholder.com/100x80.png?text=🍔',
  },
  {
    id: '1',
    title: 'Rock Festival',
    date: 'Oct 20, 2023',
    status: 'Sold Out',
    buttonLabel: 'View',
    image: 'https://via.placeholder.com/100x80.png?text=🎸',
  },
  {
    id: '2',
    title: 'Art Expo 2023',
    date: 'Nov 5, 2023',
    status: 'Open',
    buttonLabel: 'Edit',
    image: 'https://via.placeholder.com/100x80.png?text=🖼️',
  },
  {
    id: '3',
    title: 'Food Fiesta',
    date: 'Dec 12, 2023',
    status: 'Limited Tickets',
    buttonLabel: 'Notify',
    image: 'https://via.placeholder.com/100x80.png?text=🍔',
  },
  {
    id: '1',
    title: 'Rock Festival',
    date: 'Oct 20, 2023',
    status: 'Sold Out',
    buttonLabel: 'View',
    image: 'https://via.placeholder.com/100x80.png?text=🎸',
  },
  {
    id: '2',
    title: 'Art Expo 2023',
    date: 'Nov 5, 2023',
    status: 'Open',
    buttonLabel: 'Edit',
    image: 'https://via.placeholder.com/100x80.png?text=🖼️',
  },
  {
    id: '3',
    title: 'Food Fiesta',
    date: 'Dec 12, 2023',
    status: 'Limited Tickets',
    buttonLabel: 'Notify',
    image: 'https://via.placeholder.com/100x80.png?text=🍔',
  },
];

const EventCard = ({ title, date, status, buttonLabel, image }) => (
  <View style={styles.card}>
    <View style={styles.cardLeft}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>Date: {date}</Text>
      <Text style={styles.status}>Status: {status}</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
    <Image source={{ uri: image }} style={styles.image} />
  </View>
);

const EventManagement = () => {
  return (
    <View style={styles.container}>
      <OrganizerHeaderComponent title="Event Management" />
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{ padding: 10 }}
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard {...item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
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
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    color: '#999',
    marginVertical: 4,
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
