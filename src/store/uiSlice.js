import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Current view/route
  currentView: 'landing', // 'landing' | 'teacher-profile' | 'teacher-setup' | 'student-setup' | 'poll-active' | 'poll-results' | 'waiting' | 'poll-history' | 'kicked-out'
  
  // Modal states
  showModal: false,
  modalType: null,
  modalData: null,
  
  // Form states
  formData: {},
  formErrors: {},
  
  // UI states
  sidebarOpen: false,
  theme: 'light',
  
  // Loading states for different UI sections
  loadingStates: {
    poll: false,
    participants: false,
    results: false,
  },
  
  // Notification system
  notifications: [],
  
  // Timer for polls
  timer: {
    active: false,
    remaining: 0,
    total: 0,
  },
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // View navigation
    setCurrentView: (state, action) => {
      state.currentView = action.payload
    },
    
    // Modal management
    showModal: (state, action) => {
      state.showModal = true
      state.modalType = action.payload.type
      state.modalData = action.payload.data || null
    },
    
    hideModal: (state) => {
      state.showModal = false
      state.modalType = null
      state.modalData = null
    },
    
    // Form management
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload }
    },
    
    setFormErrors: (state, action) => {
      state.formErrors = action.payload
    },
    
    clearFormData: (state) => {
      state.formData = {}
      state.formErrors = {}
    },
    
    // UI controls
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    
    // Loading states
    setLoadingState: (state, action) => {
      const { section, loading } = action.payload
      state.loadingStates[section] = loading
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: 'info', // 'success' | 'error' | 'warning' | 'info'
        ...action.payload,
        timestamp: new Date().toISOString(),
      }
      state.notifications.push(notification)
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    
    clearNotifications: (state) => {
      state.notifications = []
    },
    
    // Timer management
    startTimer: (state, action) => {
      state.timer.active = true
      state.timer.remaining = action.payload
      state.timer.total = action.payload
    },
    
    updateTimer: (state, action) => {
      state.timer.remaining = action.payload
      if (action.payload <= 0) {
        state.timer.active = false
      }
    },
    
    stopTimer: (state) => {
      state.timer.active = false
      state.timer.remaining = 0
    },
    
    resetTimer: (state) => {
      state.timer = {
        active: false,
        remaining: 0,
        total: 0,
      }
    },
    
    // Reset UI state
    resetUI: () => initialState,
  },
})

export const {
  setCurrentView,
  showModal,
  hideModal,
  updateFormData,
  setFormErrors,
  clearFormData,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLoadingState,
  addNotification,
  removeNotification,
  clearNotifications,
  startTimer,
  updateTimer,
  stopTimer,
  resetTimer,
  resetUI,
} = uiSlice.actions

export default uiSlice.reducer