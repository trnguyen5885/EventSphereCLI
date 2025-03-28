import { StyleSheet, Text, View, Platform,StatusBar,FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import  Ionicons  from 'react-native-vector-icons/Ionicons';
import { InputComponent, RowComponent } from '../../components';
import EventItem from '../../components/EventItem';
import { globalStyles } from '../../constants/globalStyles';
import { appColors } from '../../constants/appColors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AxiosInstance } from '../../services/api/AxiosInstance';

const EventSearch = ({navigation}) => {

  const [values, setValues] = useState("");
  const [eventsSearch, setEventsSearch] = useState([]);

  const handleNavigation = () => {
    navigation.goBack();
  };

  useEffect(() => {
    
    const getEventSearch = async () => {
      try {
        const response = await AxiosInstance().get(`events/search?query=${values}`);
        setEventsSearch(response.data);
      } catch(e) {
        console.log(e);
      }
    };

    getEventSearch();

    return () => {
      setEventsSearch([]);
    };
  },[values]);

  return (
    <View style={[globalStyles.container]} >
      <View style={styles.header}>
            <StatusBar animated backgroundColor={appColors.primary} />
            <RowComponent onPress={handleNavigation} styles = {{columnGap: 25}}>
                <Ionicons name="chevron-back" size={26} color="white" />
            
                <Text style = {styles.headerTitle} >Tìm kiếm</Text>
            </RowComponent>

              <InputComponent
                value={values}
                onChange={(text) => setValues(text)}
                placeholder='Nhập từ khoá...'
                allowClear
                customStyles={{minHeight: 46}}
                affix={<MaterialIcons name="search" size={24} color="rgba(0,0,0,0.5)" />}
            />
      </View>

      <FlatList
          data={eventsSearch}
          renderItem={({ item }) => <EventItem onPress={() => {
            navigation.navigate("Detail", {
              id: item._id
            });
          }} type="card" styles={{width: "95%"}} item={item} />}
      />
    </View>
  );
};

export default EventSearch;

const styles = StyleSheet.create({
  header:
  {
          alignItems: "flex-start",
          padding: 12,
          rowGap: 20,
          backgroundColor: appColors.primary,
          paddingTop: Platform.OS === "ios" ? 66 : 22
  },
  headerTitle: {
    color: appColors.white2,
    fontSize: 22,
    fontWeight: "500"
  },
});