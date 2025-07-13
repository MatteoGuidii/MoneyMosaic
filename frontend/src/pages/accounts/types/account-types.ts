import { Account } from '../../../services/types'

export interface AccountFilters {
  searchTerm: string
  selectedTypes: string[]
  selectedStatus: string
}

export interface AccountBalances {
  totalBalance: number
  checkingBalance: number
  savingsBalance: number
  creditBalance: number
  investmentBalance: number
}

export interface AccountTrendsData {
  date: string
  totalBalance: number
  checkingBalance: number
  savingsBalance: number
  creditBalance: number
}

export interface AccountDistributionData {
  type: string
  originalType: string
  balance: number
  percentage: number
  color: string
  count: number
}

export interface AccountStats {
  totalAccounts: number
  totalBalance: number
  monthlyChange: number
  healthyAccounts: number
  lastSyncedHours: number
  averageBalance: number
  uniqueAccountTypes: number
}

export interface AccountAnalytics {
  balances: AccountBalances
  trendsData: AccountTrendsData[]
  distributionData: AccountDistributionData[]
  statsData: AccountStats
}

export interface UseAccountsReturn {
  accounts: Account[]
  loading: boolean
  loadAccounts: () => Promise<void>
  handleBankConnectionChange: () => Promise<void>
  handleSyncComplete: () => Promise<void>
  handleSyncAccount: (accountId: string) => Promise<void>
  handleViewTransactions: (accountId: string) => void
  handleDeleteAccount: (accountId: string) => Promise<void>
  handleExportAccounts: () => void
}

export interface UseAccountFiltersReturn {
  filters: AccountFilters
  handleTypeFilter: (types: string[]) => void
  handleStatusFilter: (status: string) => void
  handleSearch: (term: string) => void
  handleClearFilters: () => void
  filteredAccounts: Account[]
}

export interface UseAccountAnalyticsReturn {
  analytics: AccountAnalytics
  insights: any[]
  accountTypes: string[]
}
