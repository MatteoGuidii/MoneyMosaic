import React from 'react'
import { DollarSign } from 'lucide-react'
import { AmountRangeFilterProps } from '../types'

const AmountRangeFilter: React.FC<AmountRangeFilterProps> = ({
  amountRange,
  onAmountRangeChange
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <DollarSign className="w-4 h-4 inline mr-1" />
        Amount Range
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amountRange.min}
            onChange={(e) => onAmountRangeChange({ ...amountRange, min: parseFloat(e.target.value) || 0 })}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amountRange.max}
            onChange={(e) => onAmountRangeChange({ ...amountRange, max: parseFloat(e.target.value) || 10000 })}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="10000.00"
          />
        </div>
      </div>
    </div>
  )
}

export default AmountRangeFilter
