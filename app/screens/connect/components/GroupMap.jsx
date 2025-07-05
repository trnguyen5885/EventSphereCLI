import React from 'react';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { View, Dimensions, Text, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

const GroupMap = ({ members, myLocation, targetMember }) => {
  console.log('myLocation:', myLocation);
  console.log('targetMember:', targetMember);
  // Lấy vị trí đầu tiên hợp lệ để set initialRegion
  const firstLocation = members.find(m => m.location && typeof m.location.latitude === 'number' && typeof m.location.longitude === 'number');

  if (!myLocation && !firstLocation) {
    return (
      <View style={styles.mapContainer}>
        <View style={styles.noMap}><Text>Chưa có vị trí để hiển thị bản đồ</Text></View>
      </View>
    );
  }

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
        {/* Vẽ đường thẳng từ myLocation đến targetMember nếu có */}
        {myLocation && targetMember?.location?.coordinates &&
          typeof myLocation.latitude === 'number' &&
          typeof myLocation.longitude === 'number' &&
          Array.isArray(targetMember.location.coordinates) &&
          targetMember.location.coordinates.length === 2 &&
          typeof targetMember.location.coordinates[0] === 'number' &&
          typeof targetMember.location.coordinates[1] === 'number' && (
            <Polyline
              coordinates={[
                { latitude: myLocation.latitude, longitude: myLocation.longitude },
                { latitude: targetMember.location.coordinates[1], longitude: targetMember.location.coordinates[0] }
              ]}
              strokeColor="#007AFF"
              strokeWidth={4}
            />
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