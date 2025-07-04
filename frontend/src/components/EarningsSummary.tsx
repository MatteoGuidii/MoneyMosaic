import React from 'react'
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react'
import { EarningsData } from '../services/apiService'

interface EarningsSummaryProps {
  data: EarningsData | null
}

const EarningsSummary: React.FC<EarningsSummaryProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getAmountColor = (amount: number) => {
    return amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  const getAmountIcon = (amount: number) => {
    return amount >= 0 ? TrendingUp : TrendingDown
  }

  const cards = [
    {
      title: "Today's Net Cash Flow",
      value: formatCurrency(data.todayNetFlow),
      icon: DollarSign,
      amount: data.todayNetFlow,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Month-to-Date Net Flow',
      value: formatCurrency(data.monthToDateNetFlow),
      icon: Calendar,
      amount: data.monthToDateNetFlow,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: '7-Day Rolling Average',
      value: formatCurrency(data.sevenDayAverage),
      icon: TrendingUp,
      amount: data.sevenDayAverage,
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const AmountIcon = getAmountIcon(card.amount)
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-purple-600" />
              </div>
              <div className={`flex items-center ${getAmountColor(card.amount)}`}>
                <AmountIcon className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">
                  {card.amount >= 0 ? '+' : ''}
                  {formatCurrency(Math.abs(card.amount))}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {card.title}
              </h3>
              <p className={`text-2xl font-bold ${getAmountColor(card.amount)}`}>
                {card.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default EarningsSummary
