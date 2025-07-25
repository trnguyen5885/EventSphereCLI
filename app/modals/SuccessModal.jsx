import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  TextComponent,
  SpaceComponent,
} from '../components';
import { appColors } from '../constants/appColors';
import { TickCircle } from 'iconsax-react-native';

const { width } = Dimensions.get('window');

const SuccessModal = ({ visible, message, onClose }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TickCircle size={60} color={appColors.primary} variant="Bold" />
          <SpaceComponent height={20} />
          <TextComponent
            text={message}
            title
            size={16}
            style={styles.messageText}
          />
          <SpaceComponent height={30} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={styles.okButton}>
            <TextComponent
              text="OK"
              color={appColors.primary}
              size={15}
              style={{ fontWeight: '600' }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  messageText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  okButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
});

export default SuccessModal;
