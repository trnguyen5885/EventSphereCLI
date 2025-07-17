import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { View, Dimensions, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const { width, height } = Dimensions.get('window');

const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// CustomMarker hiển thị avatar picUrl
const CustomMarker = ({ picUrl, name }) => (
  <View style={{
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    width: 40,
    height: 40,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <Image
      source={{ uri: picUrl }}
      style={{ width: 36, height: 36, borderRadius: 18 }}
    />
  </View>
);

const GroupMap = ({ members, myLocation, targetMemberId, setTargetMemberId }) => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [useStraightLine, setUseStraightLine] = useState(false);
  const mapRef = useRef(null);

  const targetMember = members.find(m => (m._id || m.id) === targetMemberId);
  const firstLocation = members.find(m => m.location?.coordinates?.length === 2);
  const firstLocationLat = firstLocation?.location?.coordinates[1] || 0;
  const firstLocationLng = firstLocation?.location?.coordinates[0] || 0;

  const [region, setRegion] = useState(() => ({
    latitude: myLocation?.latitude || firstLocationLat,
    longitude: myLocation?.longitude || firstLocationLng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }));

  useEffect(() => {
    const lat = myLocation?.latitude || firstLocationLat;
    const lng = myLocation?.longitude || firstLocationLng;
    setRegion(r => {
      if (r.latitude === lat && r.longitude === lng) return r;
      return { ...r, latitude: lat, longitude: lng };
    });
  }, [myLocation, firstLocationLat, firstLocationLng]);

  useEffect(() => {
    const getWalkingRoute = async (start, end) => {
      const distance = getDistanceInKm(start.latitude, start.longitude, end.latitude, end.longitude);

      if (distance < 1) {
        setUseStraightLine(true);
        setRouteCoords([]);
      } else {
        try {
          const response = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
            method: 'POST',
            headers: {
              'Authorization': 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImI0YmY4ZDg0OWY5ZjQ1MGY5NWI1MWRkZmMwZmVkODMzIiwiaCI6Im11cm11cjY0In0=',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              coordinates: [
                [start.longitude, start.latitude],
                [end.longitude, end.latitude]
              ]
            })
          });

          const data = await response.json();
          const coords = data.features[0].geometry.coordinates.map(coord => ({
            latitude: coord[1],
            longitude: coord[0],
          }));
          setUseStraightLine(false);
          setRouteCoords(coords);
        } catch (error) {
          console.error('Failed to fetch route:', error);
          setUseStraightLine(true);
          setRouteCoords([]);
        }
      }

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: end.latitude,
          longitude: end.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002
        }, 800);
      }
    };

    if (
      myLocation &&
      typeof targetMember?.latitude === 'number' &&
      typeof targetMember?.longitude === 'number'
    ) {
      getWalkingRoute(myLocation, targetMember);
    } else {
      setRouteCoords([]);
    }
  }, [myLocation, targetMember]);
  
  const handleRegionChangeComplete = (newRegion) => {
    setRegion(r => {
      if (
        r.latitude === newRegion.latitude &&
        r.longitude === newRegion.longitude &&
        r.latitudeDelta === newRegion.latitudeDelta &&
        r.longitudeDelta === newRegion.longitudeDelta
      ) return r;
      return newRegion;
    });
  };

  if (!myLocation && !firstLocation) {
    return (
      <View style={styles.mapContainer}>
        <View style={styles.noMap}><Text>Chưa có vị trí để hiển thị bản đồ</Text></View>
      </View>
    );
  }
  
  return (
    <View style={styles.mapContainer}>
      <View style={styles.zoomControl}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setRegion(r => ({
            ...r,
            latitudeDelta: r.latitudeDelta / 2,
            longitudeDelta: r.longitudeDelta / 2,
          }))}
        >
          <Text style={styles.zoomText}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setRegion(r => ({
            ...r,
            latitudeDelta: r.latitudeDelta * 2,
            longitudeDelta: r.longitudeDelta * 2,
          }))}
        >
          <Text style={styles.zoomText}>－</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar nổi phía trên bản đồ khi chọn targetMember */}
      {targetMember && targetMember.picUrl && (
        <View style={{
          position: 'absolute',
          top: 10,
          left: width / 2 - 30,
          zIndex: 100,
          alignItems: 'center',
        }}>
          <Image
            source={{ uri: targetMember.picUrl }}
            style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#fff' }}
          />
          <Text style={{ color: '#333', fontWeight: 'bold', marginTop: 4 }}>{targetMember.name}</Text>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={!!myLocation}
      >
        {members.map(member => {
          const isTarget = targetMember &&
            (member._id || member.id) === (targetMember._id || targetMember.id);

          // Xác định marker của chính mình
          const isMe = myLocation &&
            Math.abs(member.latitude - myLocation.latitude) < 0.00001 &&
            Math.abs(member.longitude - myLocation.longitude) < 0.00001;

          // Lấy chữ cái đầu của username hoặc chữ 'Bạn' nếu là mình
          const initial = isMe ? 'Tôi' : (member.username ? member.username.charAt(0).toUpperCase() : '?');

          return typeof member.latitude === 'number' && typeof member.longitude === 'number' && (
            <Marker
              key={member._id || member.id}
              coordinate={{
                latitude: member.latitude,
                longitude: member.longitude
              }}
              onPress={() => {
                if (!isTarget) {
                  setTargetMemberId(member._id || member.id);
                }
              }}
            >
              <View style={{
                borderWidth: isTarget ? 3 : 2,
                borderColor: isTarget ? '#FFD600' : '#fff',
                borderRadius: 20,
                overflow: 'hidden',
                width: 40,
                height: 40,
                backgroundColor: isMe ? '#007bff' : '#eee',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: isMe ? '#fff' : '#333' }}>{initial}</Text>
              </View>
              <Callout tooltip>
                <View style={styles.calloutBox}>
                  <Image
                    source={{ uri: member.picUrl }}
                    style={{ width: 40, height: 40, borderRadius: 20, marginBottom: 6 }}
                  />
                  <Text style={styles.calloutEmail}>{member.email}</Text>
                  <Text style={styles.calloutDirection}>Nhấn để chỉ đường</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}


        {myLocation && (
          <Marker coordinate={myLocation}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#007bff',
              borderWidth: 2,
              borderColor: '#fff',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Tôi</Text>
            </View>

            <Callout tooltip>
              <View style={styles.calloutBox}>
                <Text style={[styles.calloutName, { color: '#28a745' }]}>Bạn</Text>
                <Text style={styles.calloutEmail}>Vị trí hiện tại</Text>
              </View>
            </Callout>
          </Marker>
        )}


        {myLocation && targetMember && (
          useStraightLine ? (
            <Polyline
              coordinates={[myLocation, targetMember]}
              strokeColor="#fbbc04"
              strokeWidth={4}
            />
          ) : (
            routeCoords.length > 1 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor="#007AFF"
                strokeWidth={4}
              />
            )
          )
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: width - 32,
    height: height / 2.2,
    marginVertical: 16,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
    alignSelf: 'center',
    backgroundColor: '#eee'
  },
  map: { flex: 1 },
  calloutBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 130,
    elevation: 4
  },
  calloutName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#007AFF'
  },
  calloutEmail: {
    color: '#555',
    fontSize: 12
  },
  calloutDirection: {
    color: '#ff9800',
    fontWeight: 'bold',
    marginTop: 4
  },
  noMap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  zoomControl: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10
  },
  zoomButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 30,
    marginBottom: 10,
    elevation: 3
  },
  zoomText: {
    fontSize: 20,
    color: '#333'
  }
});

export default GroupMap;