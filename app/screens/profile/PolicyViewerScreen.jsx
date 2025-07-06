// screens/PolicyViewerScreen.jsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { appColors } from '../../constants/appColors';

const PolicyViewerScreen = ({ route, navigation }) => {
    const { title, content } = route.params;

    return (
        <View style={{ flex: 1 }}>
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
                    <Text key={index} style={styles.contentText}>{line}</Text>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
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

    content: {
        padding: 20,
    },
    contentText: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 8,
    },
});

export default PolicyViewerScreen;
