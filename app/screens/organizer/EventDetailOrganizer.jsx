import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { AxiosInstance } from '../../services';
import { useCallback } from 'react';

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
            fetchEventDetail(); // hàm gọi API chi tiết sự kiện
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
        return <Text style={styles.error}>Không thể tải chi tiết sự kiện.</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: event.banner }} style={styles.banner} />
            <Image source={{ uri: event.avatar }} style={styles.avatar} />

            <Text style={styles.title}>{event.name}</Text>
            <Text style={styles.label}>Mô tả:</Text>
            <Text style={styles.description}>{event.description}</Text>

            <Text style={styles.label}>Thời gian:</Text>
            <Text style={styles.date}>Bắt đầu: {formatDate(event.timeStart)}</Text>
            <Text style={styles.date}>Kết thúc: {formatDate(event.timeEnd)}</Text>

            <Text style={styles.label}>Địa điểm:</Text>
            <Text>{event.location}</Text>

            <Text style={styles.label}>Giá vé:</Text>
            <Text>{event.ticketPrice}</Text>

            <Text style={styles.label}>Số lượng vé:</Text>
            <Text>{event.ticketQuantity}</Text>

            <Text style={styles.label}>Tags:</Text>
            <View style={styles.tagContainer}>
                {event.tags.map((tag, index) => (
                    <Text key={index} style={styles.tag}>{tag}</Text>
                ))}
            </View>

            <Text style={styles.label}>Hình ảnh khác:</Text>
            <ScrollView horizontal style={{ marginVertical: 10 }}>
                {event.images.map((img, i) => (
                    <Image key={i} source={{ uri: img }} style={styles.image} />
                ))}
            </ScrollView>

            <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EventEdit', { eventId })}
            >
                <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default EventDetailOrganizer;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        textAlign: 'center',
        marginTop: 20,
        color: 'red',
    },
    banner: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 12,
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    label: {
        fontWeight: 'bold',
        marginTop: 12,
    },
    description: {
        marginTop: 4,
        color: '#444',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    tag: {
        backgroundColor: '#e0f2fe',
        color: '#0284c7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginRight: 8,
        marginTop: 4,
    },
    image: {
        width: 120,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    editButton: {
        backgroundColor: '#3B82F6',
        padding: 14,
        borderRadius: 10,
        marginTop: 24,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
