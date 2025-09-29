import React from 'react'
import './Card.css'

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'md',
  hoverable = false,
  ...props 
}) => {
  const baseClass = 'card'
  const variantClass = `card--${variant}`
  const paddingClass = `card--padding-${padding}`
  const hoverableClass = hoverable ? 'card--hoverable' : ''

  const cardClasses = [
    baseClass,
    variantClass,
    paddingClass,
    hoverableClass,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  )
}

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card__header ${className}`} {...props}>
    {children}
  </div>
)

const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card__body ${className}`} {...props}>
    {children}
  </div>
)

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card__footer ${className}`} {...props}>
    {children}
  </div>
)

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card