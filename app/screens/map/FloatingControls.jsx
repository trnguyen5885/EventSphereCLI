import React from 'react';
import {View, TouchableOpacity, Text, Image, StyleSheet} from 'react-native';

const FloatingControls = ({
  onZoomIn,
  onZoomOut,
  onCenterUser,

  // Icon riêng cho CenterUser
  centerUserIcon,

  // Text fallback
  zoomInText = '+',
  zoomOutText = '-',
  centerUserText = 'Vị trí tôi',

  // Container style
  style,

  // Style chung
  textStyle,

  // Style riêng cho từng button
  centerUserButtonStyle,
  zoomInButtonStyle,
  zoomOutButtonStyle,

  // Icon style riêng
  centerUserIconStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Center User */}
      <TouchableOpacity
        onPress={onCenterUser}
        style={[styles.button, centerUserButtonStyle]}>
        {centerUserIcon ? (
          <Image
            source={centerUserIcon}
            style={[styles.icon, centerUserIconStyle]}
          />
        ) : (
          <Text style={[styles.text, textStyle]}>{centerUserText}</Text>
        )}
      </TouchableOpacity>

      {/* Zoom In */}
      <TouchableOpacity
        onPress={onZoomIn}
        style={[styles.button, zoomInButtonStyle]}>
        <Text style={[styles.text, textStyle]}>{zoomInText}</Text>
      </TouchableOpacity>

      {/* Zoom Out */}
      <TouchableOpacity
        onPress={onZoomOut}
        style={[styles.button, zoomOutButtonStyle]}>
        <Text style={[styles.text, textStyle]}>{zoomOutText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    top: 100,
    alignItems: 'center',
  },
  button: {
    marginVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    color: 'black',
    fontWeight: 'bold',
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default FloatingControls;
