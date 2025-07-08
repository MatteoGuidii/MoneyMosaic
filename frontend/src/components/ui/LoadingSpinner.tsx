import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-zinc-200/40 dark:border-zinc-700/40 border-t-emerald-600 dark:border-t-emerald-400 ${sizeClasses[size]} ${className}`}>
    </div>
  )
}

export default LoadingSpinner
