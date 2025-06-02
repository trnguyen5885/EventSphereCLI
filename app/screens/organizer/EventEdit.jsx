import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Button,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AxiosInstance from '../../services/api/AxiosInstance';
import DateTimePickerComponent from '../organizer/components/DateTimePickerComponent';
import TagsPicker from '../organizer/components/TagsPicker';
import { Picker } from '@react-native-picker/picker';
import AddressSelector from './components/AddressSelector';
import axios from 'axios';
import ImageUploader from './components/ImageUploader';
import { launchImageLibrary } from 'react-native-image-picker';
import CategoryPickerEdit from './components/CategoryPickerEdit';
import Icon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';

const CLOUD_NAME = 'ddkqz5udn';
const UPLOAD_PRESET = 'DATN2025';

const EventEdit = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { eventId } = route.params;

    const [categories, setCategories] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    const [loading, setLoading] = useState(true);

    const [eventData, setEventData] = useState(null);


    const [address, setAddress] = useState({
        provinces: [],
        districts: [],
        wards: [],
        selectedProvince: null,
        selectedDistrict: null,
        selectedWard: null,
        street: '',
    });
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

    const [avatar, setAvatar] = useState(null);
    const [banner, setBanner] = useState(null);
    const [images, setImages] = useState([]);

    const [timeStart, setTimeStart] = useState(null);
    const [timeEnd, setTimeEnd] = useState(null);



    const [form, setForm] = useState({
        name: '',
        description: '',
        ticketPrice: '',
        ticketQuantity: '',
        timeStart: '',
        timeEnd: '',
        category: '',
    });

    const [timeRange, setTimeRange] = useState({
        timeStart: new Date(),
        timeEnd: new Date(),
    });

    const [formattedTime, setFormattedTime] = useState({
        timeStart: '',
        timeEnd: '',
    });

    const handleTimeChange = useCallback(({ timeStart, timeEnd }) => {
        const newStart = new Date(timeStart);
        const newEnd = new Date(timeEnd);
        setFormattedTime({
            timeStart: formatDate(newStart),
            timeEnd: formatDate(newEnd),
        });
    }, []);



    const formatDate = (timestamp) => {
        const date = new Date(
            timestamp.toString().length === 13 ? timestamp : timestamp * 1000
        );
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

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

    const parseAddressFromLocation = (locationString) => {
        const parts = locationString.split(',').map(part => part.trim());

        const province = parts.find(p => p.includes('Tỉnh') || p.includes('Thành phố'));
        const district = parts.find(p => p.includes('Huyện') || p.includes('Quận') || p.includes('Thành phố'));
        const ward = parts.find(p => p.includes('Xã') || p.includes('Phường') || p.includes('Thị trấn'));

        const streetParts = parts.filter(
            p => p !== province && p !== district && p !== ward
        );
        const street = streetParts.join(', ');

        return { province, district, ward, street };
    };

    useEffect(() => {
        if (eventData && eventData.location) {
            const { province, district, ward, street } = parseAddressFromLocation(eventData.location);

            // Gọi API lấy danh sách tỉnh
            fetch('https://provinces.open-api.vn/api/p/')
                .then(res => res.json())
                .then(provinces => {
                    const matchedProvince = provinces.find(p => province.includes(p.name));
                    if (matchedProvince) {
                        const selectedProvince = { label: matchedProvince.name, value: matchedProvince.code };

                        // Set tỉnh
                        setAddress(prev => ({ ...prev, selectedProvince }));

                        // Gọi API lấy huyện
                        fetch(`https://provinces.open-api.vn/api/p/${matchedProvince.code}?depth=2`)
                            .then(res => res.json())
                            .then(provinceData => {
                                const districtData = provinceData.districts;
                                const matchedDistrict = districtData.find(d => district.includes(d.name));
                                const selectedDistrict = matchedDistrict ? { label: matchedDistrict.name, value: matchedDistrict.code } : null;

                                setAddress(prev => ({
                                    ...prev,
                                    districts: districtData.map(d => ({ label: d.name, value: d.code })),
                                    selectedDistrict,
                                }));

                                if (matchedDistrict) {
                                    // Gọi API lấy xã
                                    fetch(`https://provinces.open-api.vn/api/d/${matchedDistrict.code}?depth=2`)
                                        .then(res => res.json())
                                        .then(districtData => {
                                            const wardData = districtData.wards;
                                            const matchedWard = wardData.find(w => ward.includes(w.name));
                                            const selectedWard = matchedWard ? { label: matchedWard.name, value: matchedWard.code } : null;

                                            setAddress(prev => ({
                                                ...prev,
                                                wards: wardData.map(w => ({ label: w.name, value: w.code })),
                                                selectedWard,
                                                street,
                                            }));
                                        });
                                } else {
                                    setAddress(prev => ({ ...prev, street }));
                                }
                            });
                    }
                });
        }
    }, [eventData]);





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



    const fetchEventDetail = async () => {

        try {
            const res = await AxiosInstance().get(`events/detail/${eventId}`);
            const data = res.data;

            setEventData(data);
            setForm({
                name: data.name,
                description: data.description,
                ticketPrice: data.ticketPrice.toString(),
                ticketQuantity: data.ticketQuantity.toString(),
                category: data.categories || '',
            });
            setSelectedTags(data.tags || []);
            setFormattedTime({
                timeStart: formatDate(data.timeStart),
                timeEnd: formatDate(data.timeEnd),
            });
            setAvatar(data.avatar);
            setBanner(data.banner);
            setImages(data.images || []);

        } catch (error) {
            console.error('Lỗi khi lấy chi tiết sự kiện:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await AxiosInstance().get('categories/all');
            if (res.status) {
                setCategories(res.data);
            }
        } catch (err) {
            console.error('Lỗi khi lấy danh mục:', err);
        }
    };


    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        // Lấy tọa độ từ địa chỉ trước khi tạo sự kiện
        const fullAddress = `${address.street}, ${address.selectedWard?.label}, ${address.selectedDistrict?.label}, ${address.selectedProvince?.label}`;

        // Kiểm tra nếu địa chỉ đã được chọn đầy đủ
        if (!address.selectedProvince || !address.selectedDistrict || !address.selectedWard || !address.street) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin địa chỉ');
            return;
        }

        try {
            const axiosJWT = AxiosInstance();

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

            const updatedEvent = {
                id: eventId,
                name: form.name,
                description: form.description,
                ticketPrice: parseInt(form.ticketPrice),
                ticketQuantity: parseInt(form.ticketQuantity),
                timeStart,
                timeEnd,
                categories: form.category,
                tags: selectedTags,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                location: locationData,
                avatar,
                banner,
                images,
            };


            const res = await axiosJWT.put(`events/edit`, updatedEvent);
            console.log('Nội dung cập nhật sự kiện:', updatedEvent);

            if (res.status) {
                Alert.alert('Thành công', 'Cập nhật sự kiện thành công', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);

            } else {
                Alert.alert('Lỗi', res.data?.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật sự kiện:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cập nhật');
        }
    };


    useEffect(() => {
        fetchEventDetail();
        fetchCategories();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header với nút quay lại */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <IonIcon name="arrow-back" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chỉnh sửa sự kiện</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.label}>Tên sự kiện</Text>
                <TextInput
                    style={styles.input}
                    value={form.name}
                    onChangeText={(text) => handleChange('name', text)}
                />

                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                    style={[styles.input, { height: 100 }]}
                    value={form.description}
                    onChangeText={(text) => handleChange('description', text)}
                    multiline
                />


                <Text style={styles.label}>Category</Text>
                <TouchableOpacity style={styles.selectInput}>
                    <Icon
                        name="list"
                        size={16}
                        color="#555"
                        style={styles.iconMargin}
                    />
                    <CategoryPickerEdit form={form} handleChange={handleChange} />
                </TouchableOpacity>


                <Text style={styles.label}>Tags</Text>
                <TouchableOpacity style={styles.selectInput}>
                    <Icon
                        name="tags"
                        size={16}
                        color="#555"
                        style={styles.iconMargin}
                    />
                    <TagsPicker
                        selectedTags={selectedTags}
                        onChangeTags={setSelectedTags}
                    />
                </TouchableOpacity>


                <Text style={styles.label}>Giá vé</Text>
                <TextInput
                    style={styles.input}
                    value={form.ticketPrice}
                    onChangeText={(text) => handleChange('ticketPrice', text)}
                    keyboardType="numeric"
                />
                <Text style={styles.label}>Số lượng vé</Text>
                <TextInput
                    style={styles.input}
                    value={form.ticketQuantity}
                    onChangeText={(text) => handleChange('ticketQuantity', text)}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Thời gian sự kiện</Text>
                <DateTimePickerComponent
                    initialStart={eventData?.timeStart}
                    initialEnd={eventData?.timeEnd}
                    onTimeChange={({ timeStart, timeEnd }) => {
                        setTimeStart(timeStart);
                        setTimeEnd(timeEnd);
                    }}
                />


                <Text style={styles.label}>Địa điểm tổ chức</Text>
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

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EventEdit;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerRight: {
        width: 40,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 100, // Thêm padding ở dưới để tránh nút bị che
    },
    label: {
        marginBottom: 8,
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginTop: 4,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        marginTop: 4,
        marginBottom: 12,
    },
    timeDisplay: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
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
    buttonContainer: {
        marginTop: 30,
        marginBottom: 40, // Thêm margin ở dưới để tránh bị che
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 36,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});