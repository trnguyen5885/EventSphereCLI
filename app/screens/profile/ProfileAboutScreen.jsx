import { FlatList, StyleSheet, Text, View, Image, } from 'react-native'
import React from 'react'
import ProfileHeader from './ProfileHeader'
import { ButtonComponent, RowComponent } from '../../components'
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import PagerView from 'react-native-pager-view';

const detailButtons = [
  {
    title: 'ABOUT'
  },
  {

    title: 'EVENT'
  },
  {

    title: 'REVIEWS'
  }
];

const aboutData = 'Enjoy your favorite dishe and a lovely your friends and family and have a great time. Food from local food trucks will be available for purchase. ';

const eventData = [
  {
    id: 1,
    title: 'A virtual evening of smooth jazz',
    date: '1ST MAY-SAT - 2:00PM',
    image: require('../../../assets/images/EventData_image1.png'),
  },
  {
    id: 2,
    title: 'Jo malone london’s mother’s day ',
    date: '1ST MAY-SUN - 7:00PM',
    image: require('../../../assets/images/EventData_image2.png'),
  },
  {
    id: 3,
    title: 'Women’s leadership conference',
    date: '1ST MAY-MON - 6:00PM',
    image: require('../../../assets/images/EventData_image3.png'),
  },
  {
    id: 4,
    title: 'A virtual evening of smooth jazz',
    date: '1ST MAY-SAT - 2:00PM',
    image: require('../../../assets/images/EventData_image1.png'),
  },
  {
    id: 5,
    title: 'Jo malone london’s mother’s day ',
    date: '1ST MAY-SUN - 7:00PM',
    image: require('../../../assets/images/EventData_image2.png'),
  },
  {
    id: 6,
    title: 'Women’s leadership conference',
    date: '1ST MAY-MON - 6:00PM',
    image: require('../../../assets/images/EventData_image3.png'),
  },
];

const reviewData = [
  {
    id: 1,
    avt: require('../../../assets/images/reviewData_avt1.png'),
    name: 'Jane Doe',
    rating: 4,
    date: '10 Feb',
    comment: 'Cinemas is the ultimate experience to see new movies in Gold Class or Vmax. Find a cinema near you.'
  },
  {
    id: 2,
    avt: require('../../../assets/images/reviewData_avt1.png'),
    name: 'Acheron',
    rating: 4,
    date: '12 Feb',
    comment: 'Cinemas is the ultimate experience to see new movies in Gold Class or Vmax. Find a cinema near you.'
  },
  {
    id: 3,
    avt: require('../../../assets/images/reviewData_avt1.png'),
    name: 'Black Swain',
    rating: 4,
    date: '15 Feb',
    comment: 'Cinemas is the ultimate experience to see new movies in Gold Class or Vmax. Find a cinema near you.'
  },
  {
    id: 4,
    avt: require('../../../assets/images/reviewData_avt1.png'),
    name: 'Jane Doe',
    rating: 4,
    date: '10 Feb',
    comment: 'Cinemas is the ultimate experience to see new movies in Gold Class or Vmax. Find a cinema near you.'
  },
  {
    id: 5,
    avt: require('../../../assets/images/reviewData_avt1.png'),
    name: 'Acheron',
    rating: 4,
    date: '12 Feb',
    comment: 'Cinemas is the ultimate experience to see new movies in Gold Class or Vmax. Find a cinema near you.'
  },
  {
    id: 6,
    avt: require('../../../assets/images/reviewData_avt1.png'),
    name: 'Black Swain',
    rating: 4,
    date: '15 Feb',
    comment: 'Cinemas is the ultimate experience to see new movies in Gold Class or Vmax. Find a cinema near you.'
  }
];
const ProfileAboutScreen = () => {
  const [selectedItem, setSelectedItem] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  return (
    <View style={styles.container}>
      <View style={styles.headerButtonContainer}>
        <ButtonComponent
          icon={<Ionicons name="arrow-back" size={22} color="black" />}
          iconFlex='left'
          type='primary'
          styles={styles.headerButtons}
        />
        <ButtonComponent
          type='primary'
          icon={<Entypo name="dots-three-vertical" size={18} color="black" />}
          iconFlex='right'
          styles={styles.headerButtons}
        />
      </View>
      <ProfileHeader />
      <View style={styles.editBtnContainer}>
        <ButtonComponent
          text='Follow'
          textStyles={{ fontSize: 16, color: 'white', margin: 0 }}
          icon={<AntDesign name="adduser" size={20} color="white" />}
          iconFlex='left'
          type='primary'
          styles={styles.followBtn}
        />
        <ButtonComponent
          text='Message'
          textStyles={{ fontSize: 16, color: '#5669FF', margin: 0 }}
          icon={<Feather name="message-circle" size={20} color="#5669FF" />}
          iconFlex='left'
          type='primary'
          styles={styles.messageBtn}
        />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.tabContainer}>
          {detailButtons.map((item, index) => (
            <View key={index}>
              <ButtonComponent
                type='primary'
                text={item.title}
                textStyles={[
                  styles.itemText,
                  selectedItem == index && { color: '#5669FF', justifyContent: 'center', alignItems: 'center' }
                ]}
                styles={styles.detailBtn}
                onPress={() => setSelectedItem(index)}
              />
              <View style={styles.placeHolderLine}>
                {selectedItem == index && <View style={styles.line}></View>}
              </View>
            </View>
          ))}
        </View>



        <PagerView
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={(e) => setSelectedItem(e.nativeEvent.position)}
        >
          <View key="1" style={styles.page}>
            <Text>{aboutData} <Text style={{color:'#5669FF'}} onPress={()=>console.log('si dep trai')}>Read more</Text></Text>
          </View>
          <View key="2" style={styles.page}>
            <FlashList
              data={eventData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.eventItem}>
                  <View>
                    <Image style={styles.eventImage} source={item.image}></Image>
                  </View>
                  <View style={styles.eventContent}>
                    <Text style={styles.eventItemDate}>{item.date}</Text>
                    <Text style={styles.eventItemTitle}>{item.title}</Text>
                  </View>
                </View>
              )}
            />
          </View>


          <View key="3" style={styles.page}>
            <FlatList
              data={reviewData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.reviewItem}>
                  <View style={styles.reviewItemAvt}>
                    <Image source={item.avt}></Image>
                  </View>
                  <View style={styles.reviewItemContent}>
                    <Text style={styles.reviewItemName}>{item.name}</Text>
                    <View style={styles.reviewItemRating}>
                        {Array.from({ length: item.rating }).map((_, index) => (
                            <Text key={index} style={styles.reviewItemStar}>⭐</Text>
                        ))}
                    </View>
                    <Text style={styles.reviewItemComment}>{item.comment}</Text>
                  </View>
                  <View style={styles.reviewItemDate}>
                    <Text style={styles.reviewItemDateText}>{item.date}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </PagerView>

      </View>
    </View>
  )
}

