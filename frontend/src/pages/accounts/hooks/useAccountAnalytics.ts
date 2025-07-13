import { useMemo } from 'react'
import { Account } from '../../../services/types'
import { UseAccountAnalyticsReturn } from '../types'
import { 
  calculateAccountBalances, 
  generateAccountTrendsData, 
  generateAccountDistributionData,
  calculateAccountStats 
} from '../utils'
import { generateAccountInsights } from '../../../components/widgets/AccountInsightsWidget'

export const useAccountAnalytics = (
  filteredAccounts: Account[]
): UseAccountAnalyticsReturn => {
  const analytics = useMemo(() => {
    const balances = calculateAccountBalances(filteredAccounts)
    const trendsData = generateAccountTrendsData(balances, filteredAccounts.length)
    const distributionData = generateAccountDistributionData(filteredAccounts, balances.totalBalance)
    const statsData = calculateAccountStats(filteredAccounts, balances.totalBalance)

    return { 
      balances,
      trendsData,
      distributionData,
      statsData
    }
  }, [filteredAccounts])

  const insights = useMemo(() => {
    return generateAccountInsights(filteredAccounts, analytics.balances)
  }, [filteredAccounts, analytics.balances])

  const accountTypes = useMemo(() => {
    return [...new Set(filteredAccounts.map(acc => acc.type))]
  }, [filteredAccounts])

  return {
    analytics,
    insights,
    accountTypes
  }
}
