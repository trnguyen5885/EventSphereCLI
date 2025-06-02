import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { RowComponent } from '../../../components'
import Entypo from 'react-native-vector-icons/Entypo';
import { formatTime } from './formatTime'
import { AxiosInstance } from '../../../services';

const InviteNotiComponent = ({
    avatar,
    title,
    body,
    inviteId,
    createdAt,
    onResponded,
    status
}) => {
    const handleAccept = async () => {
        try {
            console.log("inviteId: "+inviteId);
            
          await AxiosInstance().post(`/friends/invites/accept/${inviteId}`);
          onResponded?.(); // callback reload
        } catch (error) {
          console.error("Chấp nhận thất bại:", error);
        }
      };
    
      const handleReject = async () => {
        try {
          await AxiosInstance().post(`/friends/invites/reject/${inviteId}`);
          onResponded?.(); // callback reload
        } catch (error) {
          console.error("Từ chối thất bại:", error);
        }
      };
    return (
        <View style={styles.notificationCard}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 10 }}>
                <RowComponent justify="space-between">
                    <Text style={styles.userName}>{title}</Text>
                    <TouchableOpacity>
                        <Entypo name="dots-three-vertical" size={14} color={'white'} />
                    </TouchableOpacity>
                </RowComponent>
                <Text style={styles.content} numberOfLines={2}>
                    {body}
                </Text>
                {
                    status === 'pending' && (
                        <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.rejectButton}>
                            <Text style={styles.rejectText}>Từ chối</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                            <Text style={styles.acceptText}>Đồng ý</Text>
                        </TouchableOpacity>
                    </View>
                    )
                }
                {
                    status === 'joined' && (
                        <View style={styles.buttonRow}>
                        <Text>Bạn đã tham gia sự kiện</Text>
                    </View>
                    )
                }
                <Text style={styles.timeText}>{formatTime(createdAt)}</Text>
            </View>
        </View>
    )
}

export default InviteNotiComponent

const styles = StyleSheet.create({
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: '#ddd',
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    content: {
        fontWeight: 'normal',
    },
    timeText: {
        fontSize: 12,
        color: 'gray',
        marginTop: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 10,
    },
    rejectButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    rejectText: {
        color: '#000',
    },
    acceptButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    acceptText: {
        color: '#fff',
    },
})