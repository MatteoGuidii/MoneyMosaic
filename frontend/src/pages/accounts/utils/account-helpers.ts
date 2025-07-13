import { Account } from '../../../services/types'
import { AccountDistributionData, AccountStats } from '../types'

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export const formatAccountTypeName = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'depository':
    case 'checking': 
      return 'Checking Accounts'
    case 'savings': 
      return 'Savings Accounts'
    case 'credit': 
      return 'Credit Cards'
    case 'investment': 
      return 'Investment Accounts'
    case 'loan': 
      return 'Loans'
    default: 
      return type.charAt(0).toUpperCase() + type.slice(1) + ' Accounts'
  }
}

export const generateAccountDistributionData = (
  accounts: Account[],
  totalBalance: number
): AccountDistributionData[] => {
  const accountTypeCounts: Record<string, number> = {}
  
  accounts.forEach(account => {
    accountTypeCounts[account.type] = (accountTypeCounts[account.type] || 0) + 1
  })
  
  return Object.entries(accountTypeCounts)
    .map(([type, count], index) => {
      const typeBalance = accounts
        .filter(acc => acc.type === type)
        .reduce((sum, acc) => sum + acc.balance, 0)
      
      return {
        type: formatAccountTypeName(type),
        originalType: type,
        balance: Math.abs(typeBalance),
        percentage: totalBalance > 0 ? (Math.abs(typeBalance) / Math.abs(totalBalance)) * 100 : 0,
        color: colors[index % colors.length],
        count
      }
    })
    .filter(item => item.balance > 0)
}

export const calculateAccountStats = (
  accounts: Account[],
  totalBalance: number
): AccountStats => {
  let healthyCount = 0
  
  accounts.forEach(account => {
    const lastUpdate = new Date(account.lastUpdated)
    const now = new Date()
    const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
    if (diffInHours < 24) healthyCount++
  })

  const lastSyncTime = accounts.length > 0 
    ? Math.min(...accounts.map(acc => 
        (new Date().getTime() - new Date(acc.lastUpdated).getTime()) / (1000 * 60 * 60)
      ))
    : 0

  const uniqueAccountTypes = new Set(accounts.map(acc => acc.type)).size

  return {
    totalAccounts: accounts.length,
    totalBalance,
    monthlyChange: accounts.length > 0 ? 2.5 : 0,
    healthyAccounts: healthyCount,
    lastSyncedHours: lastSyncTime,
    averageBalance: accounts.length > 0 ? totalBalance / accounts.length : 0,
    uniqueAccountTypes
  }
}
