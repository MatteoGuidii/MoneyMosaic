import React from 'react'
import { DollarSign, TrendingUp, Wallet, ArrowUpDown } from 'lucide-react'
import { OverviewData } from '../services/apiService'

interface OverviewCardsProps {
  data: OverviewData | null
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
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

  const cards = [
    {
      title: 'Total Cash Balance',
      value: formatCurrency(data.totalCashBalance),
      icon: DollarSign,
      color: 'text-success-600',
      bgColor: 'bg-success-50 dark:bg-success-900/20'
    },
    {
      title: 'Total Portfolio Value',
      value: formatCurrency(data.totalPortfolioValue),
      icon: TrendingUp,
      color: 'text-navy-600',
      bgColor: 'bg-navy-50 dark:bg-navy-900/20'
    },
    {
      title: 'Net Worth',
      value: formatCurrency(data.netWorth),
      icon: Wallet,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20'
    },
    {
      title: "Today's Net Flow",
      value: formatCurrency(data.todayNetFlow),
      icon: ArrowUpDown,
      color: data.todayNetFlow >= 0 ? 'text-success-600' : 'text-danger-600',
      bgColor: data.todayNetFlow >= 0 ? 'bg-success-50 dark:bg-success-900/20' : 'bg-danger-50 dark:bg-danger-900/20'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {card.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OverviewCards
