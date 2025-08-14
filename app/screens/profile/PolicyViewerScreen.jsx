// screens/PolicyViewerScreen.jsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { appColors } from '../../constants/appColors';

const PolicyViewerScreen = ({ route, navigation }) => {
    const { title, content } = route.params;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.content}>
                {content.map((line, index) => (
                    <Text key={index} style={styles.contentText}>
                        {line}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Nền trắng như trang giấy
    },
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 40,
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    contentText: {
        fontSize: 16,
        lineHeight: 26,
        textAlign: 'justify', // Căn đều hai bên
        color: '#000000',
        marginBottom: 10,
    },
});

export default PolicyViewerScreen;
