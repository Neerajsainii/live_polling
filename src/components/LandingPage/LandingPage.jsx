import React from 'react'
import { useDispatch } from 'react-redux'
import { setUserRole } from '../../store/authSlice'
import { setCurrentView } from '../../store/uiSlice'
import { Button, Card } from '../ui'
import './LandingPage.css'

const LandingPage = () => {
  const dispatch = useDispatch()

  const handleRoleSelection = (role) => {
    dispatch(setUserRole(role))
    if (role === 'teacher') {
      dispatch(setCurrentView('teacher-profile'))
    } else {
      dispatch(setCurrentView('student-setup'))
    }
  }

  return (
    <div className="landing-page">
      <div className="landing-page__container">
        <div className="landing-page__header">
          <div className="landing-page__logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">Intervue Poll</span>
          </div>
          <h1 className="landing-page__title">
            Welcome to the <span className="highlight">Live Polling System</span>
          </h1>
          <p className="landing-page__subtitle">
            Please select the role that best describes you to begin using the live polling system
          </p>
        </div>

        <div className="landing-page__cards">
          <Card 
            className="role-card" 
            hoverable 
            onClick={() => handleRoleSelection('student')}
          >
            <div className="role-card__content">
              <h2 className="role-card__title">I'm a Student</h2>
              <p className="role-card__description">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry
              </p>
            </div>
          </Card>

          <Card 
            className="role-card" 
            hoverable 
            onClick={() => handleRoleSelection('teacher')}
          >
            <div className="role-card__content">
              <h2 className="role-card__title">I'm a Teacher</h2>
              <p className="role-card__description">
                Submit answers and view live poll results in real-time.
              </p>
            </div>
          </Card>
        </div>

        <div className="landing-page__action">
          <Button 
            variant="primary" 
            size="lg"
            className="continue-btn"
            onClick={() => {
              // This will be handled by card clicks for now
              // Could be used for validation or other purposes
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage