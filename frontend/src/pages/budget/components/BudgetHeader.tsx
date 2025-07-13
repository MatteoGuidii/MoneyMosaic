import React from 'react'
import { Plus } from 'lucide-react'

interface BudgetHeaderProps {
  onAddBudget: () => void
}

const BudgetHeader: React.FC<BudgetHeaderProps> = ({ onAddBudget }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Set and track your monthly spending limits
        </p>
      </div>
      <button
        onClick={onAddBudget}
        className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Budget
      </button>
    </div>
  )
}

export default BudgetHeader
