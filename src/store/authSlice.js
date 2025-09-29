import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import socketService from '../services/socketService';
import apiService from '../services/apiService';

const initialState = {
  userRole: null, // 'teacher' | 'student' | null
  userName: '',
  isAuthenticated: false,
  userId: null,
  isKickedOut: false,
  kickReason: '',
  isConnected: false
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserRole: (state, action) => {
      state.userRole = action.payload
    },
    setUserName: (state, action) => {
      state.userName = action.payload
    },
    login: (state, action) => {
      const { role, name } = action.payload;
      state.userRole = role;
      state.userName = name;
      state.isAuthenticated = true;
      state.userId = uuidv4();
      state.isKickedOut = false;
      state.kickReason = '';
      
      // Connect to socket and join appropriate room
      socketService.connect();
      if (role === 'teacher') {
        socketService.joinAsTeacher({ teacherId: state.userId, teacherName: name });
      } else if (role === 'student') {
        socketService.joinAsParticipant({ studentId: state.userId, studentName: name });
      }
      state.isConnected = true;
    },
    logout: (state) => {
      socketService.disconnect();
      state.userRole = null;
      state.userName = '';
      state.isAuthenticated = false;
      state.userId = null;
      state.isKickedOut = false;
      state.kickReason = '';
      state.isConnected = false;
    },
    kickOut: (state, action) => {
      state.isKickedOut = true;
      state.kickReason = action.payload || 'You have been removed from the session';
    },
    clearKickOut: (state) => {
      state.isKickedOut = false;
      state.kickReason = '';
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    }
  }
});

export const { 
  setUserRole, 
  setUserName, 
  login, 
  logout, 
  kickOut, 
  clearKickOut,
  setConnectionStatus
} = authSlice.actions;

export default authSlice.reducer;