import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import pollReducer from './pollSlice';
import uiReducer from './uiSlice';
import socketMiddleware from './socketMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    poll: pollReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(socketMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;