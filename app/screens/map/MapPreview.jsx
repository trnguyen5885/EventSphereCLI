import {SpaceComponent, TextComponent} from '../../components';
import React from 'react';
import {View, StyleSheet, TouchableOpacity, Linking, Text} from 'react-native';
import MapView, {Marker} from 'react-native-maps';

const MapPreview = ({longitude, latitude, location_map}) => {
  // Ưu tiên dùng longitude và latitude, nếu không thì dùng location_map.coordinates
  const finalLatitude = latitude ?? location_map?.coordinates?.[1];
  const finalLongitude = longitude ?? location_map?.coordinates?.[0];

  if (!finalLatitude || !finalLongitude) {
    return null;
  }

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${finalLatitude},${finalLongitude}`;
    Linking.openURL(url);
  };

  return (
    <View>
      
      <SpaceComponent height={10} />
      <TouchableOpacity onPress={openInGoogleMaps} style={styles.mapContainer}>
        <View style={styles.mapWrapper}>
          <MapView
            style={styles.map}
            region={{
              latitude: finalLatitude,
              longitude: finalLongitude,
              latitudeDelta: 0.003,
              longitudeDelta: 0.003,
            }}
            pointerEvents="none"
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}>
            <Marker
              coordinate={{latitude: finalLatitude, longitude: finalLongitude}}
            />
          </MapView>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MapPreview;
