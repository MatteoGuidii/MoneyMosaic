import React from 'react'
import { TrendingUp, TrendingDown, Target, Wallet } from 'lucide-react'
import { PortfolioSummary } from '../types/investment-types'
import { formatCurrency, formatPercent } from '../utils/investment-utils'

interface PortfolioSummaryCardsProps {
  portfolioSummary: PortfolioSummary
}

const PortfolioSummaryCards: React.FC<PortfolioSummaryCardsProps> = ({ portfolioSummary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Total Portfolio Value</p>
            <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolioSummary.totalValue)}
            </p>
          </div>
          <div className="ml-2 flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Today's Return</p>
            <p className={`text-xl lg:text-2xl font-bold ${
              portfolioSummary.todayReturn >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(portfolioSummary.todayReturn)}
            </p>
            <p className={`text-sm ${
              portfolioSummary.todayReturn >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercent(portfolioSummary.todayReturnPercent)}
            </p>
          </div>
          <div className="ml-2 flex-shrink-0">
            {portfolioSummary.todayReturn >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-500" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-500" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Total Return</p>
            <p className={`text-xl lg:text-2xl font-bold ${
              portfolioSummary.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(portfolioSummary.unrealizedPL)}
            </p>
            <p className={`text-sm ${
              portfolioSummary.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercent(portfolioSummary.unrealizedPLPercent)}
            </p>
          </div>
          <div className="ml-2 flex-shrink-0">
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Cash Balance</p>
            <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolioSummary.cashBalance)}
            </p>
          </div>
          <div className="ml-2 flex-shrink-0">
            <Wallet className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortfolioSummaryCards
