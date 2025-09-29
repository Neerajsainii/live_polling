import React, { forwardRef } from 'react'
import './Input.css'

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  className = '',
  id,
  required = false,
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const hasError = !!error

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`input ${hasError ? 'input--error' : ''}`}
        aria-invalid={hasError}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="input__error">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={`${inputId}-helper`} className="input__helper">
          {helperText}
        </span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input