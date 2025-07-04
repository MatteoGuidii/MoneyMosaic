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
    limit = 20
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(dateRange && { range: dateRange }),
      ...(search && { search }),
      ...(categories && categories.length > 0 && { categories: categories.join(',') })
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
}

export const apiService = new ApiService()
