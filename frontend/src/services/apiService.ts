// Re-export all types for backward compatibility
export * from './types'

// Re-export all services
export * from './api'

// Import all services
import { transactionService } from './api/transaction-service'
import { accountService } from './api/account-service'
import { investmentService } from './api/investment-service'
import { dashboardService } from './api/dashboard-service'
import { bankService } from './api/bank-service'

// Main ApiService class for backward compatibility
class ApiService {
  // Dashboard methods
  async fetchOverviewData() {
    return dashboardService.fetchOverviewData()
  }

  async fetchEarningsData() {
    return dashboardService.fetchEarningsData()
  }

  async fetchBudgetData(month?: string, year?: number) {
    return dashboardService.fetchBudgetData(month, year)
  }

  async updateBudget(budgetData: Array<{ category: string; amount: number }>) {
    return dashboardService.updateBudget(budgetData)
  }

  async fetchSavingsGoals() {
    return dashboardService.fetchSavingsGoals()
  }

  async createSavingsGoal(goal: any) {
    return dashboardService.createSavingsGoal(goal)
  }

  async updateSavingsGoal(id: string, updates: any) {
    return dashboardService.updateSavingsGoal(id, updates)
  }

  async deleteSavingsGoal(id: string) {
    return dashboardService.deleteSavingsGoal(id)
  }

  async fetchCashFlowForecast() {
    return dashboardService.fetchCashFlowForecast()
  }

  async fetchAlerts() {
    return dashboardService.fetchAlerts()
  }

  async markAlertAsRead(alertId: string) {
    return dashboardService.markAlertAsRead(alertId)
  }

  async dismissAlert(alertId: string) {
    return dashboardService.dismissAlert(alertId)
  }

  // Transaction methods
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
  ): Promise<{ transactions: any[]; total: number }> {
    let finalStartDate = startDate
    let finalEndDate = endDate

    if (!startDate && !endDate && dateRange) {
      const days = parseInt(dateRange)
      if (!isNaN(days)) {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - days)
        finalStartDate = start.toISOString().split('T')[0]
        finalEndDate = end.toISOString().split('T')[0]
      }
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(categories && categories.length > 0 && { categories: categories.join(',') }),
      ...(accounts && accounts.length > 0 && { accounts: accounts.join(',') }),
      ...(finalStartDate && { startDate: finalStartDate }),
      ...(finalEndDate && { endDate: finalEndDate }),
      ...(minAmount !== undefined && { minAmount: minAmount.toString() }),
      ...(maxAmount !== undefined && { maxAmount: maxAmount.toString() }),
      ...(sortField && { sortField }),
      ...(sortDirection && { sortDirection })
    })
    
    const response = await fetch(`/api/transactions?${params}`)
    if (!response.ok) throw new Error('Failed to fetch transactions')
    return await response.json()
  }

  async fetchTransactionsSimple(
    limit: number = 50,
    offset: number = 0,
    category?: string,
    dateRange?: string,
    accountId?: string
  ) {
    return transactionService.fetchTransactions(limit, offset, category, dateRange, accountId)
  }

  async fetchFilteredTransactions(filters: any) {
    return transactionService.fetchFilteredTransactions(filters)
  }

  async fetchCategories() {
    return transactionService.fetchCategories()
  }

  async fetchSpendingData(dateRange: string) {
    return transactionService.fetchSpendingData(dateRange)
  }

  async fetchCategoryData(dateRange: string) {
    return transactionService.fetchCategoryData(dateRange)
  }

  async fetchTopMerchants(dateRange: string) {
    return transactionService.fetchTopMerchants(dateRange)
  }

  async fetchSpendingTrends(days: number = 90) {
    return transactionService.fetchSpendingTrends(days)
  }

  async syncTransactions() {
    return transactionService.syncTransactions()
  }

  // Account methods
  async fetchAccounts() {
    return accountService.fetchAccounts()
  }

  async fetchNetWorthData(dateRange: string) {
    return accountService.fetchNetWorthData(dateRange)
  }

  async updateAccountNickname(accountId: string, nickname: string) {
    return accountService.updateAccountNickname(accountId, nickname)
  }

  async toggleAccountVisibility(accountId: string, isVisible: boolean) {
    return accountService.toggleAccountVisibility(accountId, isVisible)
  }

  async deleteAccount(accountId: string) {
    return accountService.deleteAccount(accountId)
  }

  // Investment methods
  async fetchInvestments() {
    return investmentService.fetchInvestments()
  }

  async fetchInvestmentAccounts() {
    return investmentService.fetchInvestmentAccounts()
  }

  async fetchInvestmentSummary() {
    return investmentService.fetchInvestmentSummary()
  }

  async fetchInvestmentTransactions(filters: any) {
    return investmentService.fetchInvestmentTransactions(filters)
  }

  async fetchInvestmentData() {
    return investmentService.fetchInvestmentData()
  }

  async syncInvestments() {
    return investmentService.syncInvestments()
  }

  // Bank methods
  async fetchBankConnections() {
    return bankService.fetchBankConnections()
  }

  async checkBankHealth() {
    return bankService.checkBankHealth()
  }

  async removeBankConnection(bankId: number) {
    return bankService.removeBankConnection(bankId)
  }

  async createLinkToken() {
    return bankService.createLinkToken()
  }

  async exchangePublicToken(publicToken: string, institution: any) {
    return bankService.exchangePublicToken(publicToken, institution)
  }

  async syncAllBanks() {
    return bankService.syncAllBanks()
  }

  // Sync methods for data refresh
  async syncAllData(): Promise<{ success: boolean; message: string; transactionCount?: number }> {
    const response = await fetch('/api/transactions/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ days: 30 })
    })
    if (!response.ok) throw new Error('Failed to sync data')
    return await response.json()
  }

  async getSyncStatus(): Promise<{ lastSync: string; isHealthy: boolean; nextAutoSync: string }> {
    const response = await fetch('/api/sync/status')
    if (!response.ok) throw new Error('Failed to get sync status')
    return await response.json()
  }

  // Budget methods
  async createOrUpdateBudget(category: string, amount: number, month?: string, year?: number): Promise<void> {
    const response = await fetch('/api/budget', {
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
    
    const response = await fetch(`/api/budget/${category}?${params}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete budget')
  }

  // Analytics methods
  async fetchBudgetInsights(): Promise<any> {
    const response = await fetch('/api/insights/budget')
    if (!response.ok) throw new Error('Failed to fetch budget insights')
    return await response.json()
  }

  async fetchSpendingAlerts(): Promise<any> {
    const response = await fetch('/api/alerts/spending')
    if (!response.ok) throw new Error('Failed to fetch spending alerts')
    return await response.json()
  }

  async fetchTransactionSummary(period: string, includeInsights: boolean = false): Promise<any> {
    const params = new URLSearchParams({ period, includeInsights: includeInsights.toString() })
    const response = await fetch(`/api/transactions/summary?${params}`)
    if (!response.ok) throw new Error('Failed to fetch transaction summary')
    return await response.json()
  }

  async fetchCategoryAnalysis(category: string, days: number): Promise<any> {
    const params = new URLSearchParams({ category, days: days.toString() })
    const response = await fetch(`/api/categories/analysis?${params}`)
    if (!response.ok) throw new Error('Failed to fetch category analysis')
    return await response.json()
  }
}

export const apiService = new ApiService()

// Export individual services for direct use
export { 
  transactionService, 
  accountService, 
  investmentService, 
  dashboardService, 
  bankService 
}
