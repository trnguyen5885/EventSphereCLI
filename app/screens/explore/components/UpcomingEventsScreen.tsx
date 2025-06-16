import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AxiosInstance } from '../../../services';
import { EventModel } from '@/app/models';
import { TextComponent } from '../../../components';
import EventItem from '../../../components/EventItem';

interface UpcomingEventsScreenProps {
    handleInteraction: (id: string) => Promise<void>;
    navigation: any;
}

const UpcomingEventsScreen = ({ handleInteraction, navigation }: UpcomingEventsScreenProps) => {
    const [upcomingEvents, setUpcomingEvents] = useState<EventModel[]>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getUpcomingEvents = async () => {
            try {
                setIsLoading(true);
                const response = await AxiosInstance().get<EventModel[], any>(
                    'events/all',
                );
                const now = Date.now();
                const filteredUpcomingEvents = response.filter(
                    (eventItem: EventModel) => eventItem.timeStart > now,
                );
                setUpcomingEvents(filteredUpcomingEvents);
                setIsLoading(false);
            } catch (e) {
                console.log("Error fetching upcoming events: ", e);
                setIsLoading(false);
            }
        };
        getUpcomingEvents();

        return () => {
            setUpcomingEvents([]);
        };
    }, []);

    if (isLoading) {
        return <Text>Loading Upcoming Events...</Text>;
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={upcomingEvents}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <EventItem
                        onPress={() => {
                            handleInteraction(item._id);
                            navigation.navigate('Detail', {
                                id: item._id,
                            });
                        }}
                        type="card"
                        item={item}
                    />
                )}
            />
        </View>
    )
}

export default UpcomingEventsScreen

const styles = StyleSheet.create({}) 