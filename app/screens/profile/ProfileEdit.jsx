import { StyleSheet, Text, View, Platform, StatusBar, Image, KeyboardAvoidingView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { globalStyles } from '../../constants/globalStyles';
import { appColors } from '../../constants/appColors';
import { ButtonComponent, InputComponent, RowComponent } from '../../components';
import { Lock, Sms, User } from 'iconsax-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosInstance } from '../../services';
import LoadingModal from '../../modals/LoadingModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from "react-native-image-crop-picker";


const ProfileEdit = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [userID, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  //Mở thư viện chọn ảnh
  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 500,
        height: 500,
        cropping: true, // Cho phép crop ảnh
        mediaType: "photo",
      });
  
      console.log("Ảnh đã chọn:", image.path);
      uploadImage(image.path);
    } catch (error) {
      console.log("Người dùng đã hủy chọn ảnh hoặc lỗi:", error);
    }
  };

  //Kết nối Claudinary để tải ảnh lên
  const uploadImage = async (imageUri) => {
    let formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "upload.jpg",
    });
    formData.append("upload_preset", "DATN2025"); // Thay bằng upload preset của bạn
  
    try {
      let response = await fetch("https://api.cloudinary.com/v1_1/ddkqz5udn/image/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json",
          "Content-Type": "multipart/form-data",
        },
      });
  
      let data = await response.json();
      console.log("Cloudinary Response:", data);
  
      if (data.secure_url) {
        setImage(data.secure_url);
        console.log("URL Ảnh:", data.secure_url);
      } else {
        Alert.alert("Upload thất bại!", JSON.stringify(data));
      }
    } catch (error) {
      console.log("Lỗi upload:", error);
      Alert.alert("Lỗi!", "Không thể tải ảnh lên.");
    }
  };


  useEffect(() => {
    const getUserInfo = async () => {
      const userID = await AsyncStorage.getItem("userId");
      const response = await AxiosInstance().get(`users/${userID}`);
      setName(response.data.username);
      setEmail(response.data.email);
      setImage(response.data.picUrl);
      setUserId(userID);
      console.log("userId: " + userID);
      console.log("password: " + response.data.password);
      console.log(name);



    };
    getUserInfo();
  }, []);

  const handleNavigation = () => {
    navigation.goBack();
  };

  const handleEditProfile = async () => {
    setIsLoading(true);

    try {
      // Cập nhật username
      const updateUserResponse = await AxiosInstance().put("users/edit", {
        id: userID,
        username: name,
        picUrl: image,
      });


      // Nếu người dùng muốn thay đổi mật khẩu
      if (oldPassword && newPassword && reNewPassword) {
        if (newPassword !== reNewPassword) {
          Alert.alert("Thông báo!", "Mật khẩu mới và xác nhận mật khẩu không khớp.");
          setIsLoading(false);
          return;
        }

        // Gửi mật khẩu lên server để xác thực và cập nhật
        const passwordResponse = await AxiosInstance().put("users/editPassword", {
          id: userID,
          currentPassword: oldPassword, // Gửi mật khẩu cũ chưa mã hóa
          newPassword: newPassword,  // Gửi mật khẩu mới chưa mã hóa
        });

      }

      Alert.alert("Thành công", "Cập nhật thông tin thành công!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
      

    } catch (error) {
      console.log(error);
      Alert.alert("Thông báo!", "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingModal />;
  }

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
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                <Image
                  source={{ uri: image || "https://via.placeholder.com/150" }}
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
              onChange={(text) => setEmail(text)}
              suffix={<Sms size={22} color={appColors.gray} />}
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
            <ButtonComponent text="Lưu thông tin" type="primary" onPress={() => handleEditProfile()} />
          </View>
        </ScrollView>
        <LoadingModal visible={isLoading} />
      </KeyboardAvoidingView>
    </View>
  );
};


const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === "ios" ? 66 : 22,
  },
  headerTitle: {
    color: appColors.white2,
    fontSize: 22,
    fontWeight: "500",
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
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});


export default ProfileEdit;
