import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createPollAsync, startPollAsync } from '../../store/pollSlice'
import { setCurrentView } from '../../store/uiSlice'
import { Button, Card, Input } from '../ui'
import { v4 as uuidv4 } from 'uuid'
import './TeacherSetup.css'

const TeacherSetup = () => {
  const dispatch = useDispatch()
  const { currentPoll, loading, error } = useSelector(state => state.poll)
  const { userName, userId, isAuthenticated, userRole } = useSelector(state => state.auth)
  
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [duration, setDuration] = useState(60)
  const [correctAnswer, setCorrectAnswer] = useState(0) // Index of correct answer
  const [errors, setErrors] = useState({})

  // Redirect if not authenticated as teacher
  React.useEffect(() => {
    if (!isAuthenticated || userRole !== 'teacher') {
      dispatch(setCurrentView('teacher-profile'))
    }
  }, [isAuthenticated, userRole, dispatch])

  // Show loading or redirect message if not authenticated
  if (!isAuthenticated || userRole !== 'teacher') {
    return (
      <div className="teacher-setup">
        <div className="teacher-setup__container">
          <div className="teacher-setup__header">
            <div className="logo">
              <span className="logo-icon">📊</span>
              <span className="logo-text">Intervue Poll</span>
            </div>
            <h1>Setting up teacher profile...</h1>
          </div>
        </div>
      </div>
    )
  }

  const addOption = () => {
    setOptions([...options, ''])
  }

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
      // Adjust correct answer index if needed
      if (correctAnswer === index) {
        setCorrectAnswer(0) // Reset to first option
      } else if (correctAnswer > index) {
        setCorrectAnswer(correctAnswer - 1) // Shift index down
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!question.trim()) {
      newErrors.question = 'Question is required'
    }
    
    const validOptions = options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 options are required'
    }
    
    if (duration < 10 || duration > 300) {
      newErrors.duration = 'Duration must be between 10 and 300 seconds'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreatePoll = async () => {
    if (!validateForm()) return

    const pollData = {
      question: question.trim(),
      options: options.filter(opt => opt.trim()),
      duration,
      correctAnswer: correctAnswer // Include correct answer index
    }

    try {
      const resultAction = await dispatch(createPollAsync(pollData))
      if (createPollAsync.fulfilled.match(resultAction)) {
        // Poll created successfully, now start it
        await dispatch(startPollAsync())
        dispatch(setCurrentView('poll-results'))
      }
    } catch (error) {
      console.error('Failed to create poll:', error)
    }
  }

  const handleStartPoll = async () => {
    if (currentPoll.id) {
      try {
        await dispatch(startPollAsync())
        dispatch(setCurrentView('poll-results'))
      } catch (error) {
        console.error('Failed to start poll:', error)
      }
    }
  }

  return (
    <div className="teacher-setup">
      <div className="teacher-setup__container">
        <div className="teacher-setup__header">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">Intervue Poll</span>
          </div>
          <h1 className="teacher-setup__title">Welcome, {userName || 'Teacher'}!</h1>
          <p className="teacher-setup__subtitle">
            Create and manage polls, ask questions, and monitor 
            your students' responses in real-time.
          </p>
        </div>

        <div className="teacher-setup__content">
          <Card className="poll-form-card">
            <div className="poll-form">
              <div className="form-section">
                <div className="form-header">
                  <h2>Enter your question</h2>
                  <div className="duration-selector">
                    <select 
                      value={duration} 
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="duration-select"
                    >
                      <option value={30}>30 seconds</option>
                      <option value={60}>60 seconds</option>
                      <option value={90}>90 seconds</option>
                      <option value={120}>120 seconds</option>
                      <option value={180}>180 seconds</option>
                    </select>
                  </div>
                </div>
                
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question here..."
                  className="question-input"
                  error={errors.question}
                />
              </div>

              <div className="form-section">
                <div className="options-header">
                  <h3>Edit Options</h3>
                  <span className="correct-answer-label">Is it Correct?</span>
                </div>
                
                <div className="options-list">
                  {options.map((option, index) => (
                    <div key={index} className="option-item">
                      <div className="option-content">
                        <span className="option-number">{index + 1}</span>
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder="Enter option..."
                          className="option-input"
                        />
                      </div>
                      <div className="option-controls">
                        <div className="correct-toggle">
                          <label>
                            <input 
                              type="radio" 
                              name="correctAnswer" 
                              value={index}
                              checked={correctAnswer === index}
                              onChange={(e) => setCorrectAnswer(parseInt(e.target.value))}
                              className="radio-input"
                            />
                            <span className="radio-label">Yes</span>
                          </label>
                        </div>
                        {options.length > 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(index)}
                            className="remove-option-btn"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {errors.options && (
                  <span className="error-text">{errors.options}</span>
                )}
                
                <Button
                  variant="outline"
                  onClick={addOption}
                  className="add-option-btn"
                >
                  + Add More option
                </Button>
              </div>

              <div className="form-actions">
                {error && (
                  <div className="error-message" style={{ marginBottom: '1rem', color: '#e74c3c', textAlign: 'center' }}>
                    {error}
                  </div>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCreatePoll}
                  className="ask-question-btn"
                  disabled={loading.createPoll || loading.startPoll}
                >
                  {loading.createPoll || loading.startPoll ? 'Creating Poll...' : 'Ask Question'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TeacherSetup