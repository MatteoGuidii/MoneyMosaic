import React, { useState, useEffect } from 'react'
import InvestmentsPanel from '../components/InvestmentsPanel'
import LoadingSpinner from '../components/LoadingSpinner'
import { apiService, Investment } from '../services/apiService'
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3 } from 'lucide-react'

const Investments: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('1D')

  useEffect(() => {
    loadInvestments()
  }, [])

  const loadInvestments = async () => {
    try {
      setLoading(true)
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
      minimumFractionDigits: 2
    }).format(amount)
  }

  const totalValue = investments.reduce((sum, inv) => sum + inv.marketValue, 0)
  const totalDayChange = investments.reduce((sum, inv) => sum + inv.dayChange, 0)
  const totalDayChangePercent = totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0

  const gainers = investments.filter(inv => inv.dayChangePercent > 0).length
  const losers = investments.filter(inv => inv.dayChangePercent < 0).length

  const periodOptions = [
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '1Y', label: '1 Year' },
    { value: 'ALL', label: 'All Time' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="bg-gradient-to-r from-purple-600 to-navy-600 dark:from-purple-700 dark:to-navy-700 rounded-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Total Portfolio Value</h3>
            <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Today's Change</h3>
            <div className="flex items-center space-x-2">
              <p className={`text-2xl font-bold ${
                totalDayChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {totalDayChange >= 0 ? '+' : ''}{formatCurrency(totalDayChange)}
              </p>
              {totalDayChange >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-400" />
              )}
            </div>
            <p className={`text-sm ${
              totalDayChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {totalDayChangePercent >= 0 ? '+' : ''}{totalDayChangePercent.toFixed(2)}%
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Holdings</h3>
            <p className="text-2xl font-bold">{investments.length}</p>
            <p className="text-sm text-purple-100 dark:text-purple-200">
              {gainers} gainers, {losers} losers
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalValue)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Gainers</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {gainers}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Losers</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {losers}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Day Change %</span>
          </div>
          <p className={`text-2xl font-bold mt-1 ${
            totalDayChangePercent >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {totalDayChangePercent >= 0 ? '+' : ''}{totalDayChangePercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Performance Period Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Analysis
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                       focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Placeholder for performance chart */}
        <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              Performance chart for {selectedPeriod} period
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Chart visualization would be implemented here
            </p>
          </div>
        </div>
      </div>

      {/* Investment Holdings */}
      <InvestmentsPanel investments={investments} />

      {/* Top Performers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Performers Today
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Best Performers */}
          <div>
            <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">Best Performers</h4>
            <div className="space-y-2">
              {investments
                .filter(inv => inv.dayChangePercent > 0)
                .sort((a, b) => b.dayChangePercent - a.dayChangePercent)
                .slice(0, 5)
                .map(investment => (
                  <div key={investment.symbol} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900 rounded">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{investment.symbol}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{investment.companyName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        +{investment.dayChangePercent.toFixed(2)}%
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(investment.marketPrice)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Worst Performers */}
          <div>
            <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Worst Performers</h4>
            <div className="space-y-2">
              {investments
                .filter(inv => inv.dayChangePercent < 0)
                .sort((a, b) => a.dayChangePercent - b.dayChangePercent)
                .slice(0, 5)
                .map(investment => (
                  <div key={investment.symbol} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900 rounded">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{investment.symbol}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{investment.companyName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {investment.dayChangePercent.toFixed(2)}%
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(investment.marketPrice)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Investments
