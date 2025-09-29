import socketService from '../services/socketService';
import { 
  updatePollFromSocket, 
  updateTimer, 
  addChatMessageFromSocket, 
  updateParticipantsFromSocket,
  setPollHistory 
} from './pollSlice';
import { kickOut, setConnectionStatus } from './authSlice';
import { setCurrentView } from './uiSlice';

// Socket middleware to handle real-time events
export const socketMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Initialize socket listeners after login
  if (action.type === 'auth/login') {
    const socket = socketService.connect();
    
    if (socket) {
      // Connection status
      socket.on('connect', () => {
        store.dispatch(setConnectionStatus(true));
      });

      socket.on('disconnect', () => {
        store.dispatch(setConnectionStatus(false));
      });

      // Poll events
      socket.on('pollStarted', (data) => {
        store.dispatch(updatePollFromSocket(data));
        store.dispatch(setCurrentView('poll-active'));
      });

      socket.on('pollEnded', (data) => {
        store.dispatch(updatePollFromSocket(data));
        store.dispatch(setCurrentView('poll-results'));
      });

      socket.on('responseSubmitted', (data) => {
        store.dispatch(updatePollFromSocket(data));
      });

      socket.on('timerUpdate', (data) => {
        store.dispatch(updateTimer(data.timeLeft));
      });

      socket.on('currentPoll', (data) => {
        store.dispatch(updatePollFromSocket(data));
        if (data.poll) {
          if (data.poll.isActive) {
            store.dispatch(setCurrentView('poll-active'));
          } else if (data.poll.results) {
            store.dispatch(setCurrentView('poll-results'));
          }
        }
      });

      // Chat events
      socket.on('newMessage', (message) => {
        store.dispatch(addChatMessageFromSocket(message));
      });

      // Participant events
      socket.on('participantJoined', (data) => {
        if (data.participants) {
          store.dispatch(updateParticipantsFromSocket(data.participants));
        }
      });

      socket.on('participantRemoved', (data) => {
        if (data.participants) {
          store.dispatch(updateParticipantsFromSocket(data.participants));
        }
      });

      socket.on('participantUpdate', (data) => {
        if (data.participants) {
          store.dispatch(updateParticipantsFromSocket(data.participants));
        }
      });

      // Kick out event
      socket.on('kickedOut', (data) => {
        store.dispatch(kickOut(data.reason));
        store.dispatch(setCurrentView('kicked-out'));
        socketService.disconnect();
      });
    }
  }

  // Clean up socket listeners on logout
  if (action.type === 'auth/logout') {
    socketService.disconnect();
    store.dispatch(setConnectionStatus(false));
  }

  return result;
};

export default socketMiddleware;