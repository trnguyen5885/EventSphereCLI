import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import friendRequestReducer from './slices/friendRequestSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // chỉ lưu slice "auth"
};

const rootReducer = combineReducers({
  auth: authReducer,
  friendRequest: friendRequestReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, // ✅ truyền trực tiếp
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // tránh lỗi với non-serializable values
    }),
});

export const persistor = persistStore(store);
