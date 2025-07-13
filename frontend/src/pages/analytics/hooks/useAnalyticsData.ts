import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import { AnalyticsData } from '../types'
import { getPeriodDays } from '../utils'

export const useAnalyticsData = (selectedPeriod: string) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData>({
    trends: null,
    insights: null,
    summary: null,
    alerts: null,
    categoryAnalysis: null
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedPeriod])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const days = getPeriodDays(selectedPeriod)
      
      // Load all analytics data in parallel
      const [trendsData, insightsData, summaryData, alertsData] = await Promise.all([
        apiService.fetchSpendingTrends(days),
        apiService.fetchBudgetInsights(),
        apiService.fetchTransactionSummary(selectedPeriod, true),
        apiService.fetchSpendingAlerts()
      ])

      setData({
        trends: trendsData as any, // Use any for now to handle API response structure
        insights: insightsData as any,
        summary: summaryData as any,
        alerts: alertsData as any,
        categoryAnalysis: null
      })
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategoryAnalysis = async (category: string) => {
    try {
      const days = getPeriodDays(selectedPeriod)
      const analysisData = await apiService.fetchCategoryAnalysis(category, days)
      setData(prev => ({ ...prev, categoryAnalysis: analysisData as any }))
    } catch (error) {
      console.error('Error loading category analysis:', error)
    }
  }

  return {
    loading,
    data,
    loadCategoryAnalysis
  }
}
