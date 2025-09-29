import React from 'react'
import { useSelector } from 'react-redux'
import LandingPage from './components/LandingPage'
import TeacherProfile from './components/TeacherProfile/TeacherProfile'
import TeacherSetup from './components/TeacherSetup'
import StudentSetup from './components/StudentSetup'
import PollInterface from './components/PollInterface'
import LiveResults from './components/LiveResults'
import StudentResults from './components/StudentResults'
import PollHistory from './components/PollHistory'
import KickedOut from './components/KickedOut'
import './App.css'

function App() {
  const { currentView } = useSelector(state => state.ui)
  const { userRole, isKickedOut } = useSelector(state => state.auth)

  // If user is kicked out, show kicked out screen
  if (isKickedOut) {
    return (
      <div className="app">
        <KickedOut />
        {process.env.NODE_ENV === 'development' && <DevNavigation />}
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />
      case 'teacher-profile':
        return <TeacherProfile />
      case 'teacher-setup':
        return <TeacherSetup />
      case 'student-setup':
        return <StudentSetup />
      case 'waiting':
        return (
          <div className="waiting-screen">
            <div className="waiting-content">
              <div className="logo">
                <span className="logo-icon">📊</span>
                <span className="logo-text">Intervue Poll</span>
              </div>
              <div className="spinner"></div>
              <h2>Wait for the teacher to ask questions..</h2>
            </div>
          </div>
        )
      case 'poll-active':
        return <PollInterface />
      case 'poll-results':
        // Show different results view based on user role
        return userRole === 'teacher' ? <LiveResults /> : <StudentResults />
      case 'poll-history':
        return <PollHistory />
      case 'kicked-out':
        return <KickedOut />
      default:
        return <LandingPage />
    }
  }

  return (
    <div className="app">
      {renderCurrentView()}

    </div>
  )
}

export default App
