import React from 'react'
import { DollarSign, TrendingDown, BarChart3, Target } from 'lucide-react'
import { SummaryCardsProps } from '../types'
import { formatCurrency, formatPercentage, getChangeIcon, getChangeColor, getChangeIconColor } from '../utils'

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, selectedPeriod }) => {
  const ChangeIcon = getChangeIcon(summary.comparison?.changes.totalIncome.percentage || 0)
  const ExpenseChangeIcon = getChangeIcon(summary.comparison?.changes.totalExpenses.percentage || 0)
  const CashFlowChangeIcon = getChangeIcon(summary.comparison?.changes.netCashFlow.percentage || 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.summary.totalIncome)}
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-green-500" />
        </div>
        {summary.comparison && (
          <div className="mt-2 flex items-center text-sm">
            <ChangeIcon className={`w-4 h-4 mr-1 ${getChangeIconColor(summary.comparison.changes.totalIncome.percentage, true)}`} />
            <span className={getChangeColor(summary.comparison.changes.totalIncome.percentage, true)}>
              {formatPercentage(summary.comparison.changes.totalIncome.percentage)}
            </span>
            <span className="text-gray-500 ml-1">vs last {selectedPeriod}</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.summary.totalExpenses)}
            </p>
          </div>
          <TrendingDown className="w-8 h-8 text-red-500" />
        </div>
        {summary.comparison && (
          <div className="mt-2 flex items-center text-sm">
            <ExpenseChangeIcon className={`w-4 h-4 mr-1 ${getChangeIconColor(summary.comparison.changes.totalExpenses.percentage)}`} />
            <span className={getChangeColor(summary.comparison.changes.totalExpenses.percentage)}>
              {formatPercentage(summary.comparison.changes.totalExpenses.percentage)}
            </span>
            <span className="text-gray-500 ml-1">vs last {selectedPeriod}</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Net Cash Flow</p>
            <p className={`text-2xl font-bold ${summary.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.summary.netCashFlow)}
            </p>
          </div>
          <BarChart3 className="w-8 h-8 text-blue-500" />
        </div>
        {summary.comparison && (
          <div className="mt-2 flex items-center text-sm">
            <CashFlowChangeIcon className={`w-4 h-4 mr-1 ${getChangeIconColor(summary.comparison.changes.netCashFlow.percentage)}`} />
            <span className={getChangeColor(summary.comparison.changes.netCashFlow.percentage)}>
              {formatPercentage(summary.comparison.changes.netCashFlow.percentage)}
            </span>
            <span className="text-gray-500 ml-1">vs last {selectedPeriod}</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</p>
            <p className={`text-2xl font-bold ${summary.summary.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.summary.savingsRate.toFixed(1)}%
            </p>
          </div>
          <Target className="w-8 h-8 text-purple-500" />
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Top category: {summary.summary.topExpenseCategory}
        </div>
      </div>
    </div>
  )
}

export default SummaryCards
