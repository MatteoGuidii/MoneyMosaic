import React from 'react'
import { CategoryAnalysisModalProps } from '../types'
import { formatCurrency } from '../utils'

const CategoryAnalysisModal: React.FC<CategoryAnalysisModalProps> = ({ 
  isOpen, 
  category, 
  analysis, 
  onClose 
}) => {
  if (!isOpen || !category || !analysis) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {analysis.category} Analysis
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analysis.totalSpent)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg per Transaction</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analysis.avgPerTransaction)}
              </p>
            </div>
          </div>

          {/* Top Merchants */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Top Merchants</h3>
            <div className="space-y-2">
              {analysis.topMerchants.map((merchant, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-900 dark:text-white">{merchant.name}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(merchant.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h3>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryAnalysisModal
