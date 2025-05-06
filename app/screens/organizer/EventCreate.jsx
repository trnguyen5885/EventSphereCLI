import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Button,
  Image,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';
import OrganizerHeaderComponent from '../../components/OrganizerHeaderComponent';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerComponent from './components/DateTimePickerComponent';
import CategoryPicker from './components/CategoryPicker';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';

const CLOUD_NAME = 'ddkqz5udn';
const UPLOAD_PRESET = 'DATN2025';

const EventCreate = () => {
  const [selectedTicketType, setSelectedTicketType] = useState('Paid');

  const [category, setCategory] = useState(null);

  const [avatarImage, setAvatarImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [eventImages, setEventImages] = useState([]);

  console.log("avatarImage", avatarImage);
  console.log("coverImage", coverImage);
  console.log("eventImages", eventImages);


  const handleSelectTicketType = (type) => {
    setSelectedTicketType(type);
  };

  const selectImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets) {
      return result.assets[0];
    }
    return null;
  };

  const selectImages = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 });
    if (!result.didCancel && result.assets) {
      return result.assets;
    }
    return [];
  };

  const uploadToCloudinary = async (image) => {
    const data = new FormData();
    data.append('file', {
      uri: image.uri,
      type: image.type,
      name: image.fileName,
    });
    data.append('upload_preset', UPLOAD_PRESET);
    data.append('cloud_name', CLOUD_NAME);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return res.data.secure_url;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  };


  const handleUploadAvatar = async () => {
    const image = await selectImage();
    if (image) {
      const url = await uploadToCloudinary(image);
      if (url) setAvatarImage(url);
    }
  };

  const handleUploadCover = async () => {
    const image = await selectImage();
    if (image) {
      const url = await uploadToCloudinary(image);
      if (url) setCoverImage(url);
    }
  };

  const handleUploadMultipleImages = async () => {
    const selectedImages = await selectImages();
    const uploadedUrls = [];
    for (const img of selectedImages) {
      const url = await uploadToCloudinary(img);
      if (url) uploadedUrls.push(url);
    }
    setEventImages(uploadedUrls);
  };



  return (
    <View style={styles.container}>

      <OrganizerHeaderComponent title="Create Event" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.form}
        >
          <Text style={styles.label}>Event Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter event name"
            placeholderTextColor="#A0A0A0"
          />

          <Text style={styles.label}>Short Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter short description"
            placeholderTextColor="#A0A0A0"
            multiline
          />

          <Text style={styles.label}>Detailed Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter detailed description"
            placeholderTextColor="#A0A0A0"
            multiline
          />

          <Text style={styles.label}>Category</Text>
          <TouchableOpacity style={styles.selectInput}>
            <Icon name="list" size={16} color="#555" style={styles.iconMargin} />
            {/* <CategoryPicker selectedCategory={category} onSelectCategory={setCategory} /> */}
          </TouchableOpacity>


          <Text style={styles.label}>Tags</Text>
          <TouchableOpacity style={styles.selectInput}>
            <Icon name="tags" size={16} color="#555" style={styles.iconMargin} />
            <TextInput
              placeholder="Nhập thẻ tag cách nhau bằng dấu phẩy"
              placeholderTextColor="#A0A0A0"
            />
          </TouchableOpacity>

          <Text style={styles.label}>Event Date & Time</Text>
          <DateTimePickerComponent />

          <Text style={styles.label}>Event Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Location"
            placeholderTextColor="#A0A0A0"
          />
        </KeyboardAvoidingView>

        <Text style={styles.label}>Event Location</Text>
        <View style={styles.mapPlaceholder} />

        <Text style={styles.label}>Cover Image</Text>
        <View style={styles.coverContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadCover}>
            <Text style={styles.uploadButtonText}>Upload Cover Image</Text>
          </TouchableOpacity>
          {coverImage && <Image source={{ uri: coverImage }} style={styles.previewImage} />}
        </View>

        <Text style={styles.label}>Avatar Image</Text>
        <View style={styles.coverContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadAvatar}>
            <Text style={styles.uploadButtonText}>Upload Avatar</Text>
          </TouchableOpacity>
          {avatarImage && <Image source={{ uri: avatarImage }} style={styles.previewImage} />}
        </View>

        <Text style={styles.label}>Event Images</Text>
        <View style={styles.coverContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadMultipleImages}>
            <Text style={styles.uploadButtonText}>Upload Images</Text>
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {eventImages.map((url, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: url }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    const updated = [...eventImages];
                    updated.splice(index, 1);
                    setEventImages(updated);
                  }}
                >
                  <Text style={styles.deleteText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

        </View>


        <Text style={styles.label}>Ticket Type</Text>
        <View style={styles.checkboxContainer}>
          {['Paid', 'Free', 'Donation'].map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.checkboxRow}
              onPress={() => handleSelectTicketType(type)}
            >
              <Icon
                name={selectedTicketType === type ? 'check-square' : 'square-o'}
                size={20}
                color={selectedTicketType === type ? '#6366F1' : '#999'}
              />
              <Text style={styles.checkboxLabel}>
                {type} Ticket
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View >
  );
};

export default EventCreate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginTop: 20,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  selectText: {
    fontSize: 14,
    color: '#999',
  },
  iconMargin: {
    marginRight: 8,
  },
  mapPlaceholder: {
    height: 150,
    borderRadius: 12,
    backgroundColor: '#EEE',
    marginBottom: 12,
  },
  coverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  uploadButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  coverImagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#DDD',
  },
  previewImage: {
    width: 60, height: 60, borderRadius: 8, backgroundColor: '#DDD', marginLeft: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: -1,
    backgroundColor: '#F87171',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 20,
  },
  
  checkboxContainer: {
    marginTop: 8,
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#222',
  },
});
