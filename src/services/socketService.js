import io from 'socket.io-client';

// Socket.io configuration
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isProduction = import.meta.env.VITE_APP_ENV === 'production';
  }

  connect() {
    // Skip socket connection in production (serverless doesn't support persistent connections)
    if (this.isProduction) {
      console.log('⚠️ Socket.io disabled in production (serverless environment)');
      this.isConnected = false;
      return null;
    }

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to server:', this.socket.id);
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.isConnected = false;
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join as teacher
  joinAsTeacher(teacherData) {
    if (this.socket) {
      this.socket.emit('joinTeacher', teacherData);
    }
  }

  // Join as participant (student)
  joinAsParticipant(studentData) {
    if (this.socket) {
      this.socket.emit('joinParticipant', studentData);
    }
  }

  // Send chat message
  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('sendMessage', messageData);
    }
  }

  // Kick participant (teacher only)
  kickParticipant(participantData) {
    if (this.socket) {
      this.socket.emit('kickParticipant', participantData);
    }
  }

  // Event listeners
  onPollStarted(callback) {
    if (this.socket) {
      this.socket.on('pollStarted', callback);
    }
  }

  onPollEnded(callback) {
    if (this.socket) {
      this.socket.on('pollEnded', callback);
    }
  }

  onResponseSubmitted(callback) {
    if (this.socket) {
      this.socket.on('responseSubmitted', callback);
    }
  }

  onTimerUpdate(callback) {
    if (this.socket) {
      this.socket.on('timerUpdate', callback);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  onParticipantJoined(callback) {
    if (this.socket) {
      this.socket.on('participantJoined', callback);
    }
  }

  onParticipantRemoved(callback) {
    if (this.socket) {
      this.socket.on('participantRemoved', callback);
    }
  }

  onParticipantUpdate(callback) {
    if (this.socket) {
      this.socket.on('participantUpdate', callback);
    }
  }

  onKickedOut(callback) {
    if (this.socket) {
      this.socket.on('kickedOut', callback);
    }
  }

  onCurrentPoll(callback) {
    if (this.socket) {
      this.socket.on('currentPoll', callback);
    }
  }

  // Remove specific event listeners
  offEvent(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  // Remove all listeners for an event
  offAllListeners(eventName) {
    if (this.socket) {
      this.socket.removeAllListeners(eventName);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;