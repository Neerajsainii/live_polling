import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { submitResponseAsync } from '../../store/pollSlice'
import { setCurrentView } from '../../store/uiSlice'
import { Button, Card } from '../ui'
import './PollInterface.css'

const PollInterface = () => {
  const dispatch = useDispatch()
  const { currentPoll, loading, error } = useSelector(state => state.poll)
  const { userName, userId } = useSelector(state => state.auth)
  const { timer } = useSelector(state => state.ui)
  
  const [selectedOption, setSelectedOption] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(currentPoll.timeLeft || currentPoll.duration || 60)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Check if user has already submitted (from responses in poll data)
  const userHasAnswered = currentPoll.responses && currentPoll.responses[userId]

  useEffect(() => {
    // Update time from current poll
    if (currentPoll.timeLeft !== undefined) {
      setTimeRemaining(currentPoll.timeLeft)
    }
    
    // Check if user already answered
    if (userHasAnswered) {
      setHasSubmitted(true)
      setSelectedOption(userHasAnswered.answer)
    }
  }, [currentPoll, userId, userHasAnswered])

  useEffect(() => {
    // Auto-redirect when poll ends
    if (timeRemaining <= 0 && currentPoll.isActive === false) {
      dispatch(setCurrentView('poll-results'))
    }
  }, [timeRemaining, currentPoll.isActive, dispatch])

  const handleOptionSelect = (option) => {
    if (!hasSubmitted && timeRemaining > 0) {
      setSelectedOption(option)
    }  const handleSubmit = async () => {
    if (selectedOption && !hasSubmitted && timeRemaining > 0) {
      try {
        await dispatch(submitResponseAsync(selectedOption))
        setHasSubmitted(true)
        // Results will be shown via Socket.io updates
      } catch (error) {
        console.error('Failed to submit response:', error)
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="poll-interface">
      <div className="poll-interface__container">
        <div className="poll-interface__header">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">Intervue Poll</span>
          </div>
          <div className="poll-meta">
            <div className="question-number">Question 1</div>
            <div className="timer">
              <span className="timer-icon">⏰</span>
              <span className="timer-text">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>

        <Card className="poll-card">
          <div className="poll-question">
            <h2>{currentPoll.question || 'Loading question...'}</h2>
          </div>

          <div className="poll-options">
            {currentPoll.options && currentPoll.options.map((option, index) => (
              <div
                key={index}
                className={`poll-option ${selectedOption === option ? 'poll-option--selected' : ''} ${hasSubmitted ? 'poll-option--disabled' : ''}`}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="poll-option__indicator">
                  <div className="poll-option__circle">
                    {selectedOption === option && (
                      <div className="poll-option__selected-dot"></div>
                    )}
                  </div>
                </div>
                <div className="poll-option__text">{option}</div>
              </div>
            ))}
          </div>

          <div className="poll-actions">
            {hasSubmitted ? (
              <div className="submission-success">
                <span className="success-icon">✅</span>
                <span>Response submitted successfully!</span>
              </div>
            ) : (
              <div>
                {error && (
                  <div className="error-message" style={{ marginBottom: '1rem', color: '#e74c3c', textAlign: 'center' }}>
                    {error}
                  </div>
                )}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!selectedOption || timeRemaining === 0 || loading.submitResponse}
                    className="submit-btn"
                  >
                    {loading.submitResponse ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default PollInterface