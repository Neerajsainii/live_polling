import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearKickOut, logout } from '../../store/authSlice'
import { setCurrentView } from '../../store/uiSlice'
import { Button } from '../ui'
import './KickedOut.css'

const KickedOut = () => {
  const dispatch = useDispatch()
  const { kickReason } = useSelector(state => state.auth)

  const handleReturnHome = () => {
    dispatch(clearKickOut())
    dispatch(logout())
    dispatch(setCurrentView('landing'))
  }

  return (
    <div className="kicked-out">
      <div className="kicked-out__container">
        <div className="kicked-out__content">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">Intervue Poll</span>
          </div>

          <div className="kicked-out__message">
            <h1 className="kicked-out__title">You've been Kicked out !</h1>
            <p className="kicked-out__subtitle">
              {kickReason || 'Looks like the teacher had removed you from the poll system. Please Try again sometime.'}
            </p>
          </div>

          <div className="kicked-out__actions">
            <Button
              variant="primary"
              size="lg"
              onClick={handleReturnHome}
              className="return-home-btn"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KickedOut