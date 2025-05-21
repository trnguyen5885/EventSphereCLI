import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Platform
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { AxiosInstance } from '../../services';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Sử dụng react-native-vector-icons cho React Native CLI

const EventDetailOrganizer = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { eventId } = route.params;

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const fetchEventDetail = async () => {
        try {
            console.log('Fetching event details for ID:', eventId);
            const res = await AxiosInstance().get(`events/detail/${eventId}`);
            setEvent(res.data);
            console.log('Event details fetched successfully:', res.data);
        } catch (err) {
            console.error('Failed to fetch event details:', err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEventDetail();
        }, [eventId])
    );

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!event) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.error}>Không thể tải chi tiết sự kiện.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>

            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết sự kiện</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Banner with gradient overlay */}
                <View style={styles.bannerContainer}>
                    <Image source={{ uri: event.banner }} style={styles.banner} />
                    <View style={styles.bannerOverlay} />
                </View>

                {/* Event details */}
                <View style={styles.contentContainer}>
                    <Image source={{ uri: event.avatar }} style={styles.avatar} />

                    <Text style={styles.title}>{event.name}</Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={18} color="#3B82F6" style={styles.infoIcon} />
                            <View>
                                <Text style={styles.infoLabel}>Thời gian:</Text>
                                <Text style={styles.infoText}>Bắt đầu: {formatDate(event.timeStart)}</Text>
                                <Text style={styles.infoText}>Kết thúc: {formatDate(event.timeEnd)}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={18} color="#3B82F6" style={styles.infoIcon} />
                            <View>
                                <Text style={styles.infoLabel}>Địa điểm:</Text>
                                <Text style={styles.infoText}>{event.location}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="ticket-outline" size={18} color="#3B82F6" style={styles.infoIcon} />
                            <View>
                                <Text style={styles.infoLabel}>Thông tin vé:</Text>
                                <Text style={styles.infoText}>Giá: {event.ticketPrice}</Text>
                                <Text style={styles.infoText}>Số lượng: {event.ticketQuantity}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mô tả</Text>
                        <Text style={styles.description}>{event.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tags</Text>
                        <View style={styles.tagContainer}>
                            {event.tags.map((tag, index) => (
                                <Text key={index} style={styles.tag}>{tag}</Text>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hình ảnh</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.imagesScroll}
                        >
                            {event.images.map((img, i) => (
                                <Image key={i} source={{ uri: img }} style={styles.image} />
                            ))}
                        </ScrollView>
                    </View>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EventEdit', { eventId })}
                    >
                        <Ionicons name="create-outline" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.editButtonText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    errorContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    error: {
        textAlign: 'center',
        marginTop: 20,
        color: '#e03131',
        fontSize: 16,
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
        backgroundColor: '#f8f9fa',
    },
    bannerContainer: {
        position: 'relative',
        height: 200,
    },
    banner: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    contentContainer: {
        padding: 16,
        marginTop: -40,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: '#fff',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 20,
        color: '#333',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 14,
    },
    infoIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    infoLabel: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#333',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#e0f2fe',
        color: '#0284c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        fontSize: 13,
    },
    imagesScroll: {
        marginTop: 8,
    },
    image: {
        width: 160,
        height: 120,
        borderRadius: 10,
        marginRight: 12,
    },
    editButton: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        marginTop: 10,
        marginBottom: 20,
    },
    buttonIcon: {
        marginRight: 8,
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default EventDetailOrganizer;