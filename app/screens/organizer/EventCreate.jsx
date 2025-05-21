import React, { useEffect, useState } from 'react';
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
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';
import OrganizerHeaderComponent from '../../components/OrganizerHeaderComponent';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePickerComponent from './components/DateTimePickerComponent';
import CategoryPicker from './components/CategoryPicker';
import TagsPicker from './components/TagsPicker';
import ImageUploader from './components/ImageUploader';
import AddressSelector from './components/AddressSelector';

import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AxiosInstance } from '../../services';


const CLOUD_NAME = 'ddkqz5udn';
const UPLOAD_PRESET = 'DATN2025';

const EventCreate = () => {

  const userId = useSelector(state => state.auth.userId);

  const [timeStart, setTimeStart] = useState(null);
  const [timeEnd, setTimeEnd] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTicketType, setSelectedTicketType] = useState('Paid');

  const [category, setCategory] = useState(null);

  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [images, setImages] = useState([]);

  const [tags, setTags] = useState([]);


  const [address, setAddress] = useState({
    provinces: [],
    districts: [],
    wards: [],
    selectedProvince: null,
    selectedDistrict: null,
    selectedWard: null,
    street: '',
  });
  const [location, setLocation] = useState(null);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [ticketPrice, setTicketPrice] = useState(0);
  const [ticketQuantity, setTicketQuantity] = useState(1000);

  const getCoordinatesFromAddress = async address => {
    try {
      const response = await axios.get('https://rsapi.goong.io/Geocode', {
        params: {
          address: address,
          api_key: 'pJ2xud8j3xprqVfQZLFKjGV51MPH60VjRuZh1i3F',
        },
      });

      const location = response.data?.results?.[0]?.geometry?.location;
      if (location) {
        const { lat, lng } = location;
        return { latitude: lat, longitude: lng };
      } else {
        throw new Error('Không tìm thấy tọa độ cho địa chỉ');
      }
    } catch (error) {
      console.error('Lỗi khi lấy tọa độ:', error.message);
      return null;
    }
  };

  const handleSelectTicketType = type => {
    setSelectedTicketType(type);
    console.log('Selected ticket type:', type);

  };

  const selectImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets) {
      return result.assets[0];
    }
    return null;
  };

  const selectImages = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 0,
    });
    if (!result.didCancel && result.assets) {
      return result.assets;
    }
    return [];
  };

  const uploadToCloudinary = async image => {
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
        { headers: { 'Content-Type': 'multipart/form-data' } },
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
      if (url) setAvatar(url);
    }
  };

  const handleUploadCover = async () => {
    const image = await selectImage();
    if (image) {
      const url = await uploadToCloudinary(image);
      if (url) setBanner(url);
    }
  };

  const handleUploadMultipleImages = async () => {
    const selectedImages = await selectImages();
    const uploadedUrls = [];
    for (const img of selectedImages) {
      const url = await uploadToCloudinary(img);
      if (url) uploadedUrls.push(url);
    }
    setImages(uploadedUrls);
  };

  const handleSubmit = async () => {
    // Lấy tọa độ từ địa chỉ trước khi tạo sự kiện
    const fullAddress = `${address.street}, ${address.selectedWard?.label}, ${address.selectedDistrict?.label}, ${address.selectedProvince?.label}`;

    // Kiểm tra nếu địa chỉ đã được chọn đầy đủ
    if (!address.selectedProvince || !address.selectedDistrict || !address.selectedWard || !address.street) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin địa chỉ');
      return;
    }

    try {
      // Hiển thị thông báo đang xử lý
      Alert.alert('Thông báo', 'Đang xử lý địa chỉ và tạo sự kiện...');

      // Lấy tọa độ từ địa chỉ
      const coordinates = await getCoordinatesFromAddress(fullAddress);

      if (!coordinates) {
        Alert.alert('Lỗi', 'Không thể lấy tọa độ từ địa chỉ. Vui lòng kiểm tra lại thông tin địa chỉ.');
        return;
      }

      // Cập nhật tọa độ và địa chỉ
      const locationData = fullAddress;

      // Tiếp tục với việc tạo sự kiện
      const data = {
        name,
        description,
        avatar,
        banner,
        images,
        timeStart,
        timeEnd,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        location: locationData,
        tags,
        categories: category?._id,
        ticketPrice,
        ticketQuantity,
        userId: userId,
      };

      console.log('Event Data:', data);

      // Gửi dữ liệu lên server
      const res = await AxiosInstance().post('events/add', data, 'post');

      if (res.status) {
        Alert.alert('Thành công', res.message || 'Tạo sự kiện thành công');

        // Reset tất cả form fields sau khi tạo sự kiện thành công
        resetFormFields();
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể tạo sự kiện');
      }
    } catch (err) {
      console.error("❌ Lỗi tạo sự kiện:", err?.response?.data || err.message);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo sự kiện');
    }
  };

  const resetFormFields = () => {
    // Reset các trường text
    setName('');
    setDescription('');
    setTicketPrice(0);
    setTicketQuantity(1000);

    // Reset các trường hình ảnh
    setAvatar(null);
    setBanner(null);
    setImages([]);

    // Reset thời gian về thời gian hiện tại
    setTimeStart(new Date());
    setTimeEnd(new Date());

    // Reset vị trí và địa chỉ
    setLatitude(null);
    setLongitude(null);

    // Reset danh mục và tags
    setCategory(null);
    setTags([]);

    // Reset loại vé về mặc định
    setSelectedTicketType('Paid');

    // Reset địa chỉ
    setAddress({
      provinces: address.provinces,  // Giữ lại danh sách tỉnh/thành đã load
      districts: [],
      wards: [],
      selectedProvince: null,
      selectedDistrict: null,
      selectedWard: null,
      street: '',
    });
  };

  return (
    <View style={styles.container}>
      <OrganizerHeaderComponent title="Create Event" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.form}>
          <Text style={styles.label}>Event Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên sự kiện"
            placeholderTextColor="#A0A0A0"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập mô tả chi tiết cho sự kiện"
            placeholderTextColor="#A0A0A0"
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Category</Text>
          <TouchableOpacity style={styles.selectInput}>
            <Icon
              name="list"
              size={16}
              color="#555"
              style={styles.iconMargin}
            />
            <CategoryPicker
              selectedCategory={category}
              onSelectCategory={setCategory}
            />
          </TouchableOpacity>

          <Text style={styles.label}>Tags</Text>
          <TouchableOpacity style={styles.selectInput}>
            <Icon
              name="tags"
              size={16}
              color="#555"
              style={styles.iconMargin}
            />
            <TagsPicker selectedTags={tags} onChangeTags={setTags} />
          </TouchableOpacity>

          <Text style={styles.label}>Event Date & Time</Text>
          <DateTimePickerComponent onTimeChange={({ timeStart, timeEnd }) => {
            setTimeStart(timeStart);
            setTimeEnd(timeEnd);
          }} />
        </KeyboardAvoidingView>

        <AddressSelector address={address} setAddress={setAddress} />

        <ImageUploader
          label="Ảnh bìa"
          image={banner}
          onUpload={handleUploadCover}
          onDelete={() => setBanner(null)}
        />


        <ImageUploader
          label="Ảnh đại diện"
          image={avatar}
          onUpload={handleUploadAvatar}
          onDelete={() => setAvatar(null)}
        />


        <ImageUploader
          label="Ảnh mô tả"
          multiple
          images={images}
          onUpload={handleUploadMultipleImages}
          onDelete={index => {
            const updated = [...images];
            updated.splice(index, 1);
            setImages(updated);
          }}
        />

        <Text style={styles.label}>Giá vé (VNĐ)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={ticketPrice.toString()}
          onChangeText={text => setTicketPrice(Number(text))}
        />

        <Text style={styles.label}>Số lượng vé</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={ticketQuantity.toString()}
          onChangeText={text => setTicketQuantity(Number(text))}
        />


        <Text style={styles.label}>Ticket Type</Text>
        <View style={styles.checkboxContainer}>
          {['Paid', 'Free', 'Donation'].map(type => (
            <TouchableOpacity
              key={type}
              style={styles.checkboxRow}
              onPress={() => handleSelectTicketType(type)}>
              <Icon
                name={selectedTicketType === type ? 'check-square' : 'square-o'}
                size={20}
                color={selectedTicketType === type ? '#6366F1' : '#999'}
              />
              <Text style={styles.checkboxLabel}>{type} Ticket</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Tạo sự kiện</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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

  iconMargin: {
    marginRight: 8,
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
  button: {
    backgroundColor: '#22C55E',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});