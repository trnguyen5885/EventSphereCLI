import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AirbridgeService, trackEventView, trackCustomEvent } from '../services';

const AirbridgeDemo = () => {
  
  // Test deeplink creation
  const testDeeplink = () => {
    try {
      // This would typically be done on your server or marketing tools
      const testUrl = 'eventsphere://event/123456';
      console.log('Test deeplink:', testUrl);
      
      // Simulate receiving a deeplink
      AirbridgeService.handleDeeplink(testUrl);
      
      Alert.alert('Deeplink Test', 'Check console for deeplink handling');
    } catch (error) {
      console.error('Deeplink test error:', error);
    }
  };

  // Test event tracking
  const testEventTracking = () => {
    // Track a custom event
    trackCustomEvent('demo_button_clicked', {
      button_name: 'Event Tracking Test',
      timestamp: new Date().toISOString()
    });

    // Track event view
    trackEventView('demo_event_123', 'Demo Event Name');

    Alert.alert('Event Tracking', 'Events sent to Airbridge! Check console for logs.');
  };

  // Test user properties
  const testUserProperties = () => {
    AirbridgeService.setUserProperties(
      'demo_user_123',
      'demo@eventsphere.com',
      { demo_user: true, app_version: '1.0.0' }
    );

    Alert.alert('User Properties', 'User properties set in Airbridge!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Airbridge Deeplink Demo</Text>
      <Text style={styles.subtitle}>Test Airbridge Integration</Text>

      <TouchableOpacity style={styles.button} onPress={testDeeplink}>
        <Text style={styles.buttonText}>Test Deeplink Navigation</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testEventTracking}>
        <Text style={styles.buttonText}>Test Event Tracking</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testUserProperties}>
        <Text style={styles.buttonText}>Test User Properties</Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Test URLs:</Text>
        <Text style={styles.infoText}>• eventsphere://event/123456</Text>
        <Text style={styles.infoText}>• https://eventsphere.airbridge.io/event/789</Text>
        <Text style={styles.infoText}>• https://eventsphere.abr.ge/abc123</Text>
        
        <Text style={styles.infoTitle}>How to test:</Text>
        <Text style={styles.infoText}>1. Use ADB to send deeplinks to emulator</Text>
        <Text style={styles.infoText}>2. Create Airbridge tracking links</Text>
        <Text style={styles.infoText}>3. Check Airbridge dashboard for events</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default AirbridgeDemo;