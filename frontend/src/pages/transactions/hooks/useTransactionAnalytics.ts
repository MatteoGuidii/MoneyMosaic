import { useMemo, useState, useEffect } from 'react'
import { calculateAnalyticsData } from '../utils'
import { generateTransactionInsights } from '../../../components/widgets/InsightsWidget'
import { TransactionFilters, UseTransactionAnalyticsReturn } from '../types'
import { apiService } from '../../../services/apiService'

export const useTransactionAnalytics = (
  transactions: any[],
  previousPeriodTransactions: any[],
  filters: TransactionFilters
): UseTransactionAnalyticsReturn => {
  const [allTransactions, setAllTransactions] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await apiService.fetchTransactions(
          filters.dateRange !== 'custom' ? filters.dateRange : undefined,
          filters.categories.length > 0 ? filters.categories : undefined,
          filters.searchTerm || undefined,
          1,
          filters.customDateRange.start,
          filters.accounts.length > 0 ? filters.accounts : undefined,
          filters.amountRange.min > 0 ? filters.amountRange.min : undefined,
          filters.amountRange.max < 10000 ? filters.amountRange.max : undefined,
          'date',
          'desc',
          1000,
          filters.customDateRange.end
        )
        setAllTransactions(resp.transactions)
      } catch {
        setAllTransactions(transactions)
      }
    }
    load()
  }, [filters, transactions])

  const source = allTransactions.length > 0 ? allTransactions : transactions

  const analyticsData = useMemo(() => {
    return calculateAnalyticsData(source, filters)
  }, [source, filters])

  const insights = useMemo(() => {
    return generateTransactionInsights(source, previousPeriodTransactions)
  }, [source, previousPeriodTransactions])

  return {
    analyticsData,
    insights
  }
};
