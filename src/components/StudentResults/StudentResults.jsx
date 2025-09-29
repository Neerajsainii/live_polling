import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Input, Button } from '../ui'
import socketService from '../../services/socketService'
import { addChatMessage } from '../../store/pollSlice'
import './StudentResults.css'

const StudentResults = () => {
  const dispatch = useDispatch()
  const { currentPoll, liveResults, participants, chatMessages } = useSelector(state => state.poll)
  const { userName, userId } = useSelector(state => state.auth)
  const [activeTab, setActiveTab] = useState('chat')
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messageSending, setMessageSending] = useState(false)
  const [userResponse, setUserResponse] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Fetch user's response when poll data is available
  useEffect(() => {
    const fetchUserResponse = async () => {
      if (currentPoll.id && userId && !currentPoll.isActive) {
        try {
          const response = await fetch(`http://localhost:3001/api/poll/${currentPoll.id}/response/${userId}`)
          if (response.ok) {
            const data = await response.json()
            setUserResponse(data)
          }
        } catch (error) {
          console.error('Error fetching user response:', error)
        }
      }
    }

    fetchUserResponse()
  }, [currentPoll.id, userId, currentPoll.isActive])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  // Listen for new chat messages
  useEffect(() => {
    const handleNewMessage = (messageData) => {
      dispatch(addChatMessage(messageData))
    }

    socketService.onNewMessage(handleNewMessage)

    return () => {
      socketService.offEvent('newMessage', handleNewMessage)
    }
  }, [dispatch])

  // Mock data for demonstration
  const mockPoll = {
    id: 'poll-1',
    question: 'Which planet is known as the Red Planet?',
    options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
    isActive: false
  }

  const mockResults = {
    'Mars': 15,
    'Venus': 1, 
    'Jupiter': 1,
    'Saturn': 3
  }

  const activePoll = currentPoll.id ? currentPoll : mockPoll
  const results = currentPoll.finalResults || currentPoll.results || Object.keys(liveResults).length > 0 ? liveResults : mockResults
  const totalVotes = Object.values(results).reduce((sum, result) => {
    // Handle both old format (number) and new format (object with count)
    const count = typeof result === 'object' ? (result.count || 0) : (result || 0)
    return sum + count
  }, 0)
  const messages = chatMessages || []
  const participantsList = participants || []

  const handleSendMessage = async () => {
    if (newMessage.trim() && userName && userId && !messageSending) {
      setMessageSending(true)
      try {
        const messageData = {
          message: newMessage.trim(),
          senderName: userName,
          senderRole: 'student',
          senderId: userId,
          timestamp: new Date().toISOString()
        }
        
        socketService.sendMessage(messageData)
        setNewMessage('')
        
        // Focus back to input for smooth UX
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
        
      } catch (error) {
        console.error('Failed to send message:', error)
      } finally {
        setMessageSending(false)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e) => {
    setNewMessage(e.target.value)
    
    // Show typing indicator (can be enhanced later)
    if (!isTyping) {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 1000)
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

    const calculatePercentage = (count, total) => {
    if (!total || total === 0) return 0
    const votes = typeof count === 'object' ? (count.count || 0) : (count || 0)
    if (isNaN(votes) || isNaN(total)) return 0
    return Math.round((votes / total) * 100)
  }

  return (
    <div className="student-results">
      <div className="student-results__container">
        <div className="student-results__header">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">Intervue Poll</span>
          </div>
          <div className="question-info">
            <span className="question-number">Question 1</span>
            <div className="timer-info">
              <span className="timer-icon">⏰</span>
              <span className="timer-text">00:15</span>
            </div>
          </div>
        </div>

        <Card className="results-card">
          <div className="question-section">
            <h2 className="question-title">Question</h2>
            <div className="question-text">{activePoll.question}</div>
          </div>

          <div className="results-section">
            {/* Show user's individual feedback first */}
            {userResponse && userResponse.hasResponded && (
              <div className="individual-feedback">
                <div className="feedback-title">Your Answer</div>
                <div className={`feedback-result ${userResponse.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="feedback-icon">
                    {userResponse.isCorrect ? '✅' : '❌'}
                  </div>
                  <div className="feedback-info">
                    <div className="feedback-message">
                      {userResponse.isCorrect ? 'Correct!' : 'Incorrect'}
                    </div>
                    <div className="feedback-detail">
                      You selected: <strong>{userResponse.response}</strong>
                    </div>
                    {!userResponse.isCorrect && (
                      <div className="feedback-correct">
                        Correct answer: <strong>{userResponse.correctAnswer}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Show overall correct/incorrect statistics if available */}
            {currentPoll.summary && (
              <div className="results-summary">
                <div className="summary-title">Poll Results Summary</div>
                <div className="summary-stats">
                  <div className="stat-item correct">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <div className="stat-value">{currentPoll.summary.correctPercentage}%</div>
                      <div className="stat-label">Got it right</div>
                    </div>
                  </div>
                  <div className="stat-item incorrect">
                    <div className="stat-icon">❌</div>
                    <div className="stat-info">
                      <div className="stat-value">{currentPoll.summary.incorrectPercentage}%</div>
                      <div className="stat-label">Incorrect</div>
                    </div>
                  </div>
                </div>
                {currentPoll.summary.correctAnswer && (
                  <div className="correct-answer-display">
                    <div className="correct-answer-label">The correct answer was:</div>
                    <div className="correct-answer-value">{currentPoll.summary.correctAnswer}</div>
                  </div>
                )}
              </div>
            )}
            
            <div className="results-visualization">
              {activePoll.options.map((option, index) => {
                const result = results[option] || {}
                const count = typeof result === 'object' ? (result.count || 0) : (result || 0)
                const percentage = calculatePercentage(count, totalVotes)
                const isCorrect = currentPoll.correctAnswer === index || (currentPoll.summary?.correctAnswer === option)
                const isUserAnswer = userResponse && userResponse.hasResponded && userResponse.response === option
                
                return (
                  <div key={index} className={`result-bar ${isCorrect ? 'correct-answer' : ''} ${isUserAnswer ? 'user-choice' : ''}`}>
                    <div className="result-info">
                      <div className="result-option">
                        <span className="option-number">{index + 1}</span>
                        <span className="option-text">{option}</span>
                        {isCorrect && <span className="correct-indicator">✅ Correct</span>}
                        {isUserAnswer && <span className="user-choice-indicator">👤 Your choice</span>}
                      </div>
                      <div className="result-stats">
                        <span className="percentage">{percentage}%</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${isCorrect ? 'correct' : ''} ${isUserAnswer ? 'user-choice' : ''}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="waiting-message">
            <p>Wait for the teacher to ask a new question..</p>
          </div>
        </Card>

        {/* Chat sidebar - matching the mockup */}
        <div className="chat-sidebar">
          <Card className="chat-card" padding="md">
            <div className="chat-header">
              <div className="chat-tabs">
                <button 
                  className={`chat-tab ${activeTab === 'chat' ? 'chat-tab--active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  Chat
                </button>
                <button 
                  className={`chat-tab ${activeTab === 'participants' ? 'chat-tab--active' : ''}`}
                  onClick={() => setActiveTab('participants')}
                >
                  Participants ({participantsList.length})
                </button>
              </div>
            </div>

            <div className="chat-content">
              {activeTab === 'chat' ? (
                <div className="chat-section">
                  <div className="chat-messages">
                    {messages.length === 0 ? (
                      <div className="no-messages">No messages yet. Start the conversation!</div>
                    ) : (
                      <>
                        {messages.map((message, index) => (
                          <div 
                            key={message.id || `msg-${index}`} 
                            className={`chat-message ${message.senderId === userId ? 'own-message' : ''}`}
                          >
                            <div className="message-header">
                              <span className="message-user">{message.senderName}</span>
                              <span className="message-role">({message.senderRole})</span>
                              {message.timestamp && (
                                <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                              )}
                            </div>
                            <div className="message-text">{message.message}</div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                  <div className="chat-input">
                    <div className="input-container">
                      <Input
                        ref={inputRef}
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        onKeyPress={handleKeyPress}
                        disabled={messageSending}
                        maxLength={500}
                      />
                      {newMessage.length > 450 && (
                        <div className="char-counter">
                          {newMessage.length}/500
                        </div>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || messageSending}
                      loading={messageSending}
                    >
                      {messageSending ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                  {isTyping && userName && (
                    <div className="typing-indicator">
                      <span>{userName} is typing...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="participants-section">
                  <div className="participants-header">
                    <h3>Online Now ({participantsList.length})</h3>
                  </div>
                  <div className="participants-list">
                    {participantsList.length === 0 ? (
                      <div className="no-participants">No participants yet</div>
                    ) : (
                      participantsList.map((participant, index) => (
                        <div key={participant.id || `participant-${index}`} className="participant-item">
                          <div className="participant-avatar">
                            {participant.name ? participant.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="participant-info">
                            <div className="participant-name">{participant.name || 'Anonymous'}</div>
                            <div className="participant-details">
                              <span className="participant-role">{participant.role}</span>
                              <span className="online-indicator">●</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StudentResults