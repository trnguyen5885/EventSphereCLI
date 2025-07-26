import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Platform,
    ScrollView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';
import { appColors } from '../../constants/appColors';

const ContactScreen = ({ navigation }) => {
    const phone = '19001234';
    const email = 'support@eventsphere.vn';
    const address = 'QTSC 9 Building, Đ. Tô Ký, Tân Chánh Hiệp, Quận 12, Hồ Chí Minh, Việt Nam';

    const handleCall = () => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${email}`);
    };

    const mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4426574722643!2d106.62322047428863!3d10.853897657761447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752b6c59ba4c97%3A0x535e784068f1558b!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1svi!2s!4v1751616785333!5m2!1svi!2s`;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={20} color="white" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Liên hệ chúng tôi</Text>
            </View>

            <View style={{ flex: 1 }}>
                {/* Google Map */}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: 10.854082064194595,
                            longitude: 106.62583831476402,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        <Marker
                            coordinate={{ latitude: 10.854082064194595, longitude: 106.62583831476402 }}
                            title="Trung tâm hỗ trợ"
                            description="QTSC 9 Building, Đ. Tô Ký, Tân Chánh Hiệp, Quận 12, Hồ Chí Minh, Việt Nam"
                        />
                    </MapView>

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Text style={styles.title}>Trung tâm hỗ trợ và chăm sóc khách hàng EventSphere</Text>
                        <Text style={styles.address}>{address}</Text>

                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.button} onPress={handleEmail}>
                                <Ionicons name="mail" size={24} color="white" />
                                <Text style={styles.buttonText}>Gửi email</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={handleCall}>
                                <Ionicons name="call" size={24} color="white" />
                                <Text style={styles.buttonText}>Gọi ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    header: {
        backgroundColor: appColors.primary,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 16,
    },

    backButton: {
        width: 30,
        height: 30,
        borderRadius: 20,
        // backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 40, // Để cân bằng với back button
    },

    mapContainer: {
        ...StyleSheet.absoluteFillObject, // full màn hình
        zIndex: 1,
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },

    infoCard: {
        position: 'absolute',
        bottom: 60,
        left: 16,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
        zIndex: 2,
    },


    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },

    address: {
        color: '#555',
        marginBottom: 16,
    },

    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    button: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: appColors.primary,
        padding: 12,
        borderRadius: 8,
        width: 100,
    },

    buttonText: {
        color: 'white',
        marginTop: 4,
        fontSize: 13,
    },
});

export default ContactScreen;
