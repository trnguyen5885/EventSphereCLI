import {useState, useCallback} from 'react';

interface ModalConfig {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  showCancelButton?: boolean;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showIcon?: boolean;
}

export const useCommonModal = () => {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showModal = useCallback((config: ModalConfig) => {
    setModalConfig(config);
    setVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setVisible(false);
    setModalConfig(null);
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showModal({
      title: title || 'Thành công',
      message,
      type: 'success',
      confirmText: 'OK',
    });
  }, [showModal]);

  const showError = useCallback((message: string, title?: string) => {
    showModal({
      title: title || 'Lỗi',
      message,
      type: 'error',
      confirmText: 'OK',
    });
  }, [showModal]);

  const showWarning = useCallback((message: string, title?: string) => {
    showModal({
      title: title || 'Cảnh báo',
      message,
      type: 'warning',
      confirmText: 'OK',
    });
  }, [showModal]);

  const showInfo = useCallback((message: string, title?: string) => {
    showModal({
      title: title || 'Thông báo',
      message,
      type: 'info',
      confirmText: 'OK',
    });
  }, [showModal]);

  const showConfirm = useCallback((
    message: string,
    onConfirm: () => void,
    title?: string,
    confirmText?: string,
    cancelText?: string
  ) => {
    showModal({
      title: title || 'Xác nhận',
      message,
      type: 'warning',
      showCancelButton: true,
      confirmText: confirmText || 'Xác nhận',
      cancelText: cancelText || 'Hủy',
      onConfirm: () => {
        onConfirm();
        hideModal();
      },
    });
  }, [showModal, hideModal]);

  const showAlert = useCallback((
    message: string,
    title?: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    showModal({
      title: title || 'Thông báo',
      message,
      type,
      confirmText: 'OK',
    });
  }, [showModal]);

  return {
    visible,
    modalConfig,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showAlert,
  };
};
