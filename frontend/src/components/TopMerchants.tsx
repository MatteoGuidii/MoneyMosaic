import React, { useState, useEffect } from 'react'
import { Store, Clock, TrendingUp, Calendar } from 'lucide-react'
import { apiService, MerchantData } from '../services/apiService'
import LoadingSpinner from './LoadingSpinner'

interface TopMerchantsProps {
  className?: string
}

const TopMerchants: React.FC<TopMerchantsProps> = ({ className = '' }) => {
  const [merchants, setMerchants] = useState<MerchantData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRange, setSelectedRange] = useState('30')

  useEffect(() => {
    loadMerchants()
  }, [selectedRange])

  const loadMerchants = async () => {
    try {
      setLoading(true)
      const merchantData = await apiService.fetchTopMerchants(selectedRange)
      setMerchants(merchantData)
    } catch (error) {
      console.error('Error loading merchant data:', error)
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

  const dateRangeOptions = [
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' },
    { value: '365', label: '1 Year' }
  ]

  const getCategoryColor = (category: string) => {
    const colors = {
      'Food and Drink': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Shops': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Transportation': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Entertainment': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Healthcare': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Travel': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'Bills': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const recurringMerchants = merchants.filter(merchant => merchant.isRecurring)
  const topMerchants = merchants.filter(merchant => !merchant.isRecurring).slice(0, 5)

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Store className="w-5 h-5 text-navy-600 dark:text-teal-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Merchants & Recurring Payments
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
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Merchants */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Top 5 Merchants by Spending
              </h4>
            </div>
            
            <div className="space-y-3">
              {topMerchants.map((merchant, index) => (
                <div key={merchant.name} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-navy-600 dark:bg-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {merchant.name}
                      </p>
                      <p className="text-lg font-semibold text-danger-600 dark:text-danger-400">
                        {formatCurrency(merchant.totalSpent)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(merchant.category)}`}>
                        {merchant.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {merchant.transactionCount} transactions
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recurring Payments */}
          {recurringMerchants.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Recurring Payments & Subscriptions
                </h4>
              </div>
              
              <div className="space-y-3">
                {recurringMerchants.map((merchant) => (
                  <div key={merchant.name} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-warning-50 to-orange-50 dark:from-warning-900 dark:to-orange-900 rounded-lg border border-warning-200 dark:border-warning-700">
                    <div className="flex-shrink-0">
                      <Clock className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {merchant.name}
                        </p>
                        <p className="text-lg font-semibold text-warning-700 dark:text-warning-400">
                          {formatCurrency(merchant.totalSpent)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(merchant.category)}`}>
                          {merchant.category}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {merchant.transactionCount} payments
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-navy-900 dark:text-white">
                  {merchants.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Merchants
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                  {formatCurrency(merchants.reduce((sum, merchant) => sum + merchant.totalSpent, 0))}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Spent
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                  {recurringMerchants.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recurring Payments
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TopMerchants
