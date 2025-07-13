import React from 'react'
import { PeriodSelectorProps } from '../types'

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' }
  ]

  return (
    <div className="mt-4 flex space-x-2">
      {periods.map((period) => (
        <button
          key={period.key}
          onClick={() => onPeriodChange(period.key)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPeriod === period.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}

export default PeriodSelector
