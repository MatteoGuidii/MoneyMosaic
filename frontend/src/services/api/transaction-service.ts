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
    return httpClient.get<string[]>('/api/categories')
  }

  async fetchSpendingData(dateRange: string): Promise<SpendingData[]> {
    return httpClient.get<SpendingData[]>('/api/spending-data', { dateRange })
  }

  async fetchCategoryData(dateRange: string): Promise<CategoryData[]> {
    return httpClient.get<CategoryData[]>('/api/category-data', { dateRange })
  }

  async fetchTopMerchants(_dateRange: string): Promise<MerchantData[]> {
    // Note: This endpoint doesn't exist on backend yet, returning empty array
    return Promise.resolve([])
    // return httpClient.get<MerchantData[]>('/api/merchants/top', { dateRange })
  }

  async fetchSpendingTrends(_days: number = 90): Promise<{
    daily: Array<{ date: string; amount: number }>
    weekly: Array<{ week: string; amount: number }>
    monthly: Array<{ month: string; amount: number }>
    categoryTrends: Array<{ category: string; trend: number; amount: number }>
  }> {
    // Note: This endpoint doesn't exist on backend yet, returning empty structure
    return Promise.resolve({
      daily: [],
      weekly: [],
      monthly: [],
      categoryTrends: []
    })
    // return httpClient.get('/api/spending/trends', { days })
  }

  async syncTransactions(): Promise<{ success: boolean; message?: string }> {
    return httpClient.post('/api/transactions/sync')
  }
}

export const transactionService = new TransactionService()
