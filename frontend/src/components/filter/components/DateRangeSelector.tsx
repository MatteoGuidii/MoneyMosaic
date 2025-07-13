import React from 'react'
import { Calendar } from 'lucide-react'
import { DateRangeSelectorProps } from '../types'

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateRanges,
  selectedDateRange,
  onDateRangeClick
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Time Period
      </label>
      <div className="flex flex-wrap gap-2">
        {dateRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => onDateRangeClick(range.value)}
            className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedDateRange === range.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {range.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DateRangeSelector
