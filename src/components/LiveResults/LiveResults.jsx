import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPollHistoryAsync } from '../../store/pollSlice'
import { setCurrentView } from '../../store/uiSlice'
import { kickOut } from '../../store/authSlice'
import { Button, Card, Input } from '../ui'
import socketService from '../../services/socketService'
import './LiveResults.css'

const LiveResults = () => {
  const dispatch = useDispatch()
  const { currentPoll, liveResults, participants, chatMessages } = useSelector(state => state.poll)
  const { userName, userRole, userId } = useSelector(state => state.auth)
  
  const [activeTab, setActiveTab] = useState('participants')
  const [newMessage, setNewMessage] = useState('')

    // Use real data or show empty state
  const results = currentPoll.finalResults || currentPoll.results || liveResults || {}
  const participantsList = participants || []
  const messages = chatMessages || []

  useEffect(() => {
    // Load poll history when component mounts
    if (userRole === 'teacher') {
      dispatch(fetchPollHistoryAsync())
    }
  }, [dispatch, userRole])

  const totalVotes = Object.values(results).reduce((sum, result) => {
    // Handle both old format (number) and new format (object with count)
    const count = typeof result === 'object' ? (result.count || 0) : (result || 0)
    return sum + count
  }, 0)

    const handleSendMessage = () => {
    if (newMessage.trim()) {
      socketService.sendMessage({
        message: newMessage.trim(),
        senderName: userName,
        senderRole: userRole,
        senderId: userId
      })
      setNewMessage('')
    }
  }

  const handleNewQuestion = () => {
    dispatch(setCurrentView('teacher-setup'))
  }

  const handleViewHistory = () => {
    dispatch(setCurrentView('poll-history'))
  }

  const handleKickOut = (participant) => {
    if (userRole === 'teacher') {
      socketService.kickParticipant({
        participantId: participant.id,
        reason: 'Removed by teacher'
      })
      console.log('Kicking out participant:', participant.name)
    }
  }

  const calculatePercentage = (count, total) => {
    if (!total || total === 0) return 0
    const votes = typeof count === 'object' ? (count.count || 0) : (count || 0)
    if (isNaN(votes) || isNaN(total)) return 0
    return Math.round((votes / total) * 100)
  }

  return (
    <div className="live-results">
      <div className="live-results__container">
        <div className="live-results__main">
          <Card className="results-card">
            <div className="results-header">
              <h2>Question</h2>
              <div className="header-actions">
                {userRole === 'teacher' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleViewHistory}
                      className="view-history-btn"
                    >
                      📊 View Poll history
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleNewQuestion}
                      className="new-question-btn"
                    >
                      + Ask a new question
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="question-display">
              <div className="question-text">
                {currentPoll.question || 'Which planet is known as the Red Planet?'}
              </div>
            </div>

            <div className="results-visualization">
              {/* Show overall correct/incorrect statistics first */}
              {currentPoll.summary && (
                <div className="results-summary">
                  <div className="summary-stats">
                    <div className="stat-item correct">
                      <div className="stat-icon">✅</div>
                      <div className="stat-info">
                        <div className="stat-value">{currentPoll.summary.correctPercentage || 0}%</div>
                        <div className="stat-label">Correct</div>
                        <div className="stat-count">({currentPoll.summary.correctResponses || 0} students)</div>
                      </div>
                    </div>
                    <div className="stat-item incorrect">
                      <div className="stat-icon">❌</div>
                      <div className="stat-info">
                        <div className="stat-value">{currentPoll.summary.incorrectPercentage || 0}%</div>
                        <div className="stat-label">Incorrect</div>
                        <div className="stat-count">({currentPoll.summary.incorrectResponses} students)</div>
                      </div>
                    </div>
                    <div className="stat-item total">
                      <div className="stat-icon">👥</div>
                      <div className="stat-info">
                        <div className="stat-value">{currentPoll.summary.totalResponses}</div>
                        <div className="stat-label">Total</div>
                        <div className="stat-count">responses</div>
                      </div>
                    </div>
                  </div>
                  {currentPoll.summary.correctAnswer && (
                    <div className="correct-answer-display">
                      <div className="correct-answer-label">Correct Answer:</div>
                      <div className="correct-answer-value">{currentPoll.summary.correctAnswer}</div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Individual option results */}
              {currentPoll.options && currentPoll.options.map((option, index) => {
                const result = results[option] || {}
                const count = typeof result === 'object' ? (result.count || 0) : (result || 0)
                const percentage = calculatePercentage(count, totalVotes)
                const isCorrect = currentPoll.correctAnswer === index || (currentPoll.summary?.correctAnswer === option)
                
                return (
                  <div key={option} className={`result-bar ${isCorrect ? 'correct-answer' : ''}`}>
                    <div className="result-info">
                      <div className="result-option">
                        <span className="option-number">{index + 1}</span>
                        <span className="option-text">{option}</span>
                        {isCorrect && <span className="correct-indicator">✅ Correct</span>}
                      </div>
                      <div className="result-stats">
                        <span className="percentage">{percentage}%</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${isCorrect ? 'correct' : ''}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>

            {userRole === 'student' && (
              <div className="waiting-message">
                <p>Wait for the teacher to ask a new question..</p>
              </div>
            )}
          </Card>
        </div>

        <div className="live-results__sidebar">
          <div className="sidebar-tabs">
            <button
              className={`tab-button ${activeTab === 'chat' ? 'tab-button--active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`tab-button ${activeTab === 'participants' ? 'tab-button--active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              Participants
            </button>
          </div>

          <Card className="sidebar-content">
            {activeTab === 'chat' ? (
              <div className="chat-section">
                <div className="chat-messages">
                  {messages.map((message, index) => (
                    <div key={message.id || index} className="chat-message">
                      <div className="message-header">
                        <span className="message-user">{message.senderName || message.user}</span>
                        <span className="message-role">({message.senderRole || 'user'})</span>
                      </div>
                      <div className="message-text">{message.message}</div>
                    </div>
                  ))}
                </div>
                <div className="chat-input">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    variant="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            ) : (
              <div className="participants-section">
                <div className="participants-header">
                  <h3>Name</h3>
                  {userRole === 'teacher' && <h3>Action</h3>}
                </div>
                <div className="participants-list">
                  {participantsList.map((participant) => (
                    <div key={participant.id} className="participant-item">
                      <div className="participant-info">
                        <span className="participant-name">{participant.name}</span>
                      </div>
                      {userRole === 'teacher' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleKickOut(participant)}
                          className="kick-btn"
                        >
                          Kick out
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LiveResults