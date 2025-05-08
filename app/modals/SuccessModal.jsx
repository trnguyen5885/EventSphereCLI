// Tạo một component SuccessModal
import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  TextComponent,
  SpaceComponent,
  ButtonComponent,
} from '../components';
import { appColors } from '../constants/appColors';
import {TickCircle} from 'iconsax-react-native';

const SuccessModal = ({visible, message, onClose}) => {
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
            size={18}
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
              size={16}
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
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  messageText: {
    textAlign: 'center',
  },
});

export default SuccessModal;