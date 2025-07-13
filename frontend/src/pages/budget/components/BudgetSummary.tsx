import React from 'react'
import { Target } from 'lucide-react'
import { BudgetSummaryProps } from '../types'
import { formatCurrency } from '../utils'

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ summary }) => {
  const { totalBudgeted, totalSpent, totalRemaining } = summary

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Budgeted</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalBudgeted)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${totalRemaining >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
            <Target className={`w-6 h-6 ${totalRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
            <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(totalRemaining)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BudgetSummary
