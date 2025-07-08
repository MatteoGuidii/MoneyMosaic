import React from 'react'
import { Calendar, ArrowUpRight, ArrowDownRight, Percent, DollarSign } from 'lucide-react'

interface QuickStat {
  label: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
}

interface StatsCardProps {
  transactions: any[]
  dateRange: string
}

const StatsCard: React.FC<StatsCardProps> = ({ transactions, dateRange }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const calculateStats = () => {
    const totalSpending = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    const totalIncome = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalTransactions = transactions.length
    const avgTransactionAmount = totalTransactions > 0 ? totalSpending / transactions.filter(t => t.amount > 0).length : 0

    // Calculate frequency (transactions per day)
    const daysInPeriod = parseInt(dateRange)
    const transactionFrequency = totalTransactions / daysInPeriod

    return {
      totalSpending,
      totalIncome,
      totalTransactions,
      avgTransactionAmount,
      transactionFrequency,
      netFlow: totalIncome - totalSpending,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0
    }
  }

  const stats = calculateStats()

  const quickStats: QuickStat[] = [
    {
      label: 'Average Transaction',
      value: formatCurrency(stats.avgTransactionAmount),
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: 'Daily Frequency',
      value: `${stats.transactionFrequency.toFixed(1)}/day`,
      icon: <Calendar className="w-5 h-5" />
    },
    {
      label: 'Savings Rate',
      value: `${stats.savingsRate.toFixed(1)}%`,
      changeType: stats.savingsRate >= 20 ? 'positive' : stats.savingsRate >= 10 ? 'neutral' : 'negative',
      icon: <Percent className="w-5 h-5" />
    },
    {
      label: 'Net Flow',
      value: formatCurrency(Math.abs(stats.netFlow)),
      changeType: stats.netFlow >= 0 ? 'positive' : 'negative',
      icon: stats.netFlow >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />
    }
  ]

  const getStatColor = (changeType?: string) => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 dark:text-green-400'
      case 'negative':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  }

  const getIconBgColor = (changeType?: string) => {
    switch (changeType) {
      case 'positive':
        return 'bg-green-100 dark:bg-green-900/20'
      case 'negative':
        return 'bg-red-100 dark:bg-red-900/20'
      default:
        return 'bg-blue-100 dark:bg-blue-900/20'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickStats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className={`text-xl font-bold ${getStatColor(stat.changeType)}`}>
                {stat.value}
              </p>
              {stat.change && (
                <p className={`text-sm mt-1 ${getStatColor(stat.changeType)}`}>
                  {stat.change}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${getIconBgColor(stat.changeType)}`}>
              <div className={getStatColor(stat.changeType)}>
                {stat.icon}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCard
