import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

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
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.selectBox}
      >
        <Text style={styles.selectText}>
          {selectedTags.length > 0
            ? selectedTags.join(', ')
            : 'Chọn tags'}
        </Text>
        <Icon name="chevron-down" size={14} color="#666" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Tags</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="times" size={20} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={defaultTags}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = selectedTags.includes(item);
                return (
                  <TouchableOpacity
                    onPress={() => toggleTag(item)}
                    style={[
                      styles.itemRow,
                      isSelected && styles.itemSelected,
                    ]}
                  >
                    <Text style={[styles.itemText, isSelected && styles.selectedText]}>{item}</Text>
                    {isSelected && <Icon name="check" size={16} color="#fff" style={styles.checkIcon} />}
                  </TouchableOpacity>
                );
              }}
            />
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TagsPicker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  selectText: {
    color: '#333',
    fontSize: 14,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemSelected: {
    backgroundColor: '#6366F1',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 10,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});