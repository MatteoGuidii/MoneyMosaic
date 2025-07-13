import React from 'react'
import { Edit2, Trash2, Target } from 'lucide-react'
import { BudgetListProps } from '../types'
import { formatCurrency, isOverBudget, getBudgetStatusColor, getBudgetTextColor } from '../utils'

const BudgetList: React.FC<BudgetListProps> = ({ budgets, onEdit, onDelete }) => {
  if (budgets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Budgets
          </h3>
        </div>
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No budgets set up yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Click "Add Budget" to create your first budget
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Current Budgets
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {budgets.map((budget) => {
            const remaining = budget.budgeted - budget.spent
            const overBudget = isOverBudget(budget.percentage)
            
            return (
              <div key={budget.category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {budget.category}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(budget.spent)} of {formatCurrency(budget.budgeted)} spent
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getBudgetTextColor(budget.percentage)}`}>
                      {overBudget ? 'Over by ' : 'Remaining: '}
                      {formatCurrency(Math.abs(remaining))}
                    </span>
                    <button
                      onClick={() => onEdit(budget)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(budget.category)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getBudgetStatusColor(budget.percentage)}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0%</span>
                  <span className={overBudget ? 'text-red-600 dark:text-red-400' : ''}>
                    {budget.percentage.toFixed(1)}%
                  </span>
                  <span>100%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BudgetList
