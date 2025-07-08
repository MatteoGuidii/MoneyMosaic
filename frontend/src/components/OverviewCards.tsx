import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Wallet, ArrowUpDown } from 'lucide-react'
import { OverviewData, apiService } from '../services/apiService'

interface OverviewCardsProps {
  data: OverviewData | null
}

interface HistoricalData {
  previousNetWorth: number
  previousCashBalance: number
  previousPortfolioValue: number
  previousNetFlow: number
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ data }) => {
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null)

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        // Get historical net worth data (for cash, portfolio, net worth)
        const netWorthHistory = await apiService.fetchNetWorthData('7d')
        
        // Get historical spending data (for net flow)
        const spendingHistory = await apiService.fetchSpendingData('7d')

        if (netWorthHistory.length > 0 && spendingHistory.length > 0) {
          // Get the most recent previous data point
          const previousNetWorthData = netWorthHistory[netWorthHistory.length - 2] || netWorthHistory[0]
          const previousSpendingData = spendingHistory[spendingHistory.length - 2] || spendingHistory[0]
          
          setHistoricalData({
            previousNetWorth: previousNetWorthData.netWorth,
            previousCashBalance: previousNetWorthData.cash,
            previousPortfolioValue: previousNetWorthData.investments,
            previousNetFlow: previousSpendingData.income - previousSpendingData.spending
          })
        }
      } catch (error) {
        console.error('Failed to fetch historical data:', error)
        // Set default values if historical data fails
        setHistoricalData({
          previousNetWorth: 0,
          previousCashBalance: 0,
          previousPortfolioValue: 0,
          previousNetFlow: 0
        })
      }
    }

    if (data) {
      fetchHistoricalData()
    }
  }, [data])

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
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }

  // Calculate real percentage change based on historical data
  const calculateChange = (currentValue: number, previousValue: number) => {
    // If no historical data available yet, show loading or neutral state
    if (historicalData === null) {
      return { change: '...', changeType: 'neutral' as const }
    }

    // If both values are zero, no change
    if (currentValue === 0 && previousValue === 0) {
      return { change: '0%', changeType: 'neutral' as const }
    }

    // If previous value is zero but current isn't, it's a new value (infinite growth)
    if (previousValue === 0 && currentValue !== 0) {
      return { change: 'New', changeType: currentValue > 0 ? 'positive' as const : 'negative' as const }
    }

    // If current value is zero but previous wasn't, it's a 100% loss
    if (currentValue === 0 && previousValue !== 0) {
      return { change: '-100%', changeType: 'negative' as const }
    }

    // Calculate actual percentage change: ((current - previous) / |previous|) * 100
    const percentageChange = ((currentValue - previousValue) / Math.abs(previousValue)) * 100
    
    // Format the percentage
    const formattedChange = percentageChange >= 0 
      ? `+${percentageChange.toFixed(1)}%` 
      : `${percentageChange.toFixed(1)}%`
    
    const changeType = percentageChange > 0 ? 'positive' : percentageChange < 0 ? 'negative' : 'neutral'
    
    return { change: formattedChange, changeType }
  }

  const cards = [
    {
      title: 'Cash Balance',
      value: formatCurrency(data.totalCashBalance),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      ...calculateChange(data.totalCashBalance, historicalData?.previousCashBalance || 0)
    },
    {
      title: 'Portfolio Value',
      value: formatCurrency(data.totalPortfolioValue),
      icon: TrendingUp,
      gradient: 'from-blue-500 to-indigo-600',
      ...calculateChange(data.totalPortfolioValue, historicalData?.previousPortfolioValue || 0)
    },
    {
      title: 'Net Worth',
      value: formatCurrency(data.netWorth),
      icon: Wallet,
      gradient: 'from-purple-500 to-pink-600',
      ...calculateChange(data.netWorth, historicalData?.previousNetWorth || 0)
    },
    {
      title: "Net Flow",
      value: formatCurrency(data.todayNetFlow),
      icon: ArrowUpDown,
      gradient: data.todayNetFlow >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-rose-600',
      ...calculateChange(data.todayNetFlow, historicalData?.previousNetFlow || 0)
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
                : card.changeType === 'negative'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
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
