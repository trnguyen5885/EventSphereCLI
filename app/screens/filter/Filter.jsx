import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  TextInput, FlatList
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DatePicker from 'react-native-date-picker';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

// Danh sách thể loại
const categories = [
  { id: '1', label: 'Sports', icon: <FontAwesome name="soccer-ball-o" size={30} /> },
  { id: '2', label: 'Music', icon: <Ionicons name="musical-notes" size={30} /> },
  { id: '3', label: 'Art', icon: <MaterialIcons name="palette" size={30} /> },
  { id: '4', label: 'Food', icon: <Ionicons name="restaurant" size={30} /> },
];

const vietnamProvinces = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh",
  "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau",
  "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên",
  "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh",
  "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa",
  "Kiên Giang", "Kon Tum", "Lai Châu", "Lạng Sơn", "Lào Cai", "Lâm Đồng",
  "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ",
  "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
  "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang",
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];


const Filter = ({ onClose }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [date, setDate] = useState(new Date());
  const [openCalendar, setOpenCalendar] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const typingTimeout = useRef(null);
  const navigation = useNavigation();
  const toggleCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
    );
  };

  const renderCategory = ({ item }) => {
    const isActive = selectedCategories.includes(item.id);
    return (
      <TouchableOpacity onPress={() => toggleCategory(item.id)} style={styles.categoryItem}>
        <View style={[styles.iconCircle, isActive && styles.iconCircleActive]}>
          {React.cloneElement(item.icon, { color: isActive ? '#fff' : '#6B7280' })}
        </View>
        <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const removeVietnameseTones = (str) => {
    return str.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove diacritics
      .replace(/đ/g, "d").replace(/Đ/g, "D");
  };

  const handleLocationInput = (text) => {
    setLocationInput(text);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      const normalizedInput = removeVietnameseTones(text.toLowerCase());

      const filtered = vietnamProvinces.filter(province => {
        const normalizedProvince = removeVietnameseTones(province.toLowerCase());
        return normalizedProvince.includes(normalizedInput);
      });

      setLocationSuggestions(filtered);
    }, 300);
  };


  const handleResetFilters = () => {
    // setSelectedCategories([]);
    // setSelectedTime('');
    // setDate(new Date());
    // setLocationInput('');
    // setLocationSuggestions([]);
    // setMinPrice('');
    // setMaxPrice('');
  };

  const handleApplyFilters = () => {
    navigation.navigate('FiltedEventScreen', {
      selectedCategories,
      selectedTime,
      selectedDate: date,
      locationInput,
      minPrice,
      maxPrice,
    });
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Filter</Text>

        {/* ----- Danh mục thể loại ----- */}
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4, marginBottom: 15 }}
        />

        {/* ----- Thời gian ngắn ----- */}
        <Text style={styles.label}>Time & Date</Text>
        <View style={styles.row}>
          {['Tomorrow', 'Today', 'This week'].map((item) => {
            const isActive = selectedTime === item;
            return (
              <TouchableOpacity
                key={item}
                style={isActive ? styles.pillActive : styles.pill}
                onPress={() => setSelectedTime(item)}
              >
                <Text style={isActive ? styles.pillTextActive : styles.pillText}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ----- Chọn từ lịch ----- */}
        <TouchableOpacity style={styles.calendarButton} onPress={() => setOpenCalendar(true)}>
          <Ionicons name="calendar" size={24} color="#6366f1" />
          <Text style={styles.calendarText}>
            {date ? date.toDateString() : 'Choose from calendar'}
          </Text>
          <FontAwesome name="chevron-right" size={17} color="#6366f1" />
        </TouchableOpacity>

        <DatePicker
          modal
          mode="date"
          open={openCalendar}
          date={date}
          onConfirm={(selectedDate) => {
            setOpenCalendar(false);
            setDate(selectedDate);
          }}
          onCancel={() => setOpenCalendar(false)}
        />

        {/* ----- Nhập vị trí ----- */}
        <Text style={styles.label}>Location</Text>
        <TextInput
          placeholder="Enter a location"
          value={locationInput}
          onChangeText={handleLocationInput}
          style={styles.textInput}
        />
        {locationSuggestions.length > 0 && (
          <FlatList
            data={locationSuggestions}
            keyExtractor={(item, index) => index.toString()}
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setLocationInput(item);
                  setLocationSuggestions([]);
                }}
                style={styles.suggestionItem}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        )}


        {/* ----- Khoảng giá ----- */}
        <Text style={styles.label}>Select price range</Text>
        <View style={styles.priceRow}>
          <TextInput
            placeholder="Từ"
            keyboardType="numeric"
            value={minPrice}
            onChangeText={(text) => setMinPrice(text.replace(/[^0-9]/g, ''))}
            style={styles.priceInput}
          />
          <TextInput
            placeholder="Đến"
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={(text) => setMaxPrice(text.replace(/[^0-9]/g, ''))}
            style={styles.priceInput}
          />
        </View>

        {/* ----- Nút hành động ----- */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
            <Text style={{ fontWeight: 'bold' }}>RESET</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilters}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>APPLY</Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
};

export default Filter;


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  // ========== Category ==========
  categoryItem: { alignItems: 'center', marginRight: 20 },
  iconCircle: { backgroundColor: '#E5E7EB', padding: 15, borderRadius: 50, marginBottom: 6 },
  iconCircleActive: { backgroundColor: '#6366f1' },
  categoryLabel: { fontSize: 16, color: '#6B7280' },
  categoryLabelActive: { color: '#111827', fontWeight: '600' },

  // ========== Time & Date ==========
  row: { flexDirection: 'row', marginBottom: 15 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  pill: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'grey',
  },
  pillActive: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  pillText: { color: '#111827' },
  pillTextActive: { color: '#fff', fontWeight: 'bold' },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  calendarText: {
    marginHorizontal: 10,
    color: '#6B7280',
    fontSize: 16,
  },

  // ========== Location ==========
  textInput: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  suggestionList: {
    maxHeight: 150,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 20,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  suggestionText: {
    color: '#111827',
  },

  // ========== Price ==========
  priceRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  priceInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
  },

  // ========== Buttons ==========
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  resetButton: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  applyButton: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
});
