import React, { useState, useEffect } from 'react'
import BudgetTracker from '../components/BudgetTracker'
import SavingsGoals from '../components/SavingsGoals'
import LoadingSpinner from '../components/LoadingSpinner'
import { apiService, BudgetData, SavingsGoal } from '../services/apiService'
import { Target, TrendingUp, DollarSign, Calendar } from 'lucide-react'

const BudgetsGoals: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [budgets, setBudgets] = useState<BudgetData[]>([])
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [activeTab, setActiveTab] = useState<'budgets' | 'goals'>('budgets')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [budgetData, goalsData] = await Promise.all([
        apiService.fetchBudgetData(),
        apiService.fetchSavingsGoals()
      ])
      setBudgets(budgetData)
      setGoals(goalsData)
    } catch (error) {
      console.error('Error loading data:', error)
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

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const budgetProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

  const totalGoalsTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalGoalsCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const goalsProgress = totalGoalsTarget > 0 ? (totalGoalsCurrent / totalGoalsTarget) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Active Budgets</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {budgets.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Budget Progress</span>
          </div>
          <p className={`text-2xl font-bold mt-1 ${
            budgetProgress <= 80 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {budgetProgress.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Savings Goals</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {goals.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Goals Progress</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {goalsProgress.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-navy-600 to-purple-600 dark:from-navy-700 dark:to-purple-700 rounded-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Monthly Budget Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-navy-100 dark:text-navy-200">Total Budgeted:</span>
                <span className="font-semibold">{formatCurrency(totalBudgeted)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-100 dark:text-navy-200">Total Spent:</span>
                <span className="font-semibold">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-100 dark:text-navy-200">Remaining:</span>
                <span className="font-semibold">{formatCurrency(totalBudgeted - totalSpent)}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Savings Goals Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-navy-100 dark:text-navy-200">Total Target:</span>
                <span className="font-semibold">{formatCurrency(totalGoalsTarget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-100 dark:text-navy-200">Total Saved:</span>
                <span className="font-semibold">{formatCurrency(totalGoalsCurrent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-100 dark:text-navy-200">Remaining:</span>
                <span className="font-semibold">{formatCurrency(totalGoalsTarget - totalGoalsCurrent)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('budgets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'budgets'
                  ? 'border-navy-500 text-navy-600 dark:text-navy-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Budget Tracker
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'goals'
                  ? 'border-navy-500 text-navy-600 dark:text-navy-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Savings Goals
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'budgets' ? (
            <BudgetTracker />
          ) : (
            <SavingsGoals />
          )}
        </div>
      </div>
    </div>
  )
}

export default BudgetsGoals
