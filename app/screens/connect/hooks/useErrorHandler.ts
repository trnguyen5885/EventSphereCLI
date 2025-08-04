import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { GroupError } from '../types/GroupTypes';

interface UseErrorHandlerReturn {
  error: GroupError | null;
  setError: (error: GroupError | null) => void;
  handleError: (error: any, context?: string) => void;
  clearError: () => void;
  showErrorAlert: (title?: string) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<GroupError | null>(null);

  const handleError = useCallback((error: any, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error);

    let groupError: GroupError;

    // Network errors
    if (error.response?.status >= 400) {
      groupError = {
        type: 'network',
        message: getNetworkErrorMessage(error.response.status),
      };
    }
    // Permission errors
    else if (error.message?.includes('permission') || error.message?.includes('PERMISSION')) {
      groupError = {
        type: 'permission',
        message: 'Ứng dụng cần quyền truy cập để thực hiện chức năng này',
      };
    }
    // Location errors
    else if (error.message?.includes('location') || error.code === 'LOCATION_ERROR') {
      groupError = {
        type: 'location',
        message: 'Không thể lấy vị trí. Vui lòng kiểm tra GPS và quyền truy cập vị trí',
      };
    }
    // General errors
    else {
      groupError = {
        type: 'general',
        message: error.message || 'Đã xảy ra lỗi không xác định',
      };
    }

    setError(groupError);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const showErrorAlert = useCallback((title: string = 'Lỗi') => {
    if (!error) return;

    Alert.alert(
      title,
      error.message,
      [
        {
          text: 'Đóng',
          style: 'cancel',
          onPress: clearError
        },
        ...(error.retry ? [{
          text: 'Thử lại',
          onPress: () => {
            clearError();
            error.retry?.();
          }
        }] : [])
      ]
    );
  }, [error, clearError]);

  return {
    error,
    setError,
    handleError,
    clearError,
    showErrorAlert
  };
};

const getNetworkErrorMessage = (status: number): string => {
  switch (status) {
    case 401:
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
    case 403:
      return 'Bạn không có quyền thực hiện thao tác này';
    case 404:
      return 'Không tìm thấy dữ liệu yêu cầu';
    case 408:
      return 'Kết nối bị timeout. Vui lòng kiểm tra mạng';
    case 500:
      return 'Lỗi server. Vui lòng thử lại sau';
    case 503:
      return 'Dịch vụ tạm thời không khả dụng';
    default:
      return 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại';
  }
}; 