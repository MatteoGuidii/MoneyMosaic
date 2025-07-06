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
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 animate-pulse border border-gray-100 dark:border-gray-800">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
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
      title: 'Cash Balance',
      value: formatCurrency(data.totalCashBalance),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      change: '+2.5%',
      changeType: 'positive'
    },
    {
      title: 'Portfolio Value',
      value: formatCurrency(data.totalPortfolioValue),
      icon: TrendingUp,
      gradient: 'from-blue-500 to-indigo-600',
      change: '+5.2%',
      changeType: 'positive'
    },
    {
      title: 'Net Worth',
      value: formatCurrency(data.netWorth),
      icon: Wallet,
      gradient: 'from-purple-500 to-pink-600',
      change: '+3.8%',
      changeType: 'positive'
    },
    {
      title: "Net Flow",
      value: formatCurrency(data.todayNetFlow),
      icon: ArrowUpDown,
      gradient: data.todayNetFlow >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-rose-600',
      change: data.todayNetFlow >= 0 ? '+0.8%' : '-1.2%',
      changeType: data.todayNetFlow >= 0 ? 'positive' : 'negative'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              card.changeType === 'positive' 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {card.change}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {card.title}
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OverviewCards
