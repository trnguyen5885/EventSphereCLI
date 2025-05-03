import React from 'react';
import {View, StyleSheet, Linking} from 'react-native';
import MapView, {Marker} from 'react-native-maps';

const EventMap = ({latitude, longitude, title}) => {
  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(err =>
      console.error('Lỗi khi mở Google Maps:', err),
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        provider="google"
        scrollEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        zoomEnabled={false}
        onPress={openGoogleMaps}>
        <Marker
          coordinate={{latitude, longitude}}
          title={title}
          description="Nhấn để mở Google Maps"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});

export default EventMap;
