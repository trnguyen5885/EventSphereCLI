/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
  FlatList,
  ListRenderItemInfo,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { InputComponent, RowComponent } from '../../components';
import EventItem from '../../components/EventItem';
import { globalStyles } from '../../constants/globalStyles';
import { appColors } from '../../constants/appColors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AxiosInstance } from '../../services';
import { EventModel } from '@/app/models';

const EventSearch = ({ navigation }: any) => {
  const [values, setValues] = useState('');
  const [eventsSearch, setEventsSearch] = useState<EventModel[]>([]);

  const handleNavigation = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const getEventSearch = async () => {
      try {
        const response = await AxiosInstance().get<EventModel[]>(
          `events/search?query=${values}`,
        );
        setEventsSearch(response.data);
      } catch (e) {
        console.log(e);
      }
    };

    getEventSearch();

    return () => {
      setEventsSearch([]);
    };
  }, [values]);

  return (
    <View style={[globalStyles.container]}>
      <View style={styles.header}>
        <StatusBar animated backgroundColor={appColors.primary} />
        <RowComponent onPress={handleNavigation} styles={{ columnGap: 25, justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tìm kiếm</Text>
        </RowComponent>

        <InputComponent
          value={values}
          onChange={text => setValues(text)}
          placeholder="Nhập từ khoá..."
          allowClear
          customStyles={{ minHeight: 46 }}
          affix={
            <MaterialIcons name="search" size={24} color="rgba(0,0,0,0.5)" />
          }
        />
      </View>

      <FlatList
        data={eventsSearch}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
        keyExtractor={(item) => item._id}
        renderItem={({ item }: ListRenderItemInfo<EventModel>) => (
          <EventItem
            onPress={() => {
              navigation.navigate('Detail', {
                id: item._id,
              });
            }}
            type="card"
            styles={{
              flex: 1,
              padding: 10,
              marginVertical: 10,
            }}
            item={item}
          />
        )}
      />

    </View>
  );
};

export default EventSearch;

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    padding: 12,
    rowGap: 20,
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === 'ios' ? 66 : 22,
  },
  headerTitle: {
    color: appColors.white2,
    fontSize: 22,
    fontWeight: '500',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
