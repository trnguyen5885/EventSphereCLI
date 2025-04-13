import { StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, Image, Pressable } from 'react-native';
import React, { useState } from 'react';
import { ButtonComponent } from '@/app/components';
import AddEventHeaderComponent from '@/app/components/AddEventHeaderComponent';

// Danh sách thể loại sự kiện
const EVENT_CATEGORIES = [
  'Âm nhạc', 'Hội thảo', 'Thể thao', 'Nghệ thuật', 'Công nghệ', 'Giải trí', 'Sức khỏe'
];

const AddEventInfo = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Xử lý chọn thể loại sự kiện
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  return (
    <ScrollView>
      <Pressable style={styles.container} onPress={() => setIsDropdownOpen(false)}>
        
        <AddEventHeaderComponent currentStep={1} />

        {/* Chọn ảnh nền và logo sự kiện */}
        <View style={styles.sectionContainer}>
          {['Thêm ảnh nền sự kiện', 'Thêm logo sự kiện'].map((title, index) => (
            <TouchableOpacity key={index} style={styles.imageUploadContainer}>
              <Image source={require('../../../assets/images/event_background_example.png')} />
              <View style={styles.imageUploadTextContainer}>
                <Text style={styles.imageUploadTitle}>{title}</Text>
                <Text style={styles.imageUploadSize}>(1280x720)</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nhập thông tin sự kiện */}
        <View style={styles.sectionContainer}>
          {['Tên sự kiện', 'Tên địa điểm', 'Tỉnh/Thành', 'Quận/Huyện', 'Phường/Xã', 'Số nhà/Đường'].map((label, index) => (
            <View key={index}>
              <Text style={styles.inputLabel}>{label}</Text>
              <TextInput style={styles.inputField} placeholder={label} />
            </View>
          ))}
        </View>

        {/* Chọn thể loại sự kiện */}
        <View style={styles.sectionContainer}>
          <Text style={styles.inputLabel}>Thể loại sự kiện</Text>
          <TouchableOpacity style={styles.inputField} onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
            <Text style={{ fontSize: 16, paddingVertical:10, color: selectedCategory ? '#000' : '#999' }}>
              {selectedCategory || 'Chọn thể loại'}
            </Text>
          </TouchableOpacity>
          {isDropdownOpen && (
            <View style={styles.dropdownList}>
              {EVENT_CATEGORIES.map((item) => (
                <TouchableOpacity key={item} style={styles.dropdownItem} onPress={() => handleSelectCategory(item)}>
                  <Text style={styles.dropdownText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Mô tả sự kiện */}
        <View style={styles.sectionContainer}>
          <Text style={styles.inputLabel}>Thông tin sự kiện</Text>
          <TextInput style={styles.inputField} placeholder='Mô tả thông tin sự kiện' />
        </View>

        {/* Thông tin ban tổ chức */}
        <View style={styles.sectionContainer}>
          <Text style={styles.inputLabel}>Tên ban tổ chức</Text>
          <TextInput style={styles.inputField} placeholder='Tên ban tổ chức' />
          <Text style={styles.inputLabel}>Thông tin ban tổ chức</Text>
          <TextInput style={[styles.inputField, { height: 170 }]} placeholder='Thông tin ban tổ chức' />
          <TouchableOpacity style={[styles.imageUploadContainer, { backgroundColor: 'grey', height: 170 }]} />
        </View>

        {/* Nút điều hướng */}
        <View style={styles.buttonContainer}>
          <ButtonComponent type='primary' text='ĐẶT LẠI' textColor='black' color='white' styles={{ borderWidth: 1, width: 150 }} />
          <ButtonComponent type='primary' text='TIẾP' styles={{ width: 200 }} />
        </View>
      </Pressable>
    </ScrollView>
  );
};

export default AddEventInfo;

const styles = StyleSheet.create({
  container: {
    flex:1,
    paddingVertical: 50,
    paddingHorizontal: 14,
    backgroundColor: '#FCFCFC',
  },
  sectionContainer: {
    borderRadius: 30,
    borderColor: '#5669FF',
    borderWidth: 2,
    padding: 20,
    marginVertical: 10,
  },
  imageUploadContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  imageUploadTextContainer: {
    marginVertical: 30,
    alignItems: 'center',
  },
  imageUploadTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  imageUploadSize: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  inputField: {
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 15,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  dropdownList: {
    marginTop: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
});