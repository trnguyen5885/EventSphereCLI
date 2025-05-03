import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';
import OrganizerHeaderComponent from '../../components/OrganizerHeaderComponent';

const EventCreate = () => {
  const [selectedTicketType, setSelectedTicketType] = useState('Paid');

  const handleSelectTicketType = (type) => {
    setSelectedTicketType(type);
  };

  return (
    <View style={styles.container}>
      
        <OrganizerHeaderComponent title="Create Event" />
        <ScrollView showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.form}
        >
          <Text style={styles.label}>Event Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter event name"
            placeholderTextColor="#A0A0A0"
          />

          <Text style={styles.label}>Short Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter short description"
            placeholderTextColor="#A0A0A0"
            multiline
          />

          <Text style={styles.label}>Detailed Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter detailed description"
            placeholderTextColor="#A0A0A0"
            multiline
          />

          <Text style={styles.label}>Category</Text>
          <TouchableOpacity style={styles.selectInput}>
            <Icon name="tags" size={16} color="#555" style={styles.iconMargin} />
            <Text style={styles.selectText}>Select category</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Event Date & Time</Text>
          <TouchableOpacity style={styles.selectInput}>
            <IonIcon name="calendar-outline" size={18} color="#555" style={styles.iconMargin} />
            <Text style={styles.selectText}>Select date and time</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        <Text style={styles.label}>Event Location</Text>
        <View style={styles.mapPlaceholder} />

        <Text style={styles.label}>Cover Image</Text>
        <View style={styles.coverContainer}>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Upload Cover Image</Text>
          </TouchableOpacity>
          <View style={styles.coverImagePreview} />
        </View>

        <Text style={styles.label}>Ticket Type</Text>
        <View style={styles.checkboxContainer}>
          {['Paid', 'Free', 'Donation'].map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.checkboxRow}
              onPress={() => handleSelectTicketType(type)}
            >
              <Icon
                name={selectedTicketType === type ? 'check-square' : 'square-o'}
                size={20}
                color={selectedTicketType === type ? '#6366F1' : '#999'}
              />
              <Text style={styles.checkboxLabel}>
                {type} Ticket
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default EventCreate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginTop: 20,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  selectText: {
    fontSize: 14,
    color: '#999',
  },
  iconMargin: {
    marginRight: 8,
  },
  mapPlaceholder: {
    height: 150,
    borderRadius: 12,
    backgroundColor: '#EEE',
    marginBottom: 12,
  },
  coverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  uploadButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  coverImagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#DDD',
  },
  checkboxContainer: {
    marginTop: 8,
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#222',
  },
});
