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
    // Use the main transactions endpoint with filters as query parameters
    return httpClient.get('/api/transactions', filters)
  }

  async fetchCategories(): Promise<string[]> {
    // Extract categories from transactions data
    const response = await httpClient.get<{ categories: string[] }>('/api/transactions/summary')
    return response.categories || []
  }

  async fetchSpendingData(dateRange: string): Promise<SpendingData[]> {
    return httpClient.get<SpendingData[]>('/api/dashboard/spending-data', { dateRange })
  }

  async fetchCategoryData(dateRange: string): Promise<CategoryData[]> {
    return httpClient.get<CategoryData[]>('/api/dashboard/spending-by-category', { dateRange })
  }

  async fetchTopMerchants(dateRange: string): Promise<MerchantData[]> {
    return httpClient.get<MerchantData[]>('/api/dashboard/top-merchants', { dateRange })
  }

  async fetchSpendingTrends(days: number = 90): Promise<{
    daily: Array<{ date: string; amount: number }>
    weekly: Array<{ week: string; amount: number }>
    monthly: Array<{ month: string; amount: number }>
    categoryTrends: Array<{ category: string; trend: number; amount: number }>
  }> {
    return httpClient.get('/api/dashboard/spending-trends', { days })
  }

  async syncTransactions(): Promise<{ success: boolean; message?: string }> {
    return httpClient.post('/api/transactions/sync')
  }
}

export const transactionService = new TransactionService()
