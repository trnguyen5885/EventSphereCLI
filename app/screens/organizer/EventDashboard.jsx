import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import OrganizerHeaderComponent from '../../components/OrganizerHeaderComponent';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const EventDasboard = () => {
  const [isStarted, setIsStarted] = useState(false);
  const handleStart = () => setIsStarted(true);

  const events = [
    {
      id: '1',
      title: 'Music Festival',
      date: 'Aug 20, 2024 - 6:00 PM',
      status: 'Upcoming',
      sold: '75 / 100 Tickets Sold',
      image: 'https://via.placeholder.com/80x80.png?text=🎵',
    },
    {
      id: '2',
      title: 'Tech Conference',
      date: 'Jul 15, 2024 - 9:00 AM',
      status: 'Ended',
      sold: '135 / 200 Tickets Sold',
      image: 'https://via.placeholder.com/80x80.png?text=💻',
    },
    {
      id: '3',
      title: 'Music Festival',
      date: 'Aug 20, 2024 - 6:00 PM',
      status: 'Upcoming',
      sold: '75 / 100 Tickets Sold',
      image: 'https://via.placeholder.com/80x80.png?text=🎵',
    },
    {
      id: '4',
      title: 'Tech Conference',
      date: 'Jul 15, 2024 - 9:00 AM',
      status: 'Ended',
      sold: '135 / 200 Tickets Sold',
      image: 'https://via.placeholder.com/80x80.png?text=💻',
    },
  ];

  const StatBox = ({ label, value, icon }) => (
    <View style={styles.statBox}>
      <MaterialIcons name={icon} size={20} color="#555" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
  
  const EventCard = ({ event }) => {
    const isUpcoming = event.status === 'Upcoming';
    return (
      <View style={styles.eventCard}>
        <Image source={{ uri: event.image }} style={styles.eventImage} />
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>{event.date}</Text>
          <Text style={[styles.eventStatus, { color: isUpcoming ? 'green' : 'gray' }]}>
            {event.status}
          </Text>
          <Text style={styles.eventSold}>{event.sold}</Text>
          <View style={styles.iconRow}>
            <MaterialIcons name="visibility" size={22} />
            <MaterialIcons name="edit" size={22} />
            <MaterialIcons name="send" size={22} />
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <OrganizerHeaderComponent title="Trang chủ" />

      {isStarted ? (
        <View style={{ flex: 1 }}>
          <View style={styles.statGrid}>
            <StatBox label="Events" value="5" icon="event" />
            <StatBox label="Total Tickets" value="210" icon="confirmation-number" />
            <StatBox label="Attendees" value="150" icon="group" />
            <StatBox label="Revenue" value="$2,450" icon="attach-money" />
          </View>

          <View style={styles.eventHeader}>
            <Text style={styles.sectionTitle}>Events</Text>
            <TouchableOpacity>
              <MaterialIcons name="add-circle" size={30} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <FlatList
            showsVerticalScrollIndicator={false}
            style={{padding:5}}
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EventCard event={item} />}
          />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>💬</Text>
          </View>
          <Text style={styles.title}>EventMaster</Text>
          <Text style={styles.subtitle}>
            Manage your events effortlessly from{'\n'}one dashboard.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


export default EventDasboard;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    backgroundColor: '#6C63FF',
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    marginTop: 30,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    padding: 12,
    marginVertical: 6,
    gap: 4,
   backgroundColor: '#fff',
  borderRadius: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 4,
  },
  
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#555',
  },
  eventHeader: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  eventCard: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  
  eventImage: {
    flex: 4,
    height: 150,
    borderRadius: 6,
  },
  eventInfo: {
    flex: 4,
    height: 150,
    paddingLeft: 10,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 14,
    color: '#444',
  },
  eventStatus: {
    fontSize: 14,
  },
  eventSold: {
    fontSize: 14,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
    marginTop: 5,
  },
  shadowBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  
  
});
