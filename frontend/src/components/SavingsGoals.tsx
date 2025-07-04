import React, { useState, useEffect } from 'react'
import { Target, Plus, Calendar, TrendingUp, Edit3, Save } from 'lucide-react'
import { apiService, SavingsGoal } from '../services/apiService'
import LoadingSpinner from './LoadingSpinner'

interface SavingsGoalsProps {
  className?: string
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ className = '' }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    category: ''
  })

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      setLoading(true)
      const goalsData = await apiService.fetchSavingsGoals()
      setGoals(goalsData)
    } catch (error) {
      console.error('Error loading savings goals:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getDaysToTarget = (targetDate: string) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-success-500'
    if (progress >= 75) return 'bg-teal-500'
    if (progress >= 50) return 'bg-warning-500'
    return 'bg-navy-500'
  }

  const getProgressBgColor = (progress: number) => {
    if (progress >= 100) return 'bg-success-100 dark:bg-success-900'
    if (progress >= 75) return 'bg-teal-100 dark:bg-teal-900'
    if (progress >= 50) return 'bg-warning-100 dark:bg-warning-900'
    return 'bg-navy-100 dark:bg-navy-900'
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Vacation': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'Emergency': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Home': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Car': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Education': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Retirement': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    return colors[category as keyof typeof colors] || colors.Other
  }

  const handleAddGoal = async () => {
    try {
      if (newGoal.name && newGoal.targetAmount > 0 && newGoal.targetDate && newGoal.category) {
        const goal = await apiService.createSavingsGoal(newGoal)
        setGoals([...goals, goal])
        setNewGoal({ name: '', targetAmount: 0, currentAmount: 0, targetDate: '', category: '' })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding savings goal:', error)
    }
  }

  const categories = ['Vacation', 'Emergency', 'Home', 'Car', 'Education', 'Retirement', 'Other']

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-navy-600 dark:text-teal-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Savings Goals
          </h3>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-navy-600 hover:bg-navy-700 
                   text-white rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <>
          {/* Add Goal Form */}
          {showAddForm && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Vacation to Europe"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={newGoal.targetAmount || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Amount
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={newGoal.currentAmount || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  className="px-4 py-2 text-sm bg-navy-600 hover:bg-navy-700 text-white rounded-md 
                           transition-colors flex items-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>Add Goal</span>
                </button>
              </div>
            </div>
          )}

          {/* Goals List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const daysToTarget = getDaysToTarget(goal.targetDate)
              const isOverdue = daysToTarget < 0
              const monthlyRequired = daysToTarget > 0 
                ? (goal.targetAmount - goal.currentAmount) / (daysToTarget / 30)
                : 0

              return (
                <div key={goal.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {goal.name}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingGoal(goal.id === editingGoal ? null : goal.id)}
                      className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className={`w-full ${getProgressBgColor(goal.progress)} rounded-full h-2`}>
                      <div
                        className={`${getProgressColor(goal.progress)} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{goal.progress.toFixed(1)}% complete</span>
                      <span>{formatCurrency(goal.targetAmount - goal.currentAmount)} remaining</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>Target Date</span>
                      </div>
                      <p className={`font-medium ${isOverdue ? 'text-danger-600 dark:text-danger-400' : 'text-gray-900 dark:text-white'}`}>
                        {formatDate(goal.targetDate)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isOverdue ? `${Math.abs(daysToTarget)} days overdue` : `${daysToTarget} days left`}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>Monthly Need</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {monthlyRequired > 0 ? formatCurrency(monthlyRequired) : 'Goal reached!'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {monthlyRequired > 0 ? 'to reach target' : 'Congratulations!'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {goals.length === 0 && !showAddForm && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No savings goals yet. Start by adding your first goal!
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-md 
                         transition-colors flex items-center space-x-1 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Goal</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SavingsGoals
