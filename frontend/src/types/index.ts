// Core data interfaces
export interface OverviewData {
  totalCashBalance: number
  totalPortfolioValue: number
  netWorth: number
  monthlyChange: number
}

export interface Transaction {
  transaction_id: string
  account_id: string
  amount: number
  date: string
  name: string
  merchant_name?: string
  category?: string[]
  account_name?: string
}

export interface Investment {
  symbol: string
  name: string
  quantity: number
  marketPrice: number
  marketValue: number
  dayChange: number
  dayChangePercent: number
}

export interface BudgetData {
  category: string
  budgeted: number
  spent: number
  percentage: number
}

export interface SavingsGoal {
  id: string
  name: string
  target: number
  current: number
  deadline: string
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
  monthlyIncome: number
  monthlyExpenses: number
  netIncome: number
  savingsRate: number
}

export interface CashFlowForecast {
  date: string
  projectedBalance: number
  confidence: number
}

// API Response interfaces
export interface TransactionsResponse {
  transactions: Transaction[]
  total: number
}

// Component prop interfaces
export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
}

export interface FilterBarProps {
  categories: string[]
  selectedDateRange: string
  selectedCategories: string[]
  onDateRangeChange: (range: string) => void
  onCategoryFilter: (categories: string[]) => void
  onSearch: (term: string) => void
}

export interface TransactionsTableProps {
  transactions: Transaction[]
  currentPage: number
  totalTransactions: number
  onPageChange: (page: number) => void
}

// Widget prop interfaces
export interface ChartProps {
  spendingData: SpendingData[]
  categoryData: CategoryData[]
  onCategorySelect: (category: string) => void
}

export interface OverviewCardsProps {
  data: OverviewData | null
}

export interface CashFlowInsightsProps {
  data: EarningsData | null
}

export interface InvestmentsPanelProps {
  investments: Investment[]
}

// Theme context interface
export interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}
