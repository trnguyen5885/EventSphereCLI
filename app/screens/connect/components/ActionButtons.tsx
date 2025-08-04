import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../../../constants/appColors';

interface ActionButtonsProps {
  isSharing: boolean;
  onToggleSharing: () => void;
  onInviteMember: () => void;
  isUserOnline: boolean;
  isLoading?: boolean; // Loading state for sharing toggle
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isSharing,
  onToggleSharing,
  onInviteMember,
  isUserOnline,
  isLoading = false
}) => {
  return (
    <View style={styles.actionContainer}>
      <TouchableOpacity
        style={[
          styles.actionButton, 
          { 
            backgroundColor: isSharing ? appColors.primary : '#E0E0E0',
            borderWidth: 0,
            opacity: isLoading ? 0.7 : 1
          }
        ]}
        onPress={onToggleSharing}
        disabled={isLoading}
        accessibilityLabel={isSharing ? "Tắt chia sẻ vị trí" : "Bật chia sẻ vị trí"}
        accessibilityRole="button"
        accessibilityState={{ selected: isSharing, disabled: isLoading }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isSharing ? "#fff" : "#666"} />
        ) : (
          <MaterialIcons 
            name={isSharing ? "location-on" : "location-off"} 
            size={20} 
            color={isSharing ? "#fff" : "#666"} 
          />
        )}
        <Text style={[
          styles.buttonText, 
          { color: isSharing ? '#fff' : '#666' }
        ]}>
          {isLoading 
            ? 'Đang xử lý...' 
            : isSharing 
              ? 'Đang chia sẻ' 
              : 'Chia sẻ vị trí'
          }
        </Text>
        {isSharing && !isLoading && (
          <View style={styles.onlineIndicator}>
            <MaterialIcons name="circle" size={8} color="#00B894" />
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionButton, 
          { 
            backgroundColor: '#fff', 
            borderColor: appColors.primary, 
            borderWidth: 2 
          }
        ]}
        onPress={onInviteMember}
        accessibilityLabel="Mời thành viên mới"
        accessibilityRole="button"
      >
        <MaterialIcons name="person-add" size={20} color={appColors.primary} />
        <Text style={[styles.buttonText, { color: appColors.primary }]}>
          Mời thành viên
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flex: 1,
    position: 'relative',
  },
  buttonText: {
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default ActionButtons; 