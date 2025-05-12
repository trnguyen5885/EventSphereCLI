import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ImageUploader = ({ label, image, images, onUpload, onDelete, multiple = false }) => {
  const renderSingleImage = () => (
    <View style={styles.imageWrapper}>
      <Image source={{uri: image}} style={styles.image} />
      {onDelete && (
        <TouchableOpacity style={styles.deleteIcon} onPress={onDelete}>
          <Icon name="close" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMultipleImages = () => (
    <FlatList
      data={images}
      horizontal
      keyExtractor={(item, index) => index.toString()}
      renderItem={({item, index}) => (
        <View style={styles.imageWrapper}>
          <Image source={{uri: item}} style={styles.image} />
          {onDelete && (
            <TouchableOpacity style={styles.deleteIcon} onPress={() => onDelete(index)}>
              <Icon name="close" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );

  return (
    <View style={{marginBottom: 20}}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={onUpload}>
        <Text style={styles.uploadText}>Chọn ảnh</Text>
      </TouchableOpacity>
      {multiple ? (
        images?.length > 0 && renderMultipleImages()
      ) : (
        image && renderSingleImage()
      )}
    </View>
  );
};

export default ImageUploader;

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#AAA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
  },
  uploadText: {
    color: '#333',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  deleteIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 2,
    zIndex: 10,
  },
});
