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
