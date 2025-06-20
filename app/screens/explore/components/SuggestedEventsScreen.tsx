import { StyleSheet, View, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { EventModel } from '@/app/models';
import { globalStyles } from '../../../constants/globalStyles';
import { appColors } from '../../../constants/appColors';
import { RowComponent, TextComponent } from '../../../components';
import { ArrowRight2 } from 'iconsax-react-native';
import EventItem from '../../../components/EventItem';
import { AxiosInstance } from '../../../services';
import BannerComponent from '../components/BannerComponent';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

interface SuggestedEventsScreenProps {
  populateEvents: EventModel[] | undefined;
  handleInteraction: (id: string) => Promise<void>;
  navigation: any;
}

const EventSection = ({
  title,
  data,
  onPressMore,
  onPressItem,
}: {
  title: string;
  data?: EventModel[];
  onPressMore?: () => void;
  onPressItem: (item: EventModel) => void;
}) => {
  if (!data || data.length === 0) return null;
  const tabBarHeight = useBottomTabBarHeight();
  return (
    <>
      <View
        style={[
          globalStyles.row,
          styles.paddingContent,
          { marginTop: 15, justifyContent: 'space-between' },
        ]}
      >
        <TextComponent text={title} size={18} title />
        <RowComponent onPress={onPressMore}>
          <TextComponent text="Xem thêm" size={16} color={appColors.gray} />
          <ArrowRight2 variant="Bold" size={14} color={appColors.gray} />
        </RowComponent>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <EventItem
            onPress={() => onPressItem(item)}
            type="card"
            item={item}
          />
        )}
      />
    </>
  );
};

const SuggestedEventsScreen = ({
  populateEvents,
  handleInteraction,
  navigation,
}: SuggestedEventsScreenProps) => {
  const [eventsIscoming, setEventsIscoming] = useState<EventModel[]>([]);
  const [eventsUpcoming, setEventsUpcoming] = useState<EventModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEvents = async () => {
    try {
      const response = await AxiosInstance().get<EventModel[]>('events/home');
      const now = Date.now();

      const ongoing = response.data.filter(
        (e: EventModel) => now >= e.timeStart && now <= e.timeEnd
      );
      const upcoming = response.data.filter((e: EventModel) => e.timeStart > now);

      setEventsIscoming(ongoing);
      setEventsUpcoming(upcoming);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    return () => {
      setEventsIscoming([]);
      setEventsUpcoming([]);
    };
  }, []);

  const onPressEvent = useCallback(
    (item: EventModel) => {
      handleInteraction(item._id);
      navigation.navigate('Detail', { id: item._id });
    },
    [handleInteraction, navigation]
  );

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 100 }} // 👈 tránh bị che
      showsVerticalScrollIndicator={false}
    >
      <BannerComponent bannerData={populateEvents || []} />
  
      <EventSection
        title="Sự kiện nổi bật"
        data={populateEvents}
        onPressItem={(item) => {
          handleInteraction(item._id);
          navigation.navigate('Detail', {
            id: item.eventId,
          });
        }}
      />
  
      <EventSection
        title="Sự kiện đang diễn ra"
        data={eventsIscoming}
        onPressItem={onPressEvent}
      />
  
      <EventSection
        title="Sự kiện sắp diễn ra"
        data={eventsUpcoming}
        onPressItem={onPressEvent}
      />
    </ScrollView>
  );
};

export default SuggestedEventsScreen;

const styles = StyleSheet.create({
  paddingContent: {
    paddingHorizontal: 12,
  },
});
