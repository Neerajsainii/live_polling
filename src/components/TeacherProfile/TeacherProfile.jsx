import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../store/authSlice'
import { setCurrentView } from '../../store/uiSlice'
import { Button, Input } from '../ui'
import './TeacherProfile.css'

const TeacherProfile = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector(state => state.auth)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState('')

  const handleContinue = async () => {
    if (!name.trim()) {
      setFormError('Please enter your name')
      return
    }

    setFormError('')

    try {
      // Login as teacher
      dispatch(login({ role: 'teacher', name: name.trim() }))
      
      // Navigate to poll creation
      dispatch(setCurrentView('teacher-setup'))
    } catch (error) {
      setFormError('Failed to set up profile. Please try again.')
      console.error('Failed to setup teacher profile:', error)
    }
  }

  return (
    <div className="teacher-profile">
      <div className="teacher-profile__container">
        <div className="teacher-profile__header">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">Live Polling</span>
          </div>
          <h1 className="teacher-profile__title">Teacher Setup</h1>
          <p className="teacher-profile__subtitle">
            As a teacher, you'll be able to create polls, view real-time results, 
            manage participants, and facilitate interactive classroom sessions
          </p>
        </div>

        <div className="teacher-profile__content">
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
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Continue to Create Polls'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherProfile