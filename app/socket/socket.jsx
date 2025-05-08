import io from 'socket.io-client';
import { appInfo } from '../constants/appInfos';

let socket;

export const initSocket = (userId) => {
  socket = io(appInfo.BASE_URL_NOAPI, {
    reconnectionAttempts: 5,  // Maximum reconnection attempts
    reconnectionDelay: 1000,  // Delay between reconnection attempts
    transports: ['websocket', 'polling'], // Match server configuration
    withCredentials: true, // Enable credentials since server has credentials: true
  });
  
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    if (userId) {
      socket.emit("joinRoom", userId);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  // Add more error handling
  socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
  });

  socket.on("connect_timeout", () => {
    console.error("Connection timeout");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
};
  
export const getSocket = () => {
  if (!socket) {
    console.warn("⚠️ Socket has not been initialized");
  }
  return socket;
};