export default ProfileAboutScreen

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  headerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  headerButtons: {
    width: 50,
    backgroundColor: 'white',
    boxShadow: 'none',
  },

  editBtnContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 21
  },
  followBtn: {
    width: 170,
    height: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: '#5669FF',
    borderWidth: 2.5,
    borderRadius: 10,
    backgroundColor: '#5669FF'
  },
  messageBtn: {
    width: 170,
    height: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: '#5669FF',
    borderWidth: 2.5,
    borderRadius: 10,
    backgroundColor: 'white',

  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailBtn: {
    height: 20,
    width: 'auto',
    boxShadow: 'none',
    backgroundColor: 'none',
    marginBottom: 10,
    paddingRight: 5,
    paddingLeft: 5
  },
  itemText: {
    fontSize: 16,
    color: '#747688',
    textAlign: 'center'
  },
  placeHolderLine: {
    width: '100%',
    height: 2,
  },
  line: {
    width: '100%',
    height: 2,
    backgroundColor: '#5669FF',
    borderColor: '#5669FF',
    borderWidth: 2,
    borderRadius: 10,

  },
  pagerView: {
    flex: 1,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 10,
  },
  page: {

  },
  eventItem: {
    flexDirection: 'row',
    padding: 10,
    flex: 1
  },
  eventImage: {
    borderRadius: 10,
    height: 100,
    width: 80
  },
  eventContent: {
    marginLeft: 10,
    paddingVertical: 10,
  },
  eventItemDate: {
    fontSize: 12,
    color: '#5669FF',
    fontWeight: 'bold'
  },
  eventItemTitle: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    width: '80%',
  },
  reviewItem: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  reviewItemAvt: {
    width: '10%',
  },
  reviewItemContent: {
    width: '75%',
    paddingHorizontal: 10,
  },
  reviewItemDate: {
    width: '15%',
  },
  reviewItemName: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
  reviewItemRating:{
    flexDirection:'row'
  },
  reviewItemStar: {
    marginRight: 5,
  },
  reviewItemComment: {
    fontSize: 15,
  },
  reviewItemDateText: {
    fontSize: 15,
    color: '#ADAFBB'
  },
})