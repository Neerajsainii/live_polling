import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentView } from '../../store/uiSlice'
import { Button, Card } from '../ui'
import './PollHistory.css'

const PollHistory = () => {
  const dispatch = useDispatch()
  const { pollHistory } = useSelector(state => state.poll)
  const { userRole, userId } = useSelector(state => state.auth)

  // Fetch poll history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      if (userRole === 'teacher' && userId) {
        try {
          const response = await fetch(`http://localhost:3001/api/poll/history?teacherId=${userId}`)
          if (response.ok) {
            const data = await response.json()
            // Update the store with fetched history
            dispatch({ type: 'poll/setPollHistory', payload: data.history })
          } else {
            console.error('Failed to fetch poll history')
          }
        } catch (error) {
          console.error('Error fetching poll history:', error)
        }
      }
    }

    fetchHistory()
  }, [dispatch, userRole, userId])

  // Mock poll history data as fallback
  const mockHistory = [
    {
      id: 'poll-1',
      question: 'Which planet is known as the Red Planet?',
      options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
      results: { 
        Mars: { count: 15, percentage: 75, isCorrect: true }, 
        Venus: { count: 1, percentage: 5, isCorrect: false }, 
        Jupiter: { count: 1, percentage: 5, isCorrect: false }, 
        Saturn: { count: 3, percentage: 15, isCorrect: false } 
      },
      summary: {
        totalResponses: 20,
        correctResponses: 15,
        incorrectResponses: 5,
        correctPercentage: 75,
        incorrectPercentage: 25
      },
      correctAnswer: 0,
      totalVotes: 20,
      createdAt: new Date().toISOString()
    }
  ]

  const history = pollHistory && pollHistory.length > 0 ? pollHistory : mockHistory

  const handleBackToResults = () => {
    dispatch(setCurrentView('poll-results'))
  }

  const calculatePercentage = (votes, total) => {
    if (!total || total === 0) return 0
    const count = typeof votes === 'object' ? (votes.count || 0) : (votes || 0)
    if (isNaN(count) || isNaN(total)) return 0
    return Math.round((count / total) * 100)
  }

  return (
    <div className="poll-history">
      <div className="poll-history__container">
        <div className="poll-history__header">
          <div className="header-content">
            <h1 className="poll-history__title">
              View <span className="highlight">Poll History</span>
            </h1>
            <Button
              variant="outline"
              onClick={handleBackToResults}
              className="back-button"
            >
              ← Back to Live Results
            </Button>
          </div>
        </div>

        <div className="poll-history__content">
          {history.map((poll, index) => (
            <Card key={poll.id} className="poll-history-card">
              <div className="poll-header">
                <h2 className="poll-title">Question {index + 1}</h2>
                <div className="poll-date">
                  {new Date(poll.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="poll-question">
                <div className="question-text">{poll.question}</div>
              </div>

              <div className="poll-results">
                {poll.options.map((option, optionIndex) => {
                  const result = poll.results[option] || {}
                  const votes = result.count || poll.results[option] || 0
                  const percentage = result.percentage || calculatePercentage(votes, poll.totalVotes || poll.summary?.totalResponses)
                  const isCorrect = result.isCorrect || (poll.correctAnswer === optionIndex)
                  
                  return (
                    <div key={option} className={`result-bar ${isCorrect ? 'correct-answer' : ''}`}>
                      <div className="result-info">
                        <div className="result-option">
                          <span className="option-number">{optionIndex + 1}</span>
                          <span className="option-text">{option}</span>
                          {isCorrect && <span className="correct-indicator">✅ Correct</span>}
                        </div>
                        <div className="result-percentage">{percentage}%</div>
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

              {poll.summary && (
                <div className="poll-summary">
                  <div className="summary-stats">
                    <div className="stat-item">
                      <span className="stat-label">✅ Correct:</span>
                      <span className="stat-value">{poll.summary.correctPercentage || 0}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">❌ Incorrect:</span>
                      <span className="stat-value">{poll.summary.incorrectPercentage || 0}%</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="poll-stats">
                <span className="total-votes">
                  Total votes: {poll.totalVotes || poll.summary?.totalResponses || 0}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {history.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No polls yet</h3>
            <p>Create your first poll to see it here in the history.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PollHistory