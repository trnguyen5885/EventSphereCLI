import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react';
import { AxiosInstance } from '../../services';
import { TextComponent } from '../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserTicketsScreen = ({navigation, route}) => {
    const [userData, setUserData] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eventsIscoming, setEventsIscoming] = useState([]);
    const [eventsUpcoming, setEventsUpcoming] = useState([]);

    useEffect(()=>{
        const getTickets = async() =>{
            try{
                const userId = await AsyncStorage.getItem("userId");
                const tickets = await AxiosInstance().get(`/tickets/getTicket/${userId}`);
                setUserData(tickets.data.user);
                setEvents(tickets.data.events);
                setLoading(false);
  
            }catch(e){
                console.log("Lấy vé thất bại: ", e);
            }
        };
        getTickets();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#007BFF" />;
      }
      const timeStart = () => {
        const ongoingEvents = response.data.filter(eventItem => now >= eventItem.timeStart && now <= eventItem.timeEnd);
      setEventsIscoming(ongoingEvents)
      const upcomingEvents = response.data.filter(eventItem => eventItem.timeStart > now);
      setEventsUpcoming(upcomingEvents);
      }
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f5f5f5" }}>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          return (
            <View style={{ padding: 16, backgroundColor: "white", marginBottom: 10, borderRadius: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.name}</Text>
              <Text>📅 Ngày: {item.eventDate}</Text>
              <Text>🎟 Số vé: {item.tickets.length}</Text>

              <TouchableOpacity
                style={{
                  marginTop: 10,
                  padding: 10,
                  backgroundColor: "#007BFF",
                  borderRadius: 5,
                  alignItems: 'center',
                }}
                onPress={() => navigation.navigate("ListTicket", { event: item, user: userData })}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Xem chi tiết vé</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  )
}

export default UserTicketsScreen

const styles = StyleSheet.create({})