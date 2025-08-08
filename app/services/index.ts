import AirbridgeService from './AirbridgeService';

// Export services
export { default as AirbridgeService } from './AirbridgeService';
export { default as AxiosInstance } from './api/AxiosInstance';

// Export utility functions
export { formatDate } from './utils/date';
export { formatDateCreateAt } from './utils/dateCreateAt';
export { formatTimeRange } from './utils/time';
export { formatPrice } from './utils/price';
  
// Helper functions for common tracking
export const trackEventView = (eventId: string, eventName: string) => {
  AirbridgeService.trackEventView(eventId, eventName);
};

export const trackEventBooking = (eventId: string, eventName: string, ticketPrice: number) => {
  AirbridgeService.trackEventBooking(eventId, eventName, ticketPrice);
};

export const trackUserSignUp = (userId: string, userEmail: string) => {
  AirbridgeService.trackSignUp(userId, userEmail);
};

export const trackUserSignIn = (userId: string) => {
  AirbridgeService.trackSignIn(userId);
};

export const setUserProperties = (userId: string, userEmail?: string, userAlias?: object) => {
  AirbridgeService.setUserProperties(userId, userEmail, userAlias);
};

// Custom event tracking
export const trackCustomEvent = (eventName: string, eventData?: object) => {
  AirbridgeService.sendEvent(eventName, eventData);
};