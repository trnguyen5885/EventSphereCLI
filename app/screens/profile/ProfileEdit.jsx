import {
  StyleSheet, Text, View, Platform, StatusBar,
  Image, KeyboardAvoidingView, ScrollView, ToastAndroid, TouchableOpacity, TextInput, Alert
} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { globalStyles } from '../../constants/globalStyles';
import { appColors } from '../../constants/appColors';
import { ButtonComponent, InputComponent, RowComponent } from '../../components';
import { Call, Lock, Personalcard, Sms, User, Calendar } from 'iconsax-react-native';
import { AxiosInstance } from '../../services';
import LoadingModal from '../../modals/LoadingModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import { loginSuccess } from '../../redux/slices/authSlice';
import { Animated } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const ProfileEdit = ({ navigation }) => {
  const dispatch = useDispatch();
  const { userData, userId } = useSelector((state) => state.auth);

  const [name, setName] = useState(userData?.username || '');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || '');
  const [birthDate, setBirthDate] = useState(new Date()); // Thay đổi thành Date object
  const [birthDateString, setBirthDateString] = useState(''); // String để hiển thị
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [gender, setGender] = useState(
    typeof userData?.gender === 'number' ? userData.gender : 0
  );

  const [image, setImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isUploadingImage) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, [isUploadingImage]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  console.log('User Data ne:', userData);
  console.log('Image URL:', image);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper function để format date thành string
  const formatDateToString = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function để parse string thành date
  const parseStringToDate = (dateString) => {
    if (!dateString || dateString === '01/01/2013') {
      return new Date(2000, 0, 1); // Default date
    }
    
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(2000, 0, 1);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await AxiosInstance().get(`users/getUser/${userId}`);
        const user = res.data;

        setName(user.username);
        setImage(user.picUrl || userData?.picUrl || '');
        setEmail(user.email);
        setPhoneNumber(user.phoneNumber || '');
        
        // Parse date string to Date object
        const userBirthDate = user.date || userData?.dateOfBirth || '01/01/2013';
        const parsedDate = parseStringToDate(userBirthDate);
        setBirthDate(parsedDate);
        setBirthDateString(formatDateToString(parsedDate));
        
        setGender(parseInt(user.gender));

        console.log('Thông tin người dùng:', user);
      } catch (error) {
        console.log('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);

  const handleNavigation = () => {
    navigation.goBack();
  };

  const handleCopyEmail = () => {
    if (email) {
      Clipboard.setString(email);

      if (Platform.OS === 'android') {
        ToastAndroid.show('Đã sao chép email vào bộ nhớ', ToastAndroid.SHORT);
      } else {
        Alert.alert('Thành công', 'Đã sao chép email vào bộ nhớ');
      }
    }
  };

  // Date picker functions
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date) => {
    setBirthDate(date);
    setBirthDateString(formatDateToString(date));
    hideDatePicker();
  };

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 500,
        height: 500,
        cropping: true,
        mediaType: 'photo',
      });

      uploadImage(image.path);
    } catch (error) {
      console.log('Huỷ chọn ảnh hoặc lỗi:', error);
    }
  };

  const uploadImage = async (imageUri) => {
    setIsUploadingImage(true);

    let formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    formData.append('upload_preset', 'DATN2025');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/ddkqz5udn/image/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.secure_url) {
        const imageUrl = data.secure_url;
        setImage(imageUrl);

        try {
          await AxiosInstance().put('users/edit', {
            id: userId,
            username: name,
            picUrl: imageUrl,
            phoneNumber: phoneNumber,
            date: birthDateString,
            gender: gender.toString(),
          });

          const res = await AxiosInstance().get(`users/getUser/${userId}`);
          const updatedUser = res.data;

          dispatch(loginSuccess({
            userId,
            userData: updatedUser,
            role: 3,
          }));

          if (Platform.OS === 'android') {
            ToastAndroid.show('Đã cập nhật ảnh đại diện thành công', ToastAndroid.SHORT);
          } else {
            Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện thành công');
          }

        } catch (updateError) {
          console.log('Lỗi khi cập nhật ảnh đại diện:', updateError);
          Alert.alert('Lỗi', 'Upload ảnh thành công nhưng không thể cập nhật thông tin. Vui lòng thử lại.');
        }

      } else {
        Alert.alert('Upload thất bại', JSON.stringify(data));
      }
    } catch (error) {
      console.log('Upload lỗi:', error);
      Alert.alert('Lỗi!', 'Không thể tải ảnh lên.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleEditProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên không được để trống');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Số điện thoại không được để trống');
      return;
    } else if (!/^(0[3|5|7|8|9])\d{8,9}$/.test(phoneNumber)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      await AxiosInstance().put('users/edit', {
        id: userId,
        username: name,
        picUrl: image,
        phoneNumber: phoneNumber,
        date: birthDateString, // Sử dụng formatted string
        gender: gender.toString(),
      });

      if (oldPassword && newPassword && reNewPassword) {
        if (newPassword !== reNewPassword) {
          Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
          setIsLoading(false);
          return;
        }

        await AxiosInstance().put('users/editPassword', {
          id: userId,
          currentPassword: oldPassword,
          newPassword: newPassword,
        });
      }

      const res = await AxiosInstance().get(`users/getUser/${userId}`);
      const updatedUser = res.data;

      dispatch(loginSuccess({
        userId,
        userData: updatedUser,
        role: 3,
      }));

      Alert.alert('Thành công', 'Thông tin đã được cập nhật', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setIsLoading(false);
    }
  };

  const GenderSelector = () => (
    <View style={styles.genderContainer}>
      <Text style={styles.genderLabel}>Giới tính</Text>
      <View style={styles.genderOptions}>
        {[{ label: 'Nam', value: 0 }, { label: 'Nữ', value: 1 }, { label: 'Khác', value: 2 }].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.genderOption}
            onPress={() => setGender(option.value)}
          >
            <View style={[
              styles.radioButton,
              gender === option.value && styles.radioButtonSelected
            ]}>
              {gender === option.value && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.genderText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={appColors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerRow, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleNavigation}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
          <View style={{ width: 26 }} />
        </View>
      </View>

      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={isUploadingImage}>
              <Image
                source={{ uri: image || 'https://avatar.iran.liara.run/public' }}
                style={styles.avatar}
              />

              {isUploadingImage ? (
                <View style={styles.cameraIcon}>
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="refresh" size={30} color="white" />
                  </Animated.View>
                </View>
              ) : (
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={25} color="white" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.avatarHint}>
              Cung cấp thông tin chính xác sẽ hỗ trợ bạn trong quá trình mua vé, hoặc khi cần xác thực về
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>

            {/* Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Họ và tên</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Nhập họ và tên"
                  value={name}
                  onChangeText={(text) => setName(text)}
                  style={styles.textInput}
                />
                <View style={styles.suffixIcon}>
                  <User size={20} color={appColors.gray} />
                </View>
              </View>
            </View>

            {/* Phone Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Số điện thoại</Text>
              <View style={styles.phoneContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+84</Text>
                  <Ionicons name="chevron-down" size={16} color={appColors.gray} />
                </View>
                <View style={styles.phoneInputWrapper}>
                  <TextInput
                    placeholder="Nhập Số điện thoại"
                    value={phoneNumber}
                    onChangeText={(text) => setPhoneNumber(text)}
                    keyboardType="phone-pad"
                    style={styles.textInput}
                  />
                </View>
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Email"
                  editable={false}
                  value={email}
                  style={[styles.textInput, styles.disabledInput]}
                />
                <TouchableOpacity style={styles.suffixIcon} onPress={handleCopyEmail}>
                  <Ionicons name="copy-outline" size={20} color={appColors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Birth Date Field with Date Picker */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Ngày tháng năm sinh <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity style={styles.inputWrapper} onPress={showDatePicker}>
                <TextInput
                  placeholder="Chọn ngày sinh"
                  value={birthDateString}
                  editable={false}
                  style={[styles.textInput, { color: birthDateString ? '#333' : '#999' }]}
                />
                <View style={styles.suffixIcon}>
                  <Calendar size={20} color={appColors.primary} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Gender Selector */}
            <GenderSelector />

          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <ButtonComponent
              text="Hoàn thành"
              type="primary"
              onPress={handleEditProfile}
              styles={styles.saveButton}
            />
          </View>

        </ScrollView>
        
        {/* Date Time Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
          maximumDate={new Date()} // Không cho chọn ngày tương lai
          minimumDate={new Date(1950, 0, 1)} // Giới hạn từ năm 1950
          locale="vi_VN" // Hiển thị tiếng Việt
          confirmTextIOS="Xác nhận"
          cancelTextIOS="Hủy"
          headerTextIOS="Chọn ngày sinh"
          date={birthDate}
        />
        
        <LoadingModal visible={isLoading} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === 'ios' ? 30 : 10,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    backgroundColor: 'white',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraIcon: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarHint: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  formSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  fieldContainer: {
    marginBottom: 25,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: 'red',
  },
  inputWrapper: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8e9ea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  suffixIcon: {
    marginLeft: 10,
    padding: 5,
  },
  disabledInput: {
    opacity: 0.7,
    color: '#666',
  },
  phoneContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8e9ea',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e8e9ea',
    gap: 5,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
  },
  phoneInputWrapper: {
    flex: 1,
    paddingHorizontal: 15,
  },
  copyIcon: {
    padding: 5,
  },
  genderContainer: {
    marginBottom: 25,
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  radioButtonSelected: {
    borderColor: appColors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: appColors.primary,
  },
  genderText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: appColors.primary,
    borderRadius: 12,
    paddingVertical: 15,
  },
  loadingSpinner: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default ProfileEdit;