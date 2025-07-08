import React from 'react'
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react'
import { EarningsData } from '../services/apiService'

interface CashFlowInsightsProps {
  data: EarningsData | null
}

const CashFlowInsights: React.FC<CashFlowInsightsProps> = ({ data }) => {
  if (!data) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0
    }).format(Math.abs(value))
  }

  const getChangeIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="w-4 h-4 text-success-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-danger-500" />
    )
  }

  const getChangeColor = (value: number) => {
    return value >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
  }

  const insights = [
    {
      title: "Today's Net Cash Flow",
      value: data.todayNetFlow,
      icon: <DollarSign className="w-5 h-5" />,
      description: "Today's income minus expenses"
    },
    {
      title: "Month-to-Date Net Flow",
      value: data.monthToDateNetFlow,
      icon: <Calendar className="w-5 h-5" />,
      description: "This month's cumulative cash flow"
    },
    {
      title: "7-Day Rolling Average",
      value: data.sevenDayAverage,
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Average daily net flow over 7 days"
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Cash Flow Insights
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="text-gray-600 dark:text-gray-400">
                  {insight.icon}
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {insight.title}
                </span>
              </div>
              {getChangeIcon(insight.value)}
            </div>
            
            <div className="mb-1">
              <span className={`text-2xl font-bold ${getChangeColor(insight.value)}`}>
                {insight.value >= 0 ? '+' : '-'}{formatCurrency(insight.value)}
              </span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CashFlowInsights
