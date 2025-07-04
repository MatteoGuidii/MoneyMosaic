import React, { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertTriangle, Info } from 'lucide-react'
import { apiService, CashFlowForecast } from '../services/apiService'
import LoadingSpinner from './LoadingSpinner'

interface CashFlowForecastProps {
  className?: string
}

const CashFlowForecastComponent: React.FC<CashFlowForecastProps> = ({ className = '' }) => {
  const [forecast, setForecast] = useState<CashFlowForecast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadForecast()
  }, [])

  const loadForecast = async () => {
    try {
      setLoading(true)
      const forecastData = await apiService.fetchCashFlowForecast()
      setForecast(forecastData)
    } catch (error) {
      console.error('Error loading cash flow forecast:', error)
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
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success-600 dark:text-success-400'
    if (confidence >= 0.6) return 'text-warning-600 dark:text-warning-400'
    return 'text-danger-600 dark:text-danger-400'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  const averageConfidence = forecast.length > 0 
    ? forecast.reduce((sum, item) => sum + item.confidence, 0) / forecast.length 
    : 0

  const finalBalance = forecast.length > 0 ? forecast[forecast.length - 1].projectedBalance : 0
  const currentBalance = forecast.length > 0 ? forecast[0].projectedBalance : 0
  const balanceChange = finalBalance - currentBalance

  const totalProjectedIncome = forecast.reduce((sum, item) => sum + item.projectedIncome, 0)
  const totalProjectedExpenses = forecast.reduce((sum, item) => sum + item.projectedExpenses, 0)

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-navy-600 dark:text-teal-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            30-Day Cash Flow Forecast
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-gray-500" />
          <span className={`text-sm font-medium ${getConfidenceColor(averageConfidence)}`}>
            {getConfidenceLabel(averageConfidence)} Confidence
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
              <p className="text-xl font-bold text-navy-900 dark:text-white">
                {formatCurrency(currentBalance)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Projected Balance</p>
              <p className={`text-xl font-bold ${
                finalBalance >= currentBalance 
                  ? 'text-success-600 dark:text-success-400' 
                  : 'text-danger-600 dark:text-danger-400'
              }`}>
                {formatCurrency(finalBalance)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Expected Income</p>
              <p className="text-xl font-bold text-success-600 dark:text-success-400">
                {formatCurrency(totalProjectedIncome)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Expected Expenses</p>
              <p className="text-xl font-bold text-danger-600 dark:text-danger-400">
                {formatCurrency(totalProjectedExpenses)}
              </p>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast}>
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
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  labelFormatter={(label) => `Date: ${formatDate(label)}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="projectedBalance"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="url(#colorBalance)"
                  name="Projected Balance"
                />
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Insights */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Forecast Insight
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Based on your spending patterns, your balance is projected to{' '}
                  {balanceChange >= 0 ? 'increase' : 'decrease'} by{' '}
                  <span className="font-semibold">{formatCurrency(Math.abs(balanceChange))}</span>{' '}
                  over the next 30 days.
                </p>
              </div>
            </div>

            {finalBalance < 1000 && (
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                    Low Balance Warning
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    Your projected balance may fall below $1,000. Consider reducing expenses or increasing income.
                  </p>
                </div>
              </div>
            )}

            {balanceChange < -500 && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100">
                    Negative Cash Flow Alert
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-200">
                    Your expenses are projected to exceed income significantly. Review your budget and consider cost-cutting measures.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CashFlowForecastComponent
