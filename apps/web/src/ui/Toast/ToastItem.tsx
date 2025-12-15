// carrier-ops-hub/apps/web/src/ui/Toast/ToastItem.tsx

import { useEffect, useState } from 'react'
import { useToast, type Toast } from './ToastContext'

interface ToastItemProps {
  toast: Toast
}

export function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      removeToast(toast.id)
    }, 300) // Match animation duration
  }

  const getStyles = () => {
    const baseStyles = {
      padding: '1rem 1.25rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      transition: 'all 0.3s ease',
      transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
      opacity: isVisible ? 1 : 0,
      minWidth: '20rem',
    }

    switch (toast.type) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: '#10B981',
          color: 'white',
        }
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: '#EF4444',
          color: 'white',
        }
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: '#F59E0B',
          color: 'white',
        }
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: '#3B82F6',
          color: 'white',
        }
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
    }
  }

  return (
    <div style={getStyles()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{getIcon()}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast.message}</span>
      </div>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1.25rem',
          padding: '0.25rem',
          lineHeight: 1,
          opacity: 0.8,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.8'
        }}
      >
        ×
      </button>
    </div>
  )
}
