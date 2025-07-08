import React, { useState, useEffect } from 'react'
import { Target, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { apiService, BudgetData } from '../services/apiService'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ToastContainer from '../components/ui/ToastContainer'
import { useToast } from '../hooks/useToast'

interface BudgetFormData {
  category: string
  amount: number
}

const Budget: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetData[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [formData, setFormData] = useState<BudgetFormData>({ category: '', amount: 0 })
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  
  // Toast functionality
  const { toasts, dismissToast, success, error: showError } = useToast()

  useEffect(() => {
    loadBudgets()
    loadCategories()
  }, [])

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const budgetData = await apiService.fetchBudgetData()
      setBudgets(budgetData)
    } catch (error) {
      console.error('Error loading budgets:', error)
      showError('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const categories = await apiService.fetchCategories()
      setAvailableCategories(categories)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSaveBudget = async () => {
    try {
      if (!formData.category || formData.amount <= 0) {
        showError('Please enter a valid category and amount')
        return
      }

      await apiService.createOrUpdateBudget(formData.category, formData.amount)
      
      success(editingCategory ? 'Budget updated successfully' : 'Budget created successfully')
      setShowAddForm(false)
      setEditingCategory(null)
      setFormData({ category: '', amount: 0 })
      loadBudgets()
    } catch (error) {
      console.error('Error saving budget:', error)
      showError('Failed to save budget')
    }
  }

  const handleEditBudget = (budget: BudgetData) => {
    setFormData({ category: budget.category, amount: budget.budgeted })
    setEditingCategory(budget.category)
    setShowAddForm(true)
  }

  const handleDeleteBudget = async (category: string) => {
    try {
      await apiService.deleteBudget(category)
      success('Budget deleted successfully')
      loadBudgets()
    } catch (error) {
      console.error('Error deleting budget:', error)
      showError('Failed to delete budget')
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
  const totalRemaining = totalBudgeted - totalSpent

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set and track your monthly spending limits
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingCategory(null)
            setFormData({ category: '', amount: 0 })
          }}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Budget
        </button>
      </div>

      {/* Summary Cards */}
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

      {/* Add/Edit Budget Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingCategory ? 'Edit Budget' : 'Add New Budget'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              {editingCategory ? (
                <input
                  type="text"
                  value={formData.category}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {availableCategories
                    .filter(cat => !budgets.find(b => b.category === cat))
                    .map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  }
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter budget amount"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingCategory(null)
                setFormData({ category: '', amount: 0 })
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSaveBudget}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save Budget
            </button>
          </div>
        </div>
      )}

      {/* Budget List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Budgets
          </h3>
        </div>

        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No budgets set up yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Click "Add Budget" to create your first budget</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {budgets.map((budget) => {
                const remaining = budget.budgeted - budget.spent
                const isOverBudget = budget.percentage > 100
                
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
                        <span className={`text-sm font-medium ${
                          isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                        }`}>
                          {isOverBudget ? 'Over by ' : 'Remaining: '}
                          {formatCurrency(Math.abs(remaining))}
                        </span>
                        <button
                          onClick={() => handleEditBudget(budget)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.category)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          isOverBudget ? 'bg-red-500' : 
                          budget.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0%</span>
                      <span className={isOverBudget ? 'text-red-600 dark:text-red-400' : ''}>
                        {budget.percentage.toFixed(1)}%
                      </span>
                      <span>100%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Budget
