import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ImageUploader = ({ label, image, images, onUpload, onDelete, multiple = false }) => {
  const renderSingleImage = () => (
    <View style={styles.imageWrapper}>
      <Image source={{uri: image}} style={styles.image} />
      {onDelete && (
        <TouchableOpacity style={styles.deleteIcon} onPress={onDelete}>
          <Icon name="times-circle" size={22} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMultipleImages = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagesContainer}>
      {images.map((item, index) => (
        <View key={index} style={styles.imageWrapper}>
          <Image source={{uri: item}} style={styles.image} />
          {onDelete && (
            <TouchableOpacity style={styles.deleteIcon} onPress={() => onDelete(index)}>
              <Icon name="times-circle" size={22} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={onUpload}>
        <Icon name="cloud-upload" size={18} color="#fff" style={styles.uploadIcon} />
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
  container: {
    marginBottom: 24,
  },
  label: {
    fontWeight: '500',
    marginBottom: 8,
    fontSize: 16,
    color: '#222',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
  imagesContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    marginRight: 4,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  deleteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 2,
    zIndex: 10,
  },
});