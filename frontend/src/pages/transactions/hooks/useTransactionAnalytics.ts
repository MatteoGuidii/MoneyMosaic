import { useMemo } from 'react'
import { calculateAnalyticsData } from '../utils'
import { generateTransactionInsights } from '../../../components/widgets/InsightsWidget'
import { TransactionFilters, UseTransactionAnalyticsReturn } from '../types'

export const useTransactionAnalytics = (
  transactions: any[],
  previousPeriodTransactions: any[],
  filters: TransactionFilters
): UseTransactionAnalyticsReturn => {
  const analyticsData = useMemo(() => {
    return calculateAnalyticsData(transactions, filters)
  }, [transactions, filters])

  const insights = useMemo(() => {
    return generateTransactionInsights(transactions, previousPeriodTransactions)
  }, [transactions, previousPeriodTransactions])

  return {
    analyticsData,
    insights
  }
};
