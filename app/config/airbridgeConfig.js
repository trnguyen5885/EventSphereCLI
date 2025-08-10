/**
 * Airbridge Configuration
 * 
 * Thay thế YOUR_AIRBRIDGE_TOKEN_HERE bằng token thực từ Airbridge dashboard
 * Để lấy token:
 * 1. Đăng nhập vào https://dashboard.airbridge.io
 * 2. Chọn app của bạn
 * 3. Vào Settings > Tokens
 * 4. Copy App Token
 */

export const AIRBRIDGE_CONFIG = {
  // App name phải khớp với tên trong Airbridge dashboard
  APP_NAME: 'eventsphere',
  
  // Token từ Airbridge dashboard - QUAN TRỌNG: thay thế bằng token thật
  APP_TOKEN: 'ca5c168a34444c75af781b06635778d5',
  
  // Deeplink scheme cho app của bạn
  DEEPLINK_SCHEME: 'eventsphere',
  
  // Domain cho universal links
  UNIVERSAL_LINK_DOMAIN: 'eventsphere.io.vn',
  
  // Tracking options
  TRACKING_OPTIONS: {
    autoStartTrackingEnabled: true,
    sessionTimeoutSeconds: 300,
    locationCollectionEnabled: false,
    trackAirbridgeLinkOnly: false,
  }
};

// Pre-defined event names cho consistency
export const AIRBRIDGE_EVENTS = {
  // User events
  USER_SIGNUP: 'airbridge.user.signup',
  USER_SIGNIN: 'airbridge.user.signin',
  USER_SIGNOUT: 'airbridge.user.signout',
  
  // Event-related tracking
  EVENT_VIEW: 'event_view',
  EVENT_SHARE: 'event_share',
  EVENT_FAVORITE: 'event_favorite',
  
  // Purchase events  
  PURCHASE: 'purchase',
  ADD_TO_CART: 'add_to_cart',
  VIEW_CART: 'view_cart',
  
  // App engagement
  APP_OPEN: 'app_open',
  SCREEN_VIEW: 'screen_view',
  BUTTON_CLICK: 'button_click',
};

// Helper function to validate config
export const validateAirbridgeConfig = () => {
  if (!AIRBRIDGE_CONFIG.APP_TOKEN || AIRBRIDGE_CONFIG.APP_TOKEN === 'YOUR_AIRBRIDGE_TOKEN_HERE') {
    console.warn('⚠️ Airbridge Token chưa được cấu hình! Hãy cập nhật APP_TOKEN trong airbridgeConfig.js');
    return false;
  }
  
  if (!AIRBRIDGE_CONFIG.APP_NAME) {
    console.error('❌ Airbridge App Name không được để trống!');
    return false;
  }
  
  return true;
};