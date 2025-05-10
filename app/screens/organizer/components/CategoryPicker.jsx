import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList, Modal } from 'react-native';
import axios from 'axios';
import { AxiosInstance } from '@/app/services';

const CategoryPicker = ({ selectedCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const axios = AxiosInstance(); // bạn có thể truyền token nếu cần: AxiosInstance(token)
        const res = await axios.get('/categories/all'); // đường dẫn từ baseURL của bạn
        setCategories(res.data);
      } catch (error) {
        console.error('Lỗi lấy danh mục:', error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCategories();
  }, []);

  const handleSelect = (item) => {
    onSelectCategory(item);
    setModalVisible(false);
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={{ marginBottom: 5 }}>Danh mục</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{ borderWidth: 1, padding: 10, borderRadius: 5 }}>
        <Text>{selectedCategory?.name || 'Chọn danh mục'}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#00000088' }}>
          <View style={{ backgroundColor: '#fff', margin: 20, borderRadius: 10, padding: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Chọn danh mục</Text>
            {loading ? (
              <ActivityIndicator size="large" />
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => item.data.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ padding: 10, borderBottomWidth: 1 }}
                    onPress={() => handleSelect(item)}>
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoryPicker;
