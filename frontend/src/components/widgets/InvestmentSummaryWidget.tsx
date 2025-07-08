import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, ArrowRight, BarChart3 } from 'lucide-react'
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
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="small" />
        </div>
      </div>
    )
  }

  const totalValue = investments.reduce((sum, investment) => sum + investment.marketValue, 0)
  const totalDayChange = investments.reduce((sum, investment) => sum + investment.dayChange, 0)
  const gainers = investments.filter(inv => inv.dayChange > 0).length
  const losers = investments.filter(inv => inv.dayChange < 0).length

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Investment Summary
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio overview</p>
          </div>
        </div>
        <Link 
          to="/investments"
          className="flex items-center space-x-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          <span>View all</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Portfolio Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today's Change</p>
          <div className="flex items-center justify-center space-x-1">
            {totalDayChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <p className={`text-2xl font-bold ${
              totalDayChange >= 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {totalDayChange >= 0 ? '+' : ''}{formatCurrency(totalDayChange)}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>{gainers} gainers</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{losers} losers</span>
          </div>
        </div>
        <span>{investments.length} holdings</span>
      </div>

      {/* Top 3 Holdings */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Holdings</h4>
        {investments.length === 0 ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No investments found</p>
          </div>
        ) : (
          investments.slice(0, 3).map((investment) => (
            <div key={investment.symbol} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{investment.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{investment.symbol}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      investment.dayChange >= 0 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {investment.dayChange >= 0 ? '+' : ''}{investment.dayChangePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{investment.symbol} Holdings</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(investment.marketValue)}
                </p>
                <p className={`text-xs ${
                  investment.dayChange >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {investment.dayChange >= 0 ? '+' : ''}{formatCurrency(investment.dayChange)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default InvestmentSummaryWidget
