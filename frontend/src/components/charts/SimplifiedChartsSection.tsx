import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { SpendingData, CategoryData } from '../../services/apiService'

interface SimplifiedChartsSectionProps {
  spendingData: SpendingData[]
  categoryData: CategoryData[]
  onCategorySelect: (category: string) => void
  onCategoryPeriodChange?: (period: string) => void
}

const SimplifiedChartsSection: React.FC<SimplifiedChartsSectionProps> = ({ 
  spendingData, 
  categoryData, 
  onCategorySelect,
  onCategoryPeriodChange 
}) => {
  const [categoryPeriod, setCategoryPeriod] = useState('30')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

  const handleCategoryPeriodChange = (period: string) => {
    setCategoryPeriod(period)
    if (onCategoryPeriodChange) {
      onCategoryPeriodChange(period)
    }
  }

  const handleCategorySelectionChange = (category: string) => {
    setSelectedCategory(category)
  }

  // Get unique categories for the category selection dropdown
  const getCategoryOptions = () => {
    const uniqueCategories = [...new Set(categoryData.map(item => item.category))]
    return [
      { value: 'all', label: 'All Categories' },
      ...uniqueCategories.map(category => ({
        value: category,
        label: category
      }))
    ]
  }

  // Filter category data based on selected category
  const getFilteredCategoryData = () => {
    if (selectedCategory === 'all') {
      return categoryData
    }
    return categoryData.filter(item => item.category === selectedCategory)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Spending vs Income Line Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Spending vs Income
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-sm"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                className="text-sm"
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label: string) => formatDate(label)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="spending" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Spending"
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Income"
                dot={{ fill: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Spending Pie Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Spending by Category
          </h3>
          <div className="flex space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategorySelectionChange(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {getCategoryOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={categoryPeriod}
              onChange={(e) => handleCategoryPeriodChange(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getFilteredCategoryData()}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="amount"
                onClick={(data) => onCategorySelect(data.category)}
                className="cursor-pointer"
              >
                {getFilteredCategoryData().map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          {selectedCategory !== 'all' && (
            <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Showing: <strong>{selectedCategory}</strong> category
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {getFilteredCategoryData().slice(0, 6).map((item, index) => (
              <div 
                key={item.category}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                onClick={() => onCategorySelect(item.category)}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {item.category}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white ml-auto">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimplifiedChartsSection
