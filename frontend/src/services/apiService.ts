export interface Transaction {
  id: string
  transaction_id: string
  account_id: string
  date: string
  name: string
  merchant_name?: string
  amount: number
  category: string
  category_detailed?: string
  type: string
  pending: boolean
  account_name?: string
}

export interface Account {
  id: string
  name: string
  type: string
  balance: number
  lastUpdated: string
}

export interface Investment {
  symbol: string
  companyName: string
  quantity: number
  marketPrice: number
  marketValue: number
  dayChange: number
  dayChangePercent: number
}

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

export interface BankConnection {
  id: number
  institution_id: string
  name: string
  created_at: string
  updated_at: string
  is_active: boolean
  last_sync: string
  status: 'healthy' | 'warning' | 'error'
}

export interface NetWorthData {
  date: string
  cash: number
  investments: number
  netWorth: number
}

export interface BudgetData {
  category: string
  budgeted: number
  spent: number
  remaining: number
  percentage: number
}

export interface MerchantData {
  name: string
  totalSpent: number
  transactionCount: number
  category: string
  isRecurring: boolean
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  progress: number
}

export interface CashFlowForecast {
  date: string
  projectedBalance: number
  projectedIncome: number
  projectedExpenses: number
  confidence: number
}

export interface Alert {
  id: string
  type: 'large_transaction' | 'low_balance' | 'recurring_payment' | 'budget_exceeded'
  title: string
  description: string
  amount?: number
  date: string
  read: boolean
  severity: 'info' | 'warning' | 'error'
}

class ApiService {
  private baseURL = '/api'

  async fetchOverviewData(): Promise<OverviewData> {
    const response = await fetch(`${this.baseURL}/overview`)
    if (!response.ok) throw new Error('Failed to fetch overview data')
    return await response.json()
  }

  async fetchTransactions(
    dateRange?: string,
    categories?: string[],
    search?: string,
    page = 1,
    startDate?: string,
    accounts?: string[],
    minAmount?: number,
    maxAmount?: number,
    sortField?: string,
    sortDirection?: 'asc' | 'desc',
    limit = 20
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(dateRange && { range: dateRange }),
      ...(search && { search }),
      ...(categories && categories.length > 0 && { categories: categories.join(',') }),
      ...(accounts && accounts.length > 0 && { accounts: accounts.join(',') }),
      ...(startDate && { startDate }),
      ...(minAmount !== undefined && { minAmount: minAmount.toString() }),
      ...(maxAmount !== undefined && { maxAmount: maxAmount.toString() }),
      ...(sortField && { sortField }),
      ...(sortDirection && { sortDirection })
    })
    
    const response = await fetch(`${this.baseURL}/transactions?${params}`)
    if (!response.ok) throw new Error('Failed to fetch transactions')
    return await response.json()
  }

  async fetchAccounts(): Promise<Account[]> {
    const response = await fetch(`${this.baseURL}/accounts`)
    if (!response.ok) throw new Error('Failed to fetch accounts')
    return await response.json()
  }

  async fetchInvestments(): Promise<Investment[]> {
    const response = await fetch(`${this.baseURL}/investments`)
    if (!response.ok) throw new Error('Failed to fetch investments')
    return await response.json()
  }

  async fetchSpendingData(dateRange: string): Promise<SpendingData[]> {
    const response = await fetch(`${this.baseURL}/spending-data?range=${dateRange}`)
    if (!response.ok) throw new Error('Failed to fetch spending data')
    return await response.json()
  }

  async fetchCategoryData(dateRange: string): Promise<CategoryData[]> {
    const response = await fetch(`${this.baseURL}/category-data?range=${dateRange}`)
    if (!response.ok) throw new Error('Failed to fetch category data')
    return await response.json()
  }

  async fetchEarningsData(): Promise<EarningsData> {
    const response = await fetch(`${this.baseURL}/earnings`)
    if (!response.ok) throw new Error('Failed to fetch earnings data')
    return await response.json()
  }

  async fetchCategories(): Promise<string[]> {
    const response = await fetch(`${this.baseURL}/categories`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return await response.json()
  }

  async fetchBankConnections(): Promise<BankConnection[]> {
    const response = await fetch(`${this.baseURL}/banks`)
    if (!response.ok) throw new Error('Failed to fetch bank connections')
    return await response.json()
  }

  async fetchNetWorthData(dateRange: string): Promise<NetWorthData[]> {
    const response = await fetch(`${this.baseURL}/net-worth?range=${dateRange}`)
    if (!response.ok) throw new Error('Failed to fetch net worth data')
    return await response.json()
  }

  async fetchBudgetData(): Promise<BudgetData[]> {
    const response = await fetch(`${this.baseURL}/budget`)
    if (!response.ok) throw new Error('Failed to fetch budget data')
    return await response.json()
  }

  async fetchTopMerchants(dateRange: string): Promise<MerchantData[]> {
    const response = await fetch(`${this.baseURL}/merchants?range=${dateRange}`)
    if (!response.ok) throw new Error('Failed to fetch merchant data')
    return await response.json()
  }

  async fetchSavingsGoals(): Promise<SavingsGoal[]> {
    const response = await fetch(`${this.baseURL}/savings-goals`)
    if (!response.ok) throw new Error('Failed to fetch savings goals')
    return await response.json()
  }

  async fetchCashFlowForecast(): Promise<CashFlowForecast[]> {
    const response = await fetch(`${this.baseURL}/cash-flow-forecast`)
    if (!response.ok) throw new Error('Failed to fetch cash flow forecast')
    return await response.json()
  }

  async fetchAlerts(): Promise<Alert[]> {
    const response = await fetch(`${this.baseURL}/alerts`)
    if (!response.ok) throw new Error('Failed to fetch alerts')
    return await response.json()
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/alerts/${alertId}/read`, {
      method: 'PATCH'
    })
    if (!response.ok) throw new Error('Failed to mark alert as read')
  }

  async createSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'progress'>): Promise<SavingsGoal> {
    const response = await fetch(`${this.baseURL}/savings-goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goal)
    })
    if (!response.ok) throw new Error('Failed to create savings goal')
    return await response.json()
  }

  async updateBudget(budgets: BudgetData[]): Promise<void> {
    const response = await fetch(`${this.baseURL}/budget`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budgets)
    })
    if (!response.ok) throw new Error('Failed to update budget')
  }

  async exportTransactions(format: 'csv' | 'pdf', dateRange: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/export/transactions?format=${format}&range=${dateRange}`)
    if (!response.ok) throw new Error('Failed to export transactions')
    return await response.blob()
  }
}

export const apiService = new ApiService()
