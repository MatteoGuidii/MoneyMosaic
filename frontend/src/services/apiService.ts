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
  rawType?: string
  subtype?: string
  balance: number
  lastUpdated: string
  institutionName?: string
}

export interface Investment {
  symbol: string
  companyName: string
  quantity: number
  marketPrice: number
  marketValue: number
  dayChange: number
  dayChangePercent: number
  accountId: string
  accountName: string
  institutionName: string
  sector?: string
  industry?: string
  costBasis?: number
  securityType?: string
}

export interface InvestmentSummary {
  totalValue: number
  totalCostBasis: number
  totalDayChange: number
  totalDayChangePercent: number
  holdingsCount: number
  accountsCount: number
  topHoldings: Investment[]
  sectorAllocation: Array<{
    sector: string
    value: number
    percentage: number
  }>
}

export interface InvestmentTransaction {
  investment_transaction_id: string
  account_id: string
  security_id?: string
  type: string
  subtype?: string
  quantity?: number
  price?: number
  amount: number
  date: string
  symbol?: string
  security_name?: string
  account_name?: string
  institution_name?: string
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
    limit = 1000, // Default to 1000 for open source usage
    endDate?: string
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(dateRange && { range: dateRange }),
      ...(search && { search }),
      ...(categories && categories.length > 0 && { categories: categories.join(',') }),
      ...(accounts && accounts.length > 0 && { accounts: accounts.join(',') }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
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
    const data = await response.json()
    
    // Handle the new response structure
    if (data && typeof data === 'object') {
      // Return detailed investments if available
      if (Array.isArray(data.investments)) {
        return data.investments
      }
      
      // If we have investment accounts but no detailed data, return empty array
      // The UI will handle showing account balances instead
      return []
    }
    
    // Fallback for direct array response
    return Array.isArray(data) ? data : []
  }

  async fetchInvestmentAccounts(): Promise<any> {
    const response = await fetch(`${this.baseURL}/investments`)
    if (!response.ok) throw new Error('Failed to fetch investment accounts')
    return await response.json()
  }

  async fetchInvestmentSummary(): Promise<InvestmentSummary> {
    const response = await fetch(`${this.baseURL}/investments/summary`)
    if (!response.ok) throw new Error('Failed to fetch investment summary')
    const data = await response.json()
    
    // Return the data as-is, but ensure it has the required structure
    return {
      totalValue: data.totalValue || 0,
      totalCostBasis: data.totalCostBasis || 0,
      totalDayChange: data.totalDayChange || 0,
      totalDayChangePercent: data.totalDayChangePercent || 0,
      holdingsCount: data.holdingsCount || 0,
      accountsCount: data.accountsCount || 0,
      topHoldings: data.topHoldings || [],
      sectorAllocation: data.sectorAllocation || [],
      ...data
    }
  }

  async fetchInvestmentTransactions(filters: {
    account_id?: string
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  } = {}): Promise<InvestmentTransaction[]> {
    const params = new URLSearchParams()
    
    if (filters.account_id) params.append('account_id', filters.account_id)
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())
    
