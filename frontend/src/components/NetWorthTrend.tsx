import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp } from 'lucide-react'
import { apiService, NetWorthData } from '../services/apiService'
import LoadingSpinner from './LoadingSpinner'

interface NetWorthTrendProps {
  className?: string
}

const NetWorthTrend: React.FC<NetWorthTrendProps> = ({ className = '' }) => {
  const [data, setData] = useState<NetWorthData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRange, setSelectedRange] = useState('90')

  useEffect(() => {
    loadData()
  }, [selectedRange])

  const loadData = async () => {
    try {
      setLoading(true)
      const netWorthData = await apiService.fetchNetWorthData(selectedRange)
      setData(netWorthData)
    } catch (error) {
      console.error('Error loading net worth data:', error)
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

  const dateRangeOptions = [
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' },
    { value: '365', label: '1 Year' },
    { value: '1095', label: '3 Years' }
  ]

  const currentNetWorth = data.length > 0 ? data[data.length - 1].netWorth : 0
  const previousNetWorth = data.length > 1 ? data[0].netWorth : 0
  const netWorthChange = currentNetWorth - previousNetWorth
  const percentageChange = previousNetWorth > 0 ? (netWorthChange / previousNetWorth) * 100 : 0

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-navy-600 dark:text-teal-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Net Worth Trend
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                     focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <>
          {/* Current Net Worth Display */}
          <div className="mb-6 p-4 bg-gradient-to-r from-navy-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Net Worth</p>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">
                  {formatCurrency(currentNetWorth)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedRange === '30' ? '30-Day' : selectedRange === '90' ? '90-Day' : selectedRange === '365' ? '1-Year' : '3-Year'} Change
                </p>
                <p className={`text-lg font-semibold ${
                  netWorthChange >= 0 
                    ? 'text-success-600 dark:text-success-400' 
                    : 'text-danger-600 dark:text-danger-400'
                }`}>
                  {netWorthChange >= 0 ? '+' : ''}{formatCurrency(netWorthChange)}
                  <span className="text-sm ml-1">
                    ({percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
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
                  formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
                  labelFormatter={(label) => `Date: ${formatDate(label)}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="netWorth"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

export default NetWorthTrend
