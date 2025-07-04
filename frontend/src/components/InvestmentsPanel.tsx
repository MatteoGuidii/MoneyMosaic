import React from 'react'
import { TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Investment } from '../services/apiService'

interface InvestmentsPanelProps {
  investments: Investment[]
}

const InvestmentsPanel: React.FC<InvestmentsPanelProps> = ({ investments }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return (percent >= 0 ? '+' : '') + percent.toFixed(2) + '%'
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown
  }

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

  // Portfolio allocation data for pie chart
  const portfolioData = investments.map((investment, index) => ({
    name: investment.symbol,
    value: investment.marketValue,
    color: COLORS[index % COLORS.length]
  }))

  const totalPortfolioValue = investments.reduce((sum, investment) => sum + investment.marketValue, 0)

  return (
    <div className="space-y-6">
      {/* Holdings Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Investment Holdings
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investments.map((investment) => {
              const ChangeIcon = getChangeIcon(investment.dayChange)
              return (
                <div
                  key={investment.symbol}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {investment.symbol}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {investment.companyName}
                      </p>
                    </div>
                    <div className={`flex items-center ${getChangeColor(investment.dayChange)}`}>
                      <ChangeIcon className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">
                        {formatPercent(investment.dayChangePercent)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {investment.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Price:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(investment.marketPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Market Value:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(investment.marketValue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Day Change:</span>
                      <span className={`font-medium ${getChangeColor(investment.dayChange)}`}>
                        {formatCurrency(investment.dayChange)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Portfolio Allocation Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Portfolio Allocation
            </h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-col justify-center space-y-3">
              {portfolioData.map((item) => {
                const percentage = ((item.value / totalPortfolioValue) * 100).toFixed(1)
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.value)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvestmentsPanel
