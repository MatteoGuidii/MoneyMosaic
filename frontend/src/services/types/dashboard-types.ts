export interface OverviewData {
  totalCashBalance: number
  totalPortfolioValue: number
  netWorth: number
  todayNetFlow: number
}

export interface SpendingData {
  date: string
  spending: number
  income: number
}

export interface CategoryData {
  category: string
  amount: number
  percentage: number
}

export interface EarningsData {
  todayNetFlow: number
  monthToDateNetFlow: number
  sevenDayAverage: number
}

export interface NetWorthData {
  date: string
  netWorth: number
  assets: number
  liabilities: number
  cash: number
  investments: number
}

export interface BudgetData {
  category: string
  budgeted: number
  spent: number
  remaining: number
  percentage: number
}

export interface MerchantData {
  merchantName: string
  totalSpent: number
  transactionCount: number
  avgTransaction: number
  lastTransaction: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  priority: 'high' | 'medium' | 'low'
  isCompleted: boolean
}

export interface CashFlowForecast {
  date: string
  projectedIncome: number
  projectedExpenses: number
  projectedBalance: number
  confidence: number
}

export interface Alert {
  id: string
  type: 'warning' | 'info' | 'error'
  title: string
  message: string
  date: string
  isRead: boolean
}
