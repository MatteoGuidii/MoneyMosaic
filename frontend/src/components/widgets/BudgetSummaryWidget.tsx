import React, { useState, useEffect } from 'react'
import { Target, ArrowRight } from 'lucide-react'
import { apiService, BudgetData } from '../../services/apiService'
import LoadingSpinner from '../ui/LoadingSpinner'

const BudgetSummaryWidget: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = async () => {
    try {
      const budgetData = await apiService.fetchBudgetData()
      setBudgets(budgetData)
    } catch (error) {
      console.error('Error loading budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="small" />
        </div>
      </div>
    )
  }

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const remainingBudget = totalBudgeted - totalSpent
  const spentPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Budget Overview
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly spending</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
          <span>Manage</span>
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Budgeted</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalBudgeted)}
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Spent</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
          <p className={`text-xl font-bold ${
            remainingBudget >= 0 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(remainingBudget)}
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {spentPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              spentPercentage > 100 ? 'bg-red-500' : spentPercentage > 80 ? 'bg-yellow-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Top 3 Budget Categories */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Categories</h4>
        {budgets.length === 0 ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No budgets set</p>
          </div>
        ) : (
          budgets.slice(0, 3).map((budget) => (
            <div key={budget.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{budget.category}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(budget.spent)}/{formatCurrency(budget.budgeted)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      budget.percentage > 100 ? 'bg-red-500' : budget.percentage > 80 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default BudgetSummaryWidget