    const response = await fetch(`${this.baseURL}/investments/transactions?${params}`)
    if (!response.ok) throw new Error('Failed to fetch investment transactions')
    return await response.json()
  }

  async syncInvestments(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/investments/sync`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to sync investments')
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

  async fetchBudgetData(month?: string, year?: number): Promise<BudgetData[]> {
    const params = new URLSearchParams()
    if (month) params.append('month', month)
    if (year) params.append('year', year.toString())
    
    const queryString = params.toString()
    const url = `${this.baseURL}/budget${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch budget data')
    return await response.json()
  }

  async createOrUpdateBudget(category: string, amount: number, month?: string, year?: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/budget`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, amount, month, year })
    })
    if (!response.ok) throw new Error('Failed to save budget')
  }

  async deleteBudget(category: string, month?: string, year?: number): Promise<void> {
    const params = new URLSearchParams()
    if (month) params.append('month', month)
    if (year) params.append('year', year.toString())
    
    const queryString = params.toString()
    const url = `${this.baseURL}/budget/${encodeURIComponent(category)}${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete budget')
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

  async exportTransactions(format: 'csv' | 'pdf', dateRange: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/export/transactions?format=${format}&range=${dateRange}`)
    if (!response.ok) throw new Error('Failed to export transactions')
    return await response.blob()
  }

  // Sync methods for data refresh
  async syncAllData(): Promise<{ success: boolean; message: string; transactionCount?: number }> {
    const response = await fetch(`${this.baseURL}/transactions/fetch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ days: 30 })
    })
    if (!response.ok) throw new Error('Failed to sync data')
    return await response.json()
  }

  async syncAccounts(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/sync/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (!response.ok) throw new Error('Failed to sync accounts')
    return await response.json()
  }

  async getSyncStatus(): Promise<{ lastSync: string; isHealthy: boolean; nextAutoSync: string }> {
    const response = await fetch(`${this.baseURL}/sync/status`)
    if (!response.ok) throw new Error('Failed to get sync status')
    return await response.json()
  }

  // Diagnostic methods for troubleshooting
  async checkPlaidConfig(): Promise<any> {
    const response = await fetch(`${this.baseURL}/link/config/check`)
    if (!response.ok) throw new Error('Failed to check Plaid config')
    return await response.json()
  }

  async diagnosePlaidConnection(): Promise<any> {
    const response = await fetch(`${this.baseURL}/link/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Diagnostic failed')
    }
    return await response.json()
  }

  // Optimized method to fetch all investment data in one call
  async fetchInvestmentData(): Promise<{
    investments: Investment[]
    accounts: any
    summary: InvestmentSummary
  }> {
    try {
      // Use the new optimized combined endpoint
      const response = await fetch(`${this.baseURL}/investments/all`)
      
      if (!response.ok) {
        // Fallback to individual calls if the combined endpoint fails
        console.warn('Combined endpoint failed, falling back to individual calls')
        const [accountsResponse, summaryResponse] = await Promise.all([
          fetch(`${this.baseURL}/investments`),
          fetch(`${this.baseURL}/investments/summary`)
        ])

        if (!accountsResponse.ok) throw new Error('Failed to fetch investment accounts')
        if (!summaryResponse.ok) throw new Error('Failed to fetch investment summary')

        const [accountsData, summaryData] = await Promise.all([
          accountsResponse.json(),
          summaryResponse.json()
        ])

        const investments = Array.isArray(accountsData.investments) ? accountsData.investments : []

        const summary = {
          totalValue: summaryData.totalValue || 0,
          totalCostBasis: summaryData.totalCostBasis || 0,
          totalDayChange: summaryData.totalDayChange || 0,
          totalDayChangePercent: summaryData.totalDayChangePercent || 0,
          holdingsCount: summaryData.holdingsCount || 0,
          accountsCount: summaryData.accountsCount || 0,
          topHoldings: summaryData.topHoldings || [],
          sectorAllocation: summaryData.sectorAllocation || [],
          ...summaryData
        }

        return {
          investments,
          accounts: accountsData || {},
          summary
        }
      }

      // Use the optimized combined response
      const data = await response.json()
      
      return {
        investments: data.investments || [],
        accounts: data.accounts || {},
        summary: {
          totalValue: data.summary?.totalValue || 0,
          totalCostBasis: data.summary?.totalCostBasis || 0,
          totalDayChange: data.summary?.totalDayChange || 0,
          totalDayChangePercent: data.summary?.totalDayChangePercent || 0,
          holdingsCount: data.summary?.holdingsCount || 0,
          accountsCount: data.summary?.accountsCount || 0,
          topHoldings: data.summary?.topHoldings || [],
          sectorAllocation: data.summary?.sectorAllocation || [],
          ...data.summary
        }
      }
    } catch (error) {
      console.error('Error fetching investment data:', error)
      // Return safe defaults on error
      return {
        investments: [],
        accounts: {},
        summary: {
          totalValue: 0,
          totalCostBasis: 0,
          totalDayChange: 0,
          totalDayChangePercent: 0,
          holdingsCount: 0,
          accountsCount: 0,
          topHoldings: [],
          sectorAllocation: []
        }
      }
    }
  }

  // New advanced endpoints

  // Get filtered transactions with advanced filtering
  async fetchFilteredTransactions(filters: {
    startDate?: string;
    endDate?: string;
    category?: string;
    merchant?: string;
    minAmount?: number;
    maxAmount?: number;
    type?: 'income' | 'expense';
    includePending?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    transactions: Transaction[];
    total: number;
    summary: {
      totalExpenses: number;
      totalIncome: number;
      netCashFlow: number;
      transactionCount: number;
    };
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseURL}/transactions/?${params}`);
    if (!response.ok) throw new Error('Failed to fetch filtered transactions');
    return await response.json();
  }

  // Get spending trends
  async fetchSpendingTrends(days: number = 90): Promise<{
    weeklyTrends: { week: string; amount: number }[];
    monthlyTrends: { month: string; amount: number }[];
    categoryTrends: { category: string; trend: 'increasing' | 'decreasing' | 'stable'; changePercent: number }[];
    topMerchants: { name: string; amount: number; frequency: number }[];
  }> {
    const response = await fetch(`${this.baseURL}/transactions/trends?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch spending trends');
    return await response.json();
  }

  // Get budget insights
  async fetchBudgetInsights(): Promise<{
    categorySpending: { category: string; spent: number; avgMonthly: number; recommendation: string }[];
    unusualSpending: { merchant: string; amount: number; date: string; reason: string }[];
    savingsOpportunities: { category: string; potentialSavings: number; suggestion: string }[];
  }> {
    const response = await fetch(`${this.baseURL}/transactions/insights`);
    if (!response.ok) throw new Error('Failed to fetch budget insights');
    return await response.json();
  }

  // Get advanced transaction summary
  async fetchTransactionSummary(
    period: string = 'month',
    compareWithPrevious: boolean = false
  ): Promise<{
    summary: {
      totalIncome: number;
      totalExpenses: number;
      netCashFlow: number;
      transactionCount: number;
      avgTransactionAmount: number;
      topExpenseCategory: string;
      savingsRate: number;
    };
    categoryBreakdown: { category: string; amount: number; percentage: number; transactionCount: number }[];
    comparison?: {
      previousPeriod: any;
      changes: any;
    };
  }> {
    const params = new URLSearchParams({
      period,
      compareWithPrevious: compareWithPrevious.toString()
    });

    const response = await fetch(`${this.baseURL}/transactions/summary?${params}`);
    if (!response.ok) throw new Error('Failed to fetch transaction summary')
    return await response.json();
  }

  // Get category analysis
  async fetchCategoryAnalysis(category: string, days: number = 90): Promise<{
    category: string;
    totalSpent: number;
    transactionCount: number;
    avgPerTransaction: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    topMerchants: { name: string; amount: number; frequency: number }[];
    monthlyBreakdown: { month: string; amount: number }[];
    recommendations: string[];
  }> {
    const response = await fetch(`${this.baseURL}/transactions/categories/${encodeURIComponent(category)}/analysis?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch category analysis')
    return await response.json();
  }

  // Get spending alerts
  async fetchSpendingAlerts(): Promise<{
    budgetAlerts: { category: string; budgetAmount: number; currentSpending: number; percentageUsed: number; severity: string; message: string }[];
    spendingAlerts: { type: string; message: string; amount: number; date: string; severity: string }[];
    recurringPayments: { merchant: string; amount: number; frequency: string; nextExpectedDate: string }[];
  }> {
    const response = await fetch(`${this.baseURL}/transactions/alerts`);
    if (!response.ok) throw new Error('Failed to fetch spending alerts')
    return await response.json();
  }
}

export const apiService = new ApiService()
