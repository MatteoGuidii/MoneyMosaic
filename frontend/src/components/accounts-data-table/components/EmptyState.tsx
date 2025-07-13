import React from 'react'
import { Building2 } from 'lucide-react'
import { EmptyStateProps } from '../types'

/**
 * Empty state component for when no accounts are found
 */
const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
      <div className="text-center">
        <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  )
}

export default EmptyState
