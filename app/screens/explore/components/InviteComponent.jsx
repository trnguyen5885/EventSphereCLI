import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { RowComponent } from '../../../components'

const InviteComponent = ({
    onPress
}) => {
    return (
        <View style={styles.container}>
            <RowComponent style={styles.content}>
                {/* Group of profile images */}
                <View style={styles.profileGroup}>
                    <Image source={require('../../../../assets/images/adaptive-icon.png')} style={[styles.image, styles.image1]} />
                    <Image source={require('../../../../assets/images/adaptive-icon.png')} style={[styles.image, styles.image2]} />
                    <Image source={require('../../../../assets/images/adaptive-icon.png')} style={[styles.image, styles.image3]} />
                </View>
                
                {/* Text showing number of people going */}
                <Text style={styles.goingText}>+20 Going</Text>
                
                {/* Invite button */}
                <TouchableOpacity 
                    style={styles.inviteButton}
                    onPress={onPress}
                >
                    <Text style={styles.inviteText}>Invite</Text>
                </TouchableOpacity>
            </RowComponent>
        </View>
    )
}

export default InviteComponent

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        width: '80%',
        padding: 12,
        borderRadius: 40,
        position: 'absolute',
        bottom: -20,
        alignSelf: 'center', 
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        overflow: 'hidden',
        borderWidth: 0.2,
        borderColor: 'rgba(0,0,0,0.05)'
    },
    content: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileGroup: {
        flexDirection: 'row',
        marginRight: 10,
    },
    image: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'white',
    },
    // Position images to overlap
    image1: {
        zIndex: 3,
    },
    image2: {
        marginLeft: -12,
        zIndex: 2,
    },
    image3: {
        marginLeft: -12,
        zIndex: 1,
    },
    goingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4361EE',
        flex: 1,
        marginLeft: 8,
    },
    inviteButton: {
        backgroundColor: '#4361EE',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    inviteText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    }
})