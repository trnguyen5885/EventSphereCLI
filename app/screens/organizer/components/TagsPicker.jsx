import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const defaultTags = [
  'Lễ hội', 'Âm nhạc', 'Công nghệ', 'Giải trí', 'Thể thao',
  'Hội thảo', 'Startup', 'Lịch sử', 'Thời trang', 'Ẩm thực', 
  'Jack', 'Jack 3 con', 'Dách', 'J97', 'Fandom',
];

const TagsPicker = ({ selectedTags = [], onChangeTags }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onChangeTags(selectedTags.filter(t => t !== tag));
    } else {
      onChangeTags([...selectedTags, tag]);
    }
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={{ marginBottom: 6 }}>Tags</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.selectBox}
      >
        <Text>
          {selectedTags.length > 0
            ? selectedTags.join(', ')
            : 'Chọn tags'}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn Tags</Text>
            <FlatList
              data={defaultTags}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = selectedTags.includes(item);
                return (
                  <TouchableOpacity
                    onPress={() => toggleTag(item)}
                    style={[
                      styles.tagItem,
                      isSelected && styles.tagItemSelected,
                    ]}
                  >
                    <Text style={{ color: isSelected ? '#fff' : '#000' }}>{item}</Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TagsPicker;

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
  tagItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  tagItemSelected: {
    backgroundColor: '#6366F1',
  },
  closeButton: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
});
