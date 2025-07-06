import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { apiService, Investment } from '../../services/apiService'
import LoadingSpinner from '../ui/LoadingSpinner'

const InvestmentSummaryWidget: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvestments()
  }, [])

  const loadInvestments = async () => {
    try {
      const investmentData = await apiService.fetchInvestments()
      setInvestments(investmentData)
    } catch (error) {
      console.error('Error loading investments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="small" />
        </div>
      </div>
    )
  }

  if (investments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Investment Portfolio
          </h3>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400">
          No investments connected
        </div>
      </div>
    )
  }

  const totalValue = investments.reduce((sum, inv) => sum + inv.marketValue, 0)
  const totalDayChange = investments.reduce((sum, inv) => sum + inv.dayChange, 0)
  const gainers = investments.filter(inv => inv.dayChange > 0).length
  const losers = investments.filter(inv => inv.dayChange < 0).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Investment Portfolio
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Today's Change</p>
          <div className="flex items-center justify-center space-x-1">
            {totalDayChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
            <p className={`text-xl font-bold ${
              totalDayChange >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {totalDayChange >= 0 ? '+' : ''}{formatCurrency(totalDayChange)}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>{gainers} gainers, {losers} losers</span>
        <span>{investments.length} holdings</span>
      </div>

      {/* Top 3 Holdings */}
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Holdings</h4>
        {investments.slice(0, 3).map((investment) => (
          <div key={investment.symbol} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{investment.symbol}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(investment.marketValue)}
              </span>
              <span className={`text-xs ${
                investment.dayChange >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {investment.dayChange >= 0 ? '+' : ''}{investment.dayChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InvestmentSummaryWidget
