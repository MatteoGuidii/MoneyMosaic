import React from 'react'
import { Download, Calendar } from 'lucide-react'

interface TableHeaderProps {
  selectedCount: number
  onExport: () => void
}

/**
 * Table header with export functionality and selection info
 */
const TableHeader: React.FC<TableHeaderProps> = ({ selectedCount, onExport }) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Transactions
            </h3>
          </div>
          {selectedCount > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {selectedCount} selected
            </span>
          )}
        </div>
        <button
          onClick={onExport}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </div>
  )
}

export default TableHeader
