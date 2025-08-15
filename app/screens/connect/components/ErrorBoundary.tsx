import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../../../constants/appColors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log specific map-related errors
    if (error.message.includes('MapView') || error.message.includes('Google Play Services')) {
      console.error('Map-related error detected:', error.message);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const isMapError = this.state.error?.message?.includes('MapView') || 
                        this.state.error?.message?.includes('Google Play Services');

      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <MaterialIcons 
              name={isMapError ? "map" : "error-outline"} 
              size={48} 
              color={appColors.primary} 
            />
            
            <Text style={styles.errorTitle}>
              {isMapError ? 'Lỗi bản đồ' : 'Đã xảy ra lỗi'}
            </Text>
            
            <Text style={styles.errorMessage}>
              {isMapError 
                ? 'Không thể tải bản đồ. Vui lòng kiểm tra kết nối mạng và thử lại.'
                : 'Có lỗi xảy ra khi tải nội dung. Vui lòng thử lại.'
              }
            </Text>

            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <MaterialIcons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ErrorBoundary; 