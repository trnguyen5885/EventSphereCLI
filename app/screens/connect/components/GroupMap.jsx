import React from 'react';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Dimensions, Alert, Linking, Text, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

const GroupMap = ({ members, myLocation }) => {
  // Lấy vị trí đầu tiên hợp lệ để set initialRegion
  const firstLocation = members.find(m => m.location && typeof m.location.latitude === 'number' && typeof m.location.longitude === 'number');

  if (!myLocation && !firstLocation) {
    return (
      <View style={styles.mapContainer}>
        <View style={styles.noMap}><Text>Chưa có vị trí để hiển thị bản đồ</Text></View>
      </View>
    );
  }

  const handleMarkerPress = (member) => {
    if (!myLocation) {
      Alert.alert('Chỉ đường', 'Bạn cần chia sẻ vị trí của mình trước!');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${myLocation.latitude},${myLocation.longitude}&destination=${member.location.latitude},${member.location.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: (myLocation?.latitude || firstLocation.location.latitude),
          longitude: (myLocation?.longitude || firstLocation.location.longitude),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={!!myLocation}
      >
        {members.map(member => member.location && (
          <Marker
            key={member.id || member._id}
            coordinate={member.location}
            onPress={() => handleMarkerPress(member)}
          >
            <Callout tooltip>
              <View style={styles.calloutBox}>
                <Text style={styles.calloutName}>{member.name}</Text>
                <Text style={styles.calloutEmail}>{member.email}</Text>
                <Text style={styles.calloutDirection}>Nhấn để chỉ đường</Text>
              </View>
            </Callout>
          </Marker>
        ))}
        {myLocation && (
          <Marker coordinate={myLocation} title="Vị trí của tôi" pinColor="blue">
            <Callout tooltip>
              <View style={styles.calloutBox}>
                <Text style={[styles.calloutName, { color: '#28a745' }]}>Bạn</Text>
                <Text style={styles.calloutEmail}>Vị trí hiện tại</Text>
              </View>
            </Callout>
          </Marker>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: { width: width - 32, height: height / 2.5, marginVertical: 16, borderRadius: 18, overflow: 'hidden', elevation: 2 },
  map: { flex: 1, borderRadius: 18 },
  calloutBox: { backgroundColor: '#fff', padding: 10, borderRadius: 10, alignItems: 'center', minWidth: 120, elevation: 2 },
  calloutName: { fontWeight: 'bold', fontSize: 15, color: '#007AFF' },
  calloutEmail: { color: '#555', fontSize: 12 },
  calloutDirection: { color: '#ff9800', fontWeight: 'bold', marginTop: 4 },
  noMap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default GroupMap; 