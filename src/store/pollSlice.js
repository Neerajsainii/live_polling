import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import apiService from '../services/apiService';
import socketService from '../services/socketService';

// Async thunks for API calls
export const createPollAsync = createAsyncThunk(
  'poll/createPoll',
  async (pollData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.createPoll({
        ...pollData,
        teacherId: auth.userId,
        teacherName: auth.userName
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const startPollAsync = createAsyncThunk(
  'poll/startPoll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { poll, auth } = getState();
      const response = await apiService.startPoll(poll.currentPoll.id, {
        teacherId: auth.userId
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitResponseAsync = createAsyncThunk(
  'poll/submitResponse',
  async (answer, { getState, rejectWithValue }) => {
    try {
      const { poll, auth } = getState();
      const response = await apiService.submitResponse(poll.currentPoll.id, {
        studentId: auth.userId,
        studentName: auth.userName,
        selectedOption: answer // Fix: Use selectedOption instead of answer
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinAsParticipantAsync = createAsyncThunk(
  'poll/joinAsParticipant',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.joinAsParticipant({
        studentId: auth.userId,
        studentName: auth.userName
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPollHistoryAsync = createAsyncThunk(
  'poll/fetchPollHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getPollHistory();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCurrentPollAsync = createAsyncThunk(
  'poll/fetchCurrentPoll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCurrentPoll();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Current poll data
  currentPoll: {
    id: null,
    question: '',
    options: [],
    duration: 60,
    isActive: false,
    timeLeft: 0,
    startTime: null,
    endTime: null,
    createdAt: null,
    responses: {},
    results: {}
  },
  
  // Poll history
  pollHistory: [],
  
  // Participants
  participants: [],
  
  // Live results
  liveResults: {},
  
  // User responses for feedback
  userResponses: {},
  
  // Chat messages
  chatMessages: [],
  
  // Timer
  timer: {
    timeLeft: 0,
    isRunning: false,
  },

  // Loading states
  loading: {
    createPoll: false,
    startPoll: false,
    submitResponse: false,
    joinParticipant: false,
    fetchHistory: false
  },

  // Error states  
  error: null
};

export const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    // Poll creation and management
    createPoll: (state, action) => {
      const newPoll = {
        id: action.payload.id,
        question: action.payload.question,
        options: action.payload.options,
        duration: action.payload.duration,
        isActive: false,
        createdAt: new Date().toISOString(),
        responses: {},
      }
      state.currentPoll = newPoll
      state.pollHistory.unshift(newPoll)
    },
    
    updatePollQuestion: (state, action) => {
      state.currentPoll.question = action.payload
    },
    
    updatePollOptions: (state, action) => {
      state.currentPoll.options = action.payload
    },
    
    updatePollDuration: (state, action) => {
      state.currentPoll.duration = action.payload
    },
    
    startPoll: (state) => {
      state.currentPoll.isActive = true
      state.currentPoll.responses = {}
      state.liveResults = {}
    },
    
    endPoll: (state) => {
      state.currentPoll.isActive = false
    },
    
    // Response handling
    submitResponse: (state, action) => {
      const { userId, userName, response } = action.payload
      state.currentPoll.responses[userId] = {
        userId,
        userName,
        response,
        timestamp: new Date().toISOString(),
      }
      state.userResponses[state.currentPoll.id] = response
      
      // Update live results
      const results = {}
      Object.values(state.currentPoll.responses).forEach(resp => {
        if (results[resp.response]) {
          results[resp.response]++
        } else {
          results[resp.response] = 1
        }
      })
      state.liveResults = results
    },
    
    // Participant management
    addParticipant: (state, action) => {
      const participant = action.payload
      if (!state.participants.find(p => p.id === participant.id)) {
        state.participants.push(participant)
      }
    },
    
    removeParticipant: (state, action) => {
      state.participants = state.participants.filter(p => p.id !== action.payload)
    },
    
    updateParticipants: (state, action) => {
      state.participants = action.payload
    },
    
    // Chat functionality
    addChatMessage: (state, action) => {
      state.chatMessages.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      })
    },
    
    clearChat: (state) => {
      state.chatMessages = []
    },
    
    // Utility actions
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    
    setError: (state, action) => {
      state.error = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },

    // Poll history management
    setPollHistory: (state, action) => {
      state.pollHistory = action.payload
    },

    // Socket.io real-time updates
    updatePollFromSocket: (state, action) => {
      const { poll, results, participants, summary } = action.payload;
      if (poll) {
        state.currentPoll = { ...state.currentPoll, ...poll };
      }
      if (results) {
        state.liveResults = results;
        state.currentPoll.results = results;
      }
      if (participants) {
        state.participants = participants;
      }
      if (summary) {
        state.currentPoll.summary = summary;
      }
    },

    updateTimer: (state, action) => {
      state.timer.timeLeft = action.payload;
      state.currentPoll.timeLeft = action.payload;
      if (action.payload <= 0) {
        state.timer.isRunning = false;
        state.currentPoll.isActive = false;
      }
    },

    addChatMessageFromSocket: (state, action) => {
      state.chatMessages.push(action.payload);
      // Keep only last 100 messages
      if (state.chatMessages.length > 100) {
        state.chatMessages = state.chatMessages.slice(-100);
      }
    },

    updateParticipantsFromSocket: (state, action) => {
      state.participants = action.payload;
    },

    setPollHistory: (state, action) => {
      state.pollHistory = action.payload;
    },
    
    resetPoll: () => initialState,
  },
  extraReducers: (builder) => {
    // Create Poll
    builder
      .addCase(createPollAsync.pending, (state) => {
        state.loading.createPoll = true;
        state.error = null;
      })
      .addCase(createPollAsync.fulfilled, (state, action) => {
        state.loading.createPoll = false;
        if (action.payload.poll) {
          state.currentPoll = action.payload.poll;
        }
      })
      .addCase(createPollAsync.rejected, (state, action) => {
        state.loading.createPoll = false;
        state.error = action.payload;
      })
      
      // Start Poll
      .addCase(startPollAsync.pending, (state) => {
        state.loading.startPoll = true;
        state.error = null;
      })
      .addCase(startPollAsync.fulfilled, (state, action) => {
        state.loading.startPoll = false;
        if (action.payload.poll) {
          state.currentPoll = action.payload.poll;
          state.timer.timeLeft = action.payload.poll.timeLeft || action.payload.poll.duration;
          state.timer.isRunning = true;
        }
      })
      .addCase(startPollAsync.rejected, (state, action) => {
        state.loading.startPoll = false;
        state.error = action.payload;
      })

      // Submit Response
      .addCase(submitResponseAsync.pending, (state) => {
        state.loading.submitResponse = true;
        state.error = null;
      })
      .addCase(submitResponseAsync.fulfilled, (state, action) => {
        state.loading.submitResponse = false;
        if (action.payload.results) {
          state.liveResults = action.payload.results;
          state.currentPoll.results = action.payload.results;
        }
        // Store the user's response for feedback
        if (action.meta.arg && state.currentPoll.id) {
          state.userResponses[state.currentPoll.id] = action.meta.arg;
        }
      })
      .addCase(submitResponseAsync.rejected, (state, action) => {
        state.loading.submitResponse = false;
        state.error = action.payload;
      })

      // Join as Participant
      .addCase(joinAsParticipantAsync.pending, (state) => {
        state.loading.joinParticipant = true;
        state.error = null;
      })
      .addCase(joinAsParticipantAsync.fulfilled, (state, action) => {
        state.loading.joinParticipant = false;
        if (action.payload.participants) {
          state.participants = action.payload.participants;
        }
      })
      .addCase(joinAsParticipantAsync.rejected, (state, action) => {
        state.loading.joinParticipant = false;
        state.error = action.payload;
      })

      // Fetch Poll History
      .addCase(fetchPollHistoryAsync.pending, (state) => {
        state.loading.fetchHistory = true;
        state.error = null;
      })
      .addCase(fetchPollHistoryAsync.fulfilled, (state, action) => {
        state.loading.fetchHistory = false;
        if (action.payload.polls) {
          state.pollHistory = action.payload.polls;
        }
      })
      .addCase(fetchPollHistoryAsync.rejected, (state, action) => {
        state.loading.fetchHistory = false;
        state.error = action.payload;
      })

      // Fetch Current Poll
      .addCase(fetchCurrentPollAsync.fulfilled, (state, action) => {
        if (action.payload.poll) {
          state.currentPoll = action.payload.poll;
        }
        if (action.payload.participants) {
          state.participants = action.payload.participants;
        }
      });
  }
});

export const {
  createPoll,
  updatePollQuestion,
  updatePollOptions,
  updatePollDuration,
  startPoll,
  endPoll,
  submitResponse,
  addParticipant,
  removeParticipant,
  updateParticipants,
  addChatMessage,
  clearChat,
  setLoading,
  setError,
  clearError,
  updatePollFromSocket,
  updateTimer,
  addChatMessageFromSocket,
  updateParticipantsFromSocket,
  setPollHistory,
  resetPoll,
} = pollSlice.actions

export default pollSlice.reducer