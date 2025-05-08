import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';
import AxiosInstance from '../../../services/api/AxiosInstance';

const CategoryPicker = ({ selectedCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await AxiosInstance().get('categories/all');
        setCategories(res.data); // ✅ Đảm bảo lấy đúng data nếu có res.data.data
        console.log('Danh mục:', res.data);
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
      <Text style={{ marginBottom: 6 }}>Danh mục</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.selectBox}
      >
        <Text>
          {selectedCategory?.name || 'Chọn danh mục'}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn danh mục</Text>

            {loading ? (
              <ActivityIndicator size="large" />
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => {
                  const isSelected = selectedCategory?._id === item._id;
                  return (
                    <TouchableOpacity
                      onPress={() => handleSelect(item)}
                      style={[
                        styles.categoryItem,
                        isSelected && styles.categoryItemSelected,
                      ]}
                    >
                      <Text style={{ color: isSelected ? '#fff' : '#000' }}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoryPicker;

const styles = StyleSheet.create({
  selectBox: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: '#DDD',
    backgroundColor: '#FAFAFA',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
  },
  modalContent: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#EEE',
    borderRadius: 5,
  },
  categoryItemSelected: {
    backgroundColor: '#6366F1',
  },
  closeButton: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
});
