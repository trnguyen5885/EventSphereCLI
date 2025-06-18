import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AxiosInstance } from '../../../services';
import { EventModel } from '@/app/models';
import { TextComponent } from '../../../components';
import EventItem from '../../../components/EventItem';

interface PopularEventsScreenProps {
    handleInteraction: (id: string) => Promise<void>;
    navigation: any;
}

const PopularEventsScreen = ({ handleInteraction, navigation }: PopularEventsScreenProps) => {
    const [popularEvents, setPopularEvents] = useState<EventModel[]>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getPopularEvents = async () => {
            try {
                setIsLoading(true);
                const res = await AxiosInstance().get<EventModel[], any>(
                    'interactions/topViewed',
                );
                setPopularEvents(res);
                setIsLoading(false);
            } catch (e) {
                console.log("Error fetching popular events: ", e);
                setIsLoading(false);
            }
        };
        getPopularEvents();

        return () => {
            setPopularEvents([]);
        };
    }, []);

    if (isLoading) {
        return <Text>Loading Popular Events...</Text>;
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <FlatList
                data={popularEvents}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <EventItem
                        onPress={() => {
                            handleInteraction(item._id);
                            navigation.navigate('Detail', {
                                id: item.eventId,
                            });
                        }}
                        type="card"
                        item={item}
                        styles={{width: '94%'}}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

export default PopularEventsScreen

const styles = StyleSheet.create({}) 