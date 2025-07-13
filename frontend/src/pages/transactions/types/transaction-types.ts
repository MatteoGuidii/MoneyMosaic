export interface TransactionFilters {
  dateRange: string
  categories: string[]
  accounts: string[]
  searchTerm: string
  amountRange: { min: number; max: number }
  customDateRange: { start: string; end: string }
}

export interface TransactionPagination {
  currentPage: number
}

export interface TransactionSorting {
  field: string
  direction: 'asc' | 'desc'
}

export interface TransactionAnalyticsData {
  trendsData: TrendData[]
  categoryData: CategoryData[]
  allCategories: string[]
}

export interface TrendData {
  date: string
  income: number
  spending: number
  net: number
}

export interface CategoryData {
  category: string
  amount: number
  percentage: number
  color: string
}

export interface TransactionState {
  transactions: any[]
  loading: boolean
  categories: string[]
  accounts: string[]
  totalTransactions: number
  previousPeriodTransactions: any[]
  filters: TransactionFilters
  pagination: TransactionPagination
  sorting: TransactionSorting
  showCustomDatePicker: boolean
}

export interface UseTransactionDataReturn {
  transactions: any[]
  loading: boolean
  categories: string[]
  accounts: string[]
  totalTransactions: number
  previousPeriodTransactions: any[]
  loadInitialData: () => Promise<void>
  loadTransactions: () => Promise<void>
}

export interface UseTransactionFiltersReturn {
  filters: TransactionFilters
  showCustomDatePicker: boolean
  handleDateRangeChange: (range: string) => void
  handleCustomDateRangeChange: (startDate: string, endDate: string) => void
  handleCategoryFilter: (categories: string[]) => void
  handleAccountFilter: (accounts: string[]) => void
  handleAmountRangeChange: (range: { min: number; max: number }) => void
  handleSearch: (term: string) => void
  handleClearFilters: () => void
  setShowCustomDatePicker: (show: boolean) => void
}

export interface UseTransactionAnalyticsReturn {
  analyticsData: TransactionAnalyticsData
  insights: any[]
}

export interface UseTransactionExportReturn {
  handleExport: () => Promise<void>
}
