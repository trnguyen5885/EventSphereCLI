import { StyleSheet, Text, View, Image, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ButtonComponent, RowComponent, TextComponent } from '../../components'
import { ScrollView, TouchableOpacity } from 'react-native'
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileOrganizerHeader from './ProfileOrganizerHeader'
import { AxiosInstance } from '../../services';
import OrganizerHeaderComponent from '../../components/OrganizerHeaderComponent';

const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
};
const ProfileOrganizer = ({navigation}) => {
  const interest = ["Thể thao", "Âm nhạc", "Giải trí", "Kịch", "Hội thảo", "Khác"];
  return (
    <ScrollView showsVerticalScrollIndicator={true}
      contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <OrganizerHeaderComponent title="Event Management" />
        <ProfileOrganizerHeader/>
        
        <View style={styles.editBtnContainer}>
          <ButtonComponent
            text='Chỉnh sửa'
            textStyles={{ fontSize: 24, color: '#5669FF', margin: 0 }}
            icon={<MaterialCommunityIcons name="square-edit-outline" size={24} color="#5669FF" />}
            iconFlex='left'
            type='primary'
            styles={styles.editBtn}
            onPress={() => {
              navigation.navigate("ProfileEditOrganizer")
            }}
          />
        </View>
        <TextComponent
          text='Về tôi'
          textStyles={{ fontWeight: 'bold' }}
          styles={styles.aboutMeTitle} />
        <View style={styles.aboutMeContainer}>
          <View style={styles.aboutMeContentContainer}>
            <Text>
            Thưởng thức món ăn yêu thích của bạn và có một khoảng thời gian vui vẻ cùng bạn bè và gia đình của bạn.
             Thực phẩm từ xe tải thực phẩm địa phương sẽ có sẵn để mua.
             <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
              <Text style={{color:'#5669FF', height:15, alignItems:'center'}}> Thêm </Text>
              <Image source={require('../../../assets/images/Vector10.png')}></Image>
              </TouchableOpacity>
            </Text>
          </View>
        </View>


        <View>
          <View style={styles.interestContainer}>
            <TextComponent
              text='Quan tâm'
              styles={styles.interestText}
            />
          </View>
        </View>

        <View style={styles.interestBtnContainer}>
          {interest.map((item, index) => (
            <ButtonComponent
              key={index}
              text={item}
              type="primary"
              styles={[styles.interestBtn, { backgroundColor: getRandomColor() }]}
              textStyles={styles.interestTitle}
            />
          ))}
        </View>
      </View>
    </ScrollView>

  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "ios" ? 66 : 23,
  },
  backButtonContainer:{
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 20,
    boxShadow: 'none',
    borderBlockColor:'none'
  },
  backButton: {
    width: 100,
    backgroundColor: "white",
    boxShadow: 'none',
    
  },
  editBtnContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    marginTop:21
  },
  editBtn: {
    width: 154,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth:2.5,
    borderColor: '#5669FF',
    borderRadius: 8,
    backgroundColor:'white',
    paddingVertical:10
  },
  aboutMeContainer: {
    marginTop: 25,
  },
  aboutMeTitle: {
    fontSize: 18,
    lineHeight: 34,
    fontWeight:'bold'
  },
  aboutMeContent: {
    fontSize: 16,
    lineHeight: 25
  },
  aboutMeContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  readMoreBtn: {
    padding: 0,
    marginLeft: 8,
  },
  interestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20
  },
  interestText: {
    fontSize: 18,
    fontWeight:'bold'
  },
  changeBtn: {
    width: 'auto',
    minHeight: 10,
    flexDirection: 'row',
    backgroundColor: '#5669FF25',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 20,
    marginBottom:0,
    paddingBottom:7,
    paddingTop:7,
    paddingStart:14,
    paddingEnd:14
  },
  interestBtnContainer: {
    marginTop: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding:0

  },
  interestBtn: {
    minHeight:10,
    width:'auto',
    paddingBottom:7,
    paddingTop:7,
    paddingStart:15,
    paddingEnd:15,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    
  },
  interestTitle: {
    fontSize: 16,
    lineHeight: 25,
    color: '#ffffff',
    whiteSpace: 'nowrap'
  },
})

export default ProfileOrganizer;