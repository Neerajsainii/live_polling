import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../store/authSlice'
import { setCurrentView } from '../../store/uiSlice'
import { joinAsParticipantAsync, fetchCurrentPollAsync } from '../../store/pollSlice'
import { Button, Input } from '../ui'
import { v4 as uuidv4 } from 'uuid'
import './StudentSetup.css'

const StudentSetup = () => {
  const dispatch = useDispatch()
  const { currentPoll, loading, error } = useSelector(state => state.poll)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState('')

  const handleContinue = async () => {
    if (!name.trim()) {
      setFormError('Please enter your name')
      return
    }

    setFormError('')

    try {
      // First login the student
      dispatch(login({ role: 'student', name: name.trim() }))
      
      // Join as participant
      await dispatch(joinAsParticipantAsync())
      
      // Check for current poll
      await dispatch(fetchCurrentPollAsync())
      
      // Navigate to appropriate view
      if (currentPoll && currentPoll.isActive) {
        dispatch(setCurrentView('poll-active'))
      } else {
        dispatch(setCurrentView('waiting'))
      }
    } catch (error) {
      setFormError('Failed to join session. Please try again.')
      console.error('Failed to join as participant:', error)
    }
  }

  return (
    <div className="student-setup">
      <div className="student-setup__container">
        <div className="student-setup__header">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">Intervue Poll</span>
          </div>
          <h1 className="student-setup__title">Let's Get Started</h1>
          <p className="student-setup__subtitle">
            If you're a student, you'll be able to submit your answers, participate in live 
            polls, and see how your responses compare with your classmates
          </p>
        </div>

        <div className="student-setup__content">
          <div className="name-form">
            <Input
              label="Enter your Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setFormError('')
              }}
              placeholder="Enter your name..."
              error={formError}
              className="name-input"
            />
            
            {(error || formError) && (
              <div className="error-message" style={{ marginBottom: '1rem', color: '#e74c3c', textAlign: 'center' }}>
                {error || formError}
              </div>
            )}
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleContinue}
              className="continue-btn"
              disabled={loading.joinParticipant}
            >
              {loading.joinParticipant ? 'Joining...' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentSetup