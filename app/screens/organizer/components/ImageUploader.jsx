import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ImageUploader = ({ 
  label, 
  image, 
  images, 
  onUpload, 
  onDelete, 
  multiple = false,
  imageType = 'standard' // 'standard', 'banner', 'avatar'
}) => {
  
  // Xác định style dựa trên loại ảnh
  const getImageStyle = () => {
    switch(imageType) {
      case 'banner':
        return styles.bannerImage;
      case 'avatar':
        return styles.avatarImage;
      default:
        return styles.standardImage;
    }
  };
  
  // Xác định style container dựa trên loại ảnh
  const getWrapperStyle = () => {
    switch(imageType) {
      case 'banner':
        return styles.bannerWrapper;
      case 'avatar':
        return styles.avatarWrapper;
      default:
        return styles.standardWrapper;
    }
  };

  // Xác định vị trí delete icon tùy theo loại ảnh
  const getDeleteIconStyle = () => {
    switch(imageType) {
      case 'banner':
      case 'avatar':
        return styles.deleteIconTopRight;
      default:
        return styles.deleteIcon;
    }
  };

  const renderSingleImage = () => (
    <View style={[styles.imageWrapper, getWrapperStyle()]}>
      <Image 
        source={{uri: image}} 
        style={[styles.image, getImageStyle()]} 
        resizeMode={imageType === 'banner' ? 'cover' : 'cover'}
      />
      {onDelete && (
        <TouchableOpacity 
          style={[styles.deleteButton, getDeleteIconStyle()]} 
          onPress={onDelete}
        >
          <Icon name="times-circle" size={22} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMultipleImages = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.imagesContainer}
    >
      {images.map((item, index) => (
        <View key={index} style={[styles.imageWrapper, styles.standardWrapper]}>
          <Image 
            source={{uri: item}} 
            style={[styles.image, styles.standardImage]} 
          />
          {onDelete && (
            <TouchableOpacity 
              style={[styles.deleteButton, styles.deleteIcon]} 
              onPress={() => onDelete(index)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
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
      <TouchableOpacity 
        style={styles.uploadButton} 
        onPress={onUpload}
        activeOpacity={0.8}
      >
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
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
    backgroundColor: '#f5f5f5',
  },
  // Style cho wrapper
  standardWrapper: {
    width: 120,
    height: 120,
    marginRight: 12,
  },
  bannerWrapper: {
    width: '100%',
    height: 140,
    marginBottom: 8,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 12,
  },
  // Style cho image
  image: {
    width: '100%',
    height: '100%',
  },
  standardImage: {
    borderRadius: 10,
  },
  bannerImage: {
    borderRadius: 8,
  },
  avatarImage: {
    borderRadius: 10,
  },
  // Style cho delete button
  deleteButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 3,
    zIndex: 10,
  },
  deleteIcon: {
    top: 8,
    right: 8,
  },
  deleteIconTopRight: {
    top: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});