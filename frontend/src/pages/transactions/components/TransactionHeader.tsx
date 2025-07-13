import React from 'react'
import { Download } from 'lucide-react'
import SyncButton from '../../../components/SyncButton'

interface TransactionHeaderProps {
  dateRange: string
  onDateRangeChange: (range: string) => void
  onCustomDatePicker: () => void
  onSync: () => void
  onExport: () => void
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  dateRange,
  onDateRangeChange,
  onCustomDatePicker,
  onSync,
  onExport
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transaction Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your spending patterns and analyze transaction trends
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* Date Range Toggle */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {[
            { value: '7', label: '7D' },
            { value: '30', label: '30D' },
            { value: '90', label: '90D' },
            { value: '180', label: '6M' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => onDateRangeChange(range.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                dateRange === range.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {range.label}
            </button>
          ))}
          <button
            onClick={onCustomDatePicker}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              dateRange === 'custom'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Custom
          </button>
        </div>
        
        <SyncButton 
          variant="button" 
          onSyncComplete={onSync}
        />
        <button 
          onClick={onExport}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  )
}

export default TransactionHeader
