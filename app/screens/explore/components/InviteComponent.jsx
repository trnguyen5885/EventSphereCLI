import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RowComponent } from '../../../components'
import { AxiosInstance } from '../../../services';

const InviteComponent = ({
    onPress,
    eventId
}) => {
    const [join, setJoin] = useState(false);
    const [event, setEvent] = useState([]);
    
    useEffect(() => {
        const fetchJoined = async () => {
            try {
                const res = await AxiosInstance().get("friends/joined");
                const events = res.events || [];
                setEvent(events);

                const isJoined = events.some(e => e._id === eventId);
                setJoin(isJoined);
                
                console.log("Fetched events: ", events);
            } catch (e) {
                console.log("Error for display invite: ", e);
            }
        };
        fetchJoined();
    }, [eventId]); // Added eventId as dependency

    const handleJoin = async () => {
        try {
            if (join) {
                await AxiosInstance().post(`friends/unjoin/${eventId}`);
                setJoin(false);
            } else {
                const body = {
                    eventId: eventId,
                    type: 'join'
                }
                await AxiosInstance().post(`friends/join/${eventId}`);
                await AxiosInstance().post('interactions/addInteraction', body);
                setJoin(true);
            }
        } catch (e) {
            console.log("Join error: " + e);
        }
    }

    const handlePress = () => {
        handleJoin();
        if (onPress) {
            onPress();
        }
    };

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

                <TouchableOpacity
                    style={join ? styles.invitedButton : styles.inviteButton}
                    onPress={handlePress}
                >
                    <Text style={[styles.inviteText, join && styles.invitedText]}>
                        {join ? 'Invited' : 'Invite'}
                    </Text>
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
    },
    invitedButton: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    invitedText: {
        color: '#4361EE',
        fontWeight: '600',
        fontSize: 16,
    }
})