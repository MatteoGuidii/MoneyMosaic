import React from 'react'
import { ChartContainerProps } from '../types'

/**
 * Reusable chart container with consistent styling
 */
const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  icon,
  children,
  actions
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>
        {actions && (
          <div className="flex space-x-3">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export default ChartContainer
