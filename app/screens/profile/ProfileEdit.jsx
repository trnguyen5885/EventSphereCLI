import {
  StyleSheet, Text, View, Platform, StatusBar,
  Image, KeyboardAvoidingView, ScrollView, Alert, TouchableOpacity
} from 'react-native';
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

  return (
    <View style={globalStyles.container}>
      <KeyboardAvoidingView>
        <ScrollView>
          <View style={styles.header}>
            <StatusBar animated backgroundColor={appColors.primary} />
            <RowComponent onPress={handleNavigation} styles={{ columnGap: 25 }}>
              <Ionicons name="chevron-back" size={26} color="white" />
              <Text style={styles.headerTitle}>Chỉnh sửa cá nhân</Text>
            </RowComponent>
          </View>

          <View style={styles.body}>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                <Image
                  source={{ uri: image || 'https://via.placeholder.com/150' }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            </View>

            <InputComponent
              placeholder="Tên của bạn"
              value={name}
              onChange={(text) => setName(text)}
              suffix={<User size={22} color={appColors.gray} />}
            />

            <InputComponent
              placeholder="Email"
              editable={false}
              value={email}
              suffix={<Sms size={22} color={appColors.gray} />}
            />

            <InputComponent
              placeholder="Số điện thoại"
              value={phoneNumber}
              onChange={(text) => setPhoneNumber(text)}
              suffix={<Personalcard size={22} color={appColors.gray} />}
            />



            <InputComponent
              value={oldPassword}
              placeholder="Nhập mật khẩu cũ"
              onChange={setOldPassword}
              isPassword
              allowClear
              affix
            />
            <InputComponent
              value={newPassword}
              placeholder="Nhập mật khẩu mới"
              onChange={setNewPassword}
              isPassword
              allowClear
              affix
            />
            <InputComponent
              value={reNewPassword}
              placeholder="Xác nhận mật khẩu mới"
              onChange={setReNewPassword}
              isPassword
              allowClear
              affix
            />

            <ButtonComponent text="Lưu thông tin" type="primary" onPress={handleEditProfile} />
          </View>
        </ScrollView>
        <LoadingModal visible={isLoading} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === 'ios' ? 66 : 22,
  },
  headerTitle: {
    color: appColors.white2,
    fontSize: 22,
    fontWeight: '500',
  },
  body: {
    rowGap: 20,
    marginTop: 40,
    paddingHorizontal: 15,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default ProfileEdit;