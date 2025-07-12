import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react'
import { SpendingData, CategoryData } from '../../services/apiService'

interface ChartsSectionProps {
  spendingData: SpendingData[]
  categoryData: CategoryData[]
  onCategorySelect: (category: string) => void
  onCategoryPeriodChange?: (period: string) => void
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ 
  spendingData, 
  categoryData, 
  onCategorySelect,
  onCategoryPeriodChange 
}) => {
  const [categoryPeriod, setCategoryPeriod] = useState('30')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b']

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
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-8">
      {/* Spending vs Income Line Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Spending vs Income
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Financial flow analysis</p>
            </div>
          </div>
        </div>
        <div className="h-80">
          {spendingData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  className="text-sm"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  className="text-sm"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label: string) => formatDate(label)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="spending" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Spending"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#ef4444' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Income"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-12 h-12 mb-4 opacity-30" />
              <h4 className="text-lg font-medium mb-2">No Transaction Data</h4>
              <p className="text-sm text-center">
                Connect your bank accounts to see spending vs income trends
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category Spending Pie Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white rounded-full border-dashed"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Spending by Category
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Category breakdown</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategorySelectionChange(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 6 months</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80">
            {getFilteredCategoryData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getFilteredCategoryData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={2}
                    dataKey="amount"
                    onClick={(data) => onCategorySelect(data.category)}
                    className="cursor-pointer"
                  >
                    {getFilteredCategoryData().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)} 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <PieChartIcon className="w-12 h-12 mb-4 opacity-30" />
                <h4 className="text-lg font-medium mb-2">No Category Data</h4>
                <p className="text-sm text-center">
                  Connect your bank accounts to see spending breakdown by category
                </p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {selectedCategory !== 'all' && (
              <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  Showing: <strong>{selectedCategory}</strong> category
                </p>
              </div>
            )}
            {getFilteredCategoryData().length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {getFilteredCategoryData().slice(0, 8).map((item, index) => (
                  <div 
                    key={item.category}
                    className="group flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    onClick={() => onCategorySelect(item.category)}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.percentage}%
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <PieChartIcon className="w-8 h-8 mb-3 opacity-30" />
                <p className="text-sm text-center">
                  No category data available for the selected period
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartsSection
