import { httpClient } from './http-client'
import { Transaction, SpendingData, CategoryData, MerchantData } from '../types'

export class TransactionService {
  async fetchTransactions(
    limit: number = 50,
    offset: number = 0,
    category?: string,
    dateRange?: string,
    accountId?: string
  ): Promise<Transaction[]> {
    const params = { limit, offset, category, dateRange, accountId }
    return httpClient.get<Transaction[]>('/api/transactions', params)
  }

  async fetchFilteredTransactions(filters: {
    startDate?: string
    endDate?: string
    category?: string
    accountId?: string
    minAmount?: number
    maxAmount?: number
    searchTerm?: string
    limit?: number
    offset?: number
  }): Promise<{
    transactions: Transaction[]
    totalCount: number
    hasMore: boolean
  }> {
    return httpClient.get('/api/transactions/filtered', filters)
  }

  async fetchCategories(): Promise<string[]> {
    return httpClient.get<string[]>('/api/categories')
  }

  async fetchSpendingData(dateRange: string): Promise<SpendingData[]> {
    return httpClient.get<SpendingData[]>('/api/spending', { dateRange })
  }

  async fetchCategoryData(dateRange: string): Promise<CategoryData[]> {
    return httpClient.get<CategoryData[]>('/api/categories/spending', { dateRange })
  }

  async fetchTopMerchants(dateRange: string): Promise<MerchantData[]> {
    return httpClient.get<MerchantData[]>('/api/merchants/top', { dateRange })
  }

  async fetchSpendingTrends(days: number = 90): Promise<{
    daily: Array<{ date: string; amount: number }>
    weekly: Array<{ week: string; amount: number }>
    monthly: Array<{ month: string; amount: number }>
    categoryTrends: Array<{ category: string; trend: number; amount: number }>
  }> {
    return httpClient.get('/api/spending/trends', { days })
  }

  async syncTransactions(): Promise<{ success: boolean; message?: string }> {
    return httpClient.post('/api/transactions/sync')
  }
}

export const transactionService = new TransactionService()
