import React from 'react'
import { Building2, Wallet, TrendingUp, Shield, Users, Activity } from 'lucide-react'

interface AccountStatsData {
  totalAccounts: number
  totalBalance: number
  monthlyChange: number
  healthyAccounts: number
  lastSyncedHours: number
  averageBalance: number
  uniqueAccountTypes: number
}

interface AccountStatsCardsProps {
  data: AccountStatsData
}

const AccountStatsCards: React.FC<AccountStatsCardsProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getChangeColor = (value: number) => {
    return value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  const getHealthStatus = () => {
    const healthPercentage = (data.healthyAccounts / data.totalAccounts) * 100
    if (healthPercentage === 100) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400' }
    if (healthPercentage >= 80) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400' }
    if (healthPercentage >= 60) return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' }
    return { label: 'Needs Attention', color: 'text-red-600 dark:text-red-400' }
  }

  const getSyncStatus = () => {
    if (data.lastSyncedHours < 1) return { label: 'Just synced', color: 'text-green-600 dark:text-green-400' }
    if (data.lastSyncedHours < 24) return { label: `${Math.floor(data.lastSyncedHours)}h ago`, color: 'text-blue-600 dark:text-blue-400' }
    if (data.lastSyncedHours < 72) return { label: `${Math.floor(data.lastSyncedHours / 24)}d ago`, color: 'text-yellow-600 dark:text-yellow-400' }
    return { label: 'Needs sync', color: 'text-red-600 dark:text-red-400' }
  }

  const healthStatus = getHealthStatus()
  const syncStatus = getSyncStatus()

  const cards = [
    {
      title: 'Total Accounts',
      value: data.totalAccounts.toString(),
      subtitle: `${data.healthyAccounts} healthy`,
      icon: Building2,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Net Worth',
      value: formatCurrency(data.totalBalance),
      subtitle: data.totalBalance === 0 ? '0%' : formatPercentage(data.monthlyChange),
      subtitleColor: data.totalBalance === 0 ? 'text-gray-500 dark:text-gray-400' : getChangeColor(data.monthlyChange),
      icon: Wallet,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600'
    },
    {
      title: 'Account Health',
      value: healthStatus.label,
      subtitle: `${data.healthyAccounts}/${data.totalAccounts} accounts`,
      subtitleColor: healthStatus.color,
      icon: Shield,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Last Sync',
      value: syncStatus.label,
      subtitle: 'All accounts',
      subtitleColor: syncStatus.color,
      icon: Activity,
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Average Balance',
      value: formatCurrency(data.averageBalance),
      subtitle: 'Per account',
      icon: TrendingUp,
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      iconColor: 'text-teal-600'
    },
    {
      title: 'Account Types',
      value: data.uniqueAccountTypes.toString(),
      subtitle: data.uniqueAccountTypes === 1 ? 'Type' : 'Different types',
      icon: Users,
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {card.title}
            </h3>
            <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {card.value}
            </p>
            <p className={`text-xs ${card.subtitleColor || 'text-gray-500 dark:text-gray-400'}`}>
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AccountStatsCards
