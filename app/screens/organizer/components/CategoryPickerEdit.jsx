import React, { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator, StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AxiosInstance from '../../../services/api/AxiosInstance';

const CategoryPickerEdit = ({ form, handleChange }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await AxiosInstance().get('categories/all');
                setCategories(res.data);
            } catch (error) {
                console.error('Lỗi khi tải danh mục:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const selectedCategory = categories.find((cat) => cat._id === form.category);

    const handleSelect = (item) => {
        handleChange('category', item._id);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => {
                    console.log('Click vào chọn danh mục');
                    setModalVisible(true);
                }}
                style={styles.selectBox}
            >
                <Text style={styles.selectText}>
                    {selectedCategory?.name || 'Chọn danh mục'}
                </Text>
                <Icon name="chevron-down" size={14} color="#666" />
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent={true} animationType="slide">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn danh mục</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="times" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#6366F1" />
                                <Text style={styles.loadingText}>Đang tải danh mục...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={categories}
                                keyExtractor={(item) => item._id.toString()}
                                renderItem={({ item }) => {
                                    const isSelected = item._id === form.category;
                                    return (
                                        <TouchableOpacity
                                            onPress={() => handleSelect(item)}
                                            style={[styles.itemRow, isSelected && styles.itemSelected]}
                                        >
                                            <Text style={[styles.itemText, isSelected && styles.selectedText]}>
                                                {item.name}
                                            </Text>
                                            {isSelected && <Icon name="check" size={16} color="#fff" />}
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.confirmButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CategoryPickerEdit;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    selectBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        width: '100%',
        height: 40,
    },
    selectText: {
        flex: 1,
        color: '#333',
        fontSize: 14,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemSelected: {
        backgroundColor: '#6366F1',
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    selectedText: {
        color: '#fff',
        fontWeight: '500',
    },
    checkIcon: {
        marginLeft: 10,
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#22C55E',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});