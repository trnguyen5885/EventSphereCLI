import { StyleSheet, Text, View,StatusBar, Platform,ActivityIndicator, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { useState } from 'react'
import { useEffect } from 'react';
import { appColors } from '../../constants/appColors';
import { RowComponent } from '../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AxiosInstance  from '../../services/api/AxiosInstance';

const EventScreen = ({navigation}) => {
   const [userData, setUserData] = useState(null);
   const [events, setEvents] = useState([]);
   const [loading, setLoading] = useState(true);

  

   useEffect(()=>{
    const getTickets = async() =>{
        try{
            const userId = await AsyncStorage.getItem('userId');
            const tickets = await AxiosInstance().get(`/tickets/getTicket/${userId}`);
            setUserData(tickets.data.user);
            setEvents(tickets.data.events);
            setLoading(false);

        }catch(e){
            console.log('Lấy vé thất bại: ', e);
        } finally {
          setLoading(false);
        }
    };
    getTickets();
}, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#007BFF" />;
      }
  return (
    <View style = {{flex: 1}}>
        <View style={styles.header}>
          <StatusBar animated backgroundColor={appColors.primary} />
          <RowComponent styles = {{columnGap: 25}}>
              <Text style = {styles.headerTitle} >Vé của tôi</Text>
          </RowComponent>
        </View>
                <FlatList
                  data={events.reverse()}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    return (
                      <View style={{ padding: 16, backgroundColor: 'white', marginBottom: 10, borderRadius: 8 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
                        <Text>📅 Ngày: {item.eventDate}</Text>
                        <Text>🎟 Số vé: {item.tickets.length}</Text>
                        <TouchableOpacity
                          style={{
                            marginTop: 10,
                            padding: 10,
                            backgroundColor: appColors.primary,
                            borderRadius: 5,
                            alignItems: 'center',
                          }}
                          onPress={() => navigation.navigate('ListTicket', { event: item, user: userData })}
                        >
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>Xem chi tiết vé</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />
    </View>
  );
};

export default EventScreen;

const styles = StyleSheet.create({
  header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
          backgroundColor: appColors.primary,
          paddingTop: Platform.OS === 'ios' ? 66 : 22
        },
  headerTitle: {
          color: appColors.white2,
          fontSize: 22,
          fontWeight: '500'
  },
});
