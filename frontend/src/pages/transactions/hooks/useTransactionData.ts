import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/apiService'
import { TransactionFilters, TransactionPagination, TransactionSorting, UseTransactionDataReturn } from '../types'

export const useTransactionData = (
  filters: TransactionFilters,
  pagination: TransactionPagination,
  sorting: TransactionSorting
): UseTransactionDataReturn => {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [accounts, setAccounts] = useState<string[]>([])
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [previousPeriodTransactions, setPreviousPeriodTransactions] = useState<any[]>([])

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      const categoriesData = await apiService.fetchCategories()
      setCategories(categoriesData)
      
      // Load accounts
      try {
        const accountsData = await apiService.fetchAccounts()
        setAccounts(accountsData.map((acc: any) => acc.name || acc.id))
      } catch (error) {
        console.log('Accounts endpoint not available')
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTransactions = useCallback(async () => {
    try {
      // Determine date parameters based on filter type
      let dateRange: string | undefined = filters.dateRange;
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      if (filters.dateRange === 'custom' && filters.customDateRange.start && filters.customDateRange.end) {
        startDate = filters.customDateRange.start;
        endDate = filters.customDateRange.end;
        dateRange = undefined; // Don't use range when we have custom dates
      }
      
      const transactionsResponse = await apiService.fetchTransactions(
        dateRange,
        filters.categories.length > 0 ? filters.categories : undefined,
        filters.searchTerm || undefined,
        pagination.currentPage,
        startDate,
        filters.accounts.length > 0 ? filters.accounts : undefined,
        filters.amountRange.min > 0 ? filters.amountRange.min : undefined,
        filters.amountRange.max < 10000 ? filters.amountRange.max : undefined,
        sorting.field,
        sorting.direction,
        1000, // Default to 1000 for open source usage
        endDate
      )
      setTransactions(transactionsResponse.transactions)
      setTotalTransactions(transactionsResponse.total)

      // Load previous period for comparison
      try {
        let prevStartDate: string;
        if (filters.dateRange === 'custom' && filters.customDateRange.start && filters.customDateRange.end) {
          // For custom ranges, calculate a previous period of the same length
          const start = new Date(filters.customDateRange.start);
          const end = new Date(filters.customDateRange.end);
          const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          const prevEnd = new Date(start);
          prevEnd.setDate(prevEnd.getDate() - 1);
          const prevStart = new Date(prevEnd);
          prevStart.setDate(prevStart.getDate() - daysDiff);
          prevStartDate = prevStart.toISOString().split('T')[0];
        } else {
          prevStartDate = new Date(Date.now() - parseInt(filters.dateRange) * 24 * 60 * 60 * 1000 * 2).toISOString().split('T')[0];
        }
        
        const prevPeriodResponse = await apiService.fetchTransactions(
          filters.dateRange !== 'custom' ? filters.dateRange : undefined,
          filters.categories.length > 0 ? filters.categories : undefined,
          filters.searchTerm || undefined,
          1,
          prevStartDate
        )
        setPreviousPeriodTransactions(prevPeriodResponse.transactions)
      } catch (error) {
        console.log('Could not load previous period data')
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }, [filters, pagination.currentPage, sorting])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  return {
    transactions,
    loading,
    categories,
    accounts,
    totalTransactions,
    previousPeriodTransactions,
    loadInitialData,
    loadTransactions
  }
};
