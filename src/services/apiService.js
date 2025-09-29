// API service for HTTP requests to the backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Poll management
  async getCurrentPoll() {
    return this.request('/poll/current');
  }

  async createPoll(pollData) {
    return this.request('/poll/create', {
      method: 'POST',
      body: pollData,
    });
  }

  async startPoll(pollId, teacherData) {
    return this.request(`/poll/${pollId}/start`, {
      method: 'POST',
      body: teacherData,
    });
  }

  async submitResponse(pollId, responseData) {
    return this.request(`/poll/${pollId}/response`, {
      method: 'POST',
      body: responseData,
    });
  }

  async getPollResults(pollId) {
    return this.request(`/poll/${pollId}/results`);
  }

  // Participant management
  async joinAsParticipant(participantData) {
    return this.request('/participant/join', {
      method: 'POST',
      body: participantData,
    });
  }

  // Poll history
  async getPollHistory() {
    return this.request('/polls/history');
  }

  // Chat
  async getChatMessages() {
    return this.request('/chat/messages');
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;