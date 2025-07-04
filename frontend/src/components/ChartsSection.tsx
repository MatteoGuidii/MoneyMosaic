import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { SpendingData, CategoryData } from '../services/apiService'

interface ChartsSectionProps {
  spendingData: SpendingData[]
  categoryData: CategoryData[]
  onCategorySelect: (category: string) => void
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ spendingData, categoryData, onCategorySelect }) => {
  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981']

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

  // Sample cash vs investments data
  const cashVsInvestmentsData = spendingData.map((item, index) => ({
    date: item.date,
    cash: 45000 + (index * 100) + (Math.random() * 1000),
    investments: 125000 + (index * 200) + (Math.random() * 2000)
  }))

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

      {/* Category Spending Donut Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Spending by Category
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="amount"
                onClick={(data) => onCategorySelect(data.category)}
                className="cursor-pointer"
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {categoryData.map((item, index) => (
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

      {/* Cash vs Investments Area Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cash vs Investments Over Time
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashVsInvestmentsData}>
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
              <Area 
                type="monotone" 
                dataKey="cash" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.3}
                name="Cash"
              />
              <Area 
                type="monotone" 
                dataKey="investments" 
                stackId="1"
                stroke="#8b5cf6" 
                fill="#8b5cf6"
                fillOpacity={0.3}
                name="Investments"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default ChartsSection
