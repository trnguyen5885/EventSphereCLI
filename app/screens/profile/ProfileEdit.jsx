import {
  StyleSheet, Text, View, Platform, StatusBar,
  Image, KeyboardAvoidingView, ScrollView, ToastAndroid, TouchableOpacity, TextInput, Alert
} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { globalStyles } from '../../constants/globalStyles';
import { appColors } from '../../constants/appColors';
import { ButtonComponent, InputComponent, RowComponent } from '../../components';
import { Call, Lock, Personalcard, Sms, User } from 'iconsax-react-native';
import { AxiosInstance } from '../../services';
import LoadingModal from '../../modals/LoadingModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import { loginSuccess } from '../../redux/slices/authSlice';


const ProfileEdit = ({ navigation }) => {
  const dispatch = useDispatch();
  const { userData, userId } = useSelector((state) => state.auth);

  const [name, setName] = useState(userData?.username || '');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || '');
  const [birthDate, setBirthDate] = useState('01/01/2013');
  const [gender, setGender] = useState('Nam');

  const [image, setImage] = useState(userData?.picUrl || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await AxiosInstance().get(`users/getUser/${userId}`);
        const user = res.data;
        setName(user.username);
        setImage(user.picUrl);
        setEmail(user.email);
        setPhoneNumber(user.phoneNumber || '');
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
        setImage(data.secure_url);
      } else {
        Alert.alert('Upload thất bại', JSON.stringify(data));
      }
    } catch (error) {
      console.log('Upload lỗi:', error);
      Alert.alert('Lỗi!', 'Không thể tải ảnh lên.');
    }
  };

  const handleEditProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên không được để trống');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Số điện thoại không được để trống');
      setIsLoading(false);
      return;
    } else if (!/^(0[3|5|7|8|9])\d{8,9}$/.test(phoneNumber)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Cập nhật thông tin cơ bản
      await AxiosInstance().put('users/edit', {
        id: userId,
        username: name,
        picUrl: image,
        phoneNumber: phoneNumber,
      });

      // Nếu người dùng đổi mật khẩu
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

      // Cập nhật Redux
      dispatch(loginSuccess({
        userId,
        userData: {
          ...userData,
          username: name,
          picUrl: image,
          phoneNumber: phoneNumber,
        },
        role: 2,
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
        {['Nam', 'Nữ', 'Khác'].map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.genderOption}
            onPress={() => setGender(option)}
          >
            <View style={[
              styles.radioButton,
              gender === option && styles.radioButtonSelected
            ]}>
              {gender === option && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.genderText}>{option}</Text>
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
        <RowComponent onPress={handleNavigation} styles={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
          <View style={{ width: 26 }} /> {/* Placeholder for alignment */}
        </RowComponent>
      </View>

      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              <Image
                source={{ uri: image || 'https://via.placeholder.com/150' }}
                style={styles.avatar}
              />
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={25} color="white" />
              </View>
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

            {/* Birth Date Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Ngày tháng năm sinh <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="DD/MM/YYYY"
                  value={birthDate}
                  onChangeText={(text) => setBirthDate(text)}
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Gender Selector */}
            <GenderSelector />

            {/* Password Fields - Hidden by default, can be shown with toggle */}
            {/* You can add a toggle button to show/hide password fields */}

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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
});

export default ProfileEdit;