import React, { useState, useEffect } from 'react'
import { Target, Edit3, Save, X, Plus } from 'lucide-react'
import { apiService, BudgetData } from '../services/apiService'
import LoadingSpinner from './LoadingSpinner'

interface BudgetTrackerProps {
  className?: string
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ className = '' }) => {
  const [budgets, setBudgets] = useState<BudgetData[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ [key: string]: number }>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBudget, setNewBudget] = useState({ category: '', budgeted: 0 })

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const budgetData = await apiService.fetchBudgetData()
      setBudgets(budgetData)
    } catch (error) {
      console.error('Error loading budget data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value)
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage <= 50) return 'bg-success-500'
    if (percentage <= 80) return 'bg-warning-500'
    return 'bg-danger-500'
  }

  const getProgressBgColor = (percentage: number) => {
    if (percentage <= 50) return 'bg-success-100 dark:bg-success-900'
    if (percentage <= 80) return 'bg-warning-100 dark:bg-warning-900'
    return 'bg-danger-100 dark:bg-danger-900'
  }

  const handleEdit = (category: string, currentBudget: number) => {
    setEditing(category)
    setEditValues({ [category]: currentBudget })
  }

  const handleSave = async (category: string) => {
    try {
      const newBudgetValue = editValues[category]
      const updatedBudgets = budgets.map(budget => 
        budget.category === category 
          ? { ...budget, budgeted: newBudgetValue, remaining: newBudgetValue - budget.spent }
          : budget
      )
      
      await apiService.updateBudget(updatedBudgets)
      setBudgets(updatedBudgets)
      setEditing(null)
      setEditValues({})
    } catch (error) {
      console.error('Error saving budget:', error)
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setEditValues({})
  }

  const handleAddBudget = async () => {
    try {
      if (newBudget.category && newBudget.budgeted > 0) {
        const budgetData: BudgetData = {
          category: newBudget.category,
          budgeted: newBudget.budgeted,
          spent: 0,
          remaining: newBudget.budgeted,
          percentage: 0
        }
        
        const updatedBudgets = [...budgets, budgetData]
        await apiService.updateBudget(updatedBudgets)
        setBudgets(updatedBudgets)
        setNewBudget({ category: '', budgeted: 0 })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding budget:', error)
    }
  }

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-navy-600 dark:text-teal-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Monthly Budget Tracker
          </h3>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-navy-600 hover:bg-navy-700 
                   text-white rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Budget</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Budgeted</p>
              <p className="text-xl font-bold text-navy-900 dark:text-white">
                {formatCurrency(totalBudgeted)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-xl font-bold text-danger-600 dark:text-danger-400">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
              <p className={`text-xl font-bold ${
                totalRemaining >= 0 
                  ? 'text-success-600 dark:text-success-400' 
                  : 'text-danger-600 dark:text-danger-400'
              }`}>
                {formatCurrency(totalRemaining)}
              </p>
            </div>
          </div>

          {/* Add Budget Form */}
          {showAddForm && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                           focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Budget amount"
                  value={newBudget.budgeted || ''}
                  onChange={(e) => setNewBudget({ ...newBudget, budgeted: Number(e.target.value) })}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                           focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddBudget}
                  className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded-md 
                           transition-colors flex items-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>Add</span>
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md 
                           transition-colors flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Budget Categories */}
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget.category} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {budget.category}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {editing === budget.category ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editValues[budget.category] || budget.budgeted}
                          onChange={(e) => setEditValues({ 
                            ...editValues, 
                            [budget.category]: Number(e.target.value) 
                          })}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                   focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleSave(budget.category)}
                          className="p-1 text-success-600 hover:text-success-700"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1 text-gray-600 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(budget.category, budget.budgeted)}
                        className="p-1 text-gray-600 hover:text-gray-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Spent: {formatCurrency(budget.spent)}</span>
                  <span>Budget: {formatCurrency(budget.budgeted)}</span>
                </div>
                
                <div className={`w-full ${getProgressBgColor(budget.percentage)} rounded-full h-2`}>
                  <div
                    className={`${getProgressBarColor(budget.percentage)} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className={`${
                    budget.remaining >= 0 
                      ? 'text-success-600 dark:text-success-400' 
                      : 'text-danger-600 dark:text-danger-400'
                  }`}>
                    {budget.remaining >= 0 ? 'Remaining' : 'Over budget'}: {formatCurrency(Math.abs(budget.remaining))}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {budget.percentage.toFixed(1)}% used
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default BudgetTracker
