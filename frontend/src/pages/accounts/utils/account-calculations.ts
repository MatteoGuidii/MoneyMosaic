import { Account } from '../../../services/types'
import { AccountBalances, AccountTrendsData } from '../types'

export const calculateAccountBalances = (accounts: Account[]): AccountBalances => {
  let totalBalance = 0
  let checkingBalance = 0
  let savingsBalance = 0
  let creditBalance = 0
  let investmentBalance = 0

  accounts.forEach(account => {
    const balance = account.balance || 0
    
    switch (account.type.toLowerCase()) {
      case 'checking':
      case 'depository':
        checkingBalance += balance
        totalBalance += balance
        break
      case 'savings':
        savingsBalance += balance
        totalBalance += balance
        break
      case 'credit':
        creditBalance += Math.abs(balance)
        break
      case 'investment':
        investmentBalance += balance
        totalBalance += balance
        break
    }
  })

  return { totalBalance, checkingBalance, savingsBalance, creditBalance, investmentBalance }
}

export const generateAccountTrendsData = (
  balances: AccountBalances,
  accountsLength: number
): AccountTrendsData[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    
    if (accountsLength === 0) {
      return {
        date: date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
        totalBalance: 0,
        checkingBalance: 0,
        savingsBalance: 0,
        creditBalance: 0
      }
    }
    
    const variance = 0.02 // 2% variance
    return {
      date: date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
      totalBalance: balances.totalBalance * (1 + (Math.random() - 0.5) * variance),
      checkingBalance: balances.checkingBalance * (1 + (Math.random() - 0.5) * variance),
      savingsBalance: balances.savingsBalance * (1 + (Math.random() - 0.5) * variance),
      creditBalance: balances.creditBalance * (1 + (Math.random() - 0.5) * variance)
    }
  })
}
