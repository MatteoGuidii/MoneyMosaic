import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import { AnalyticsData } from '../types'
import { getPeriodDays } from '../utils'
import { useAppEvent, APP_EVENTS } from '../../../utils/app-events'

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
      
      // Load all analytics data in parallel using available endpoints
      const [spendingData, categoryData] = await Promise.all([
        apiService.fetchSpendingData(days.toString()),
        apiService.fetchCategoryData(days.toString())
      ])

      // Transform category data to match CategoryTrend interface
      const categoryTrends = categoryData.map(cat => ({
        category: cat.category,
        trend: 'stable' as const, // We don't have trend data yet
        changePercent: 0 // We don't have comparison data yet
      }))

      const totalSpending = spendingData.reduce((sum, item) => sum + item.spending, 0)
      const totalIncome = spendingData.reduce((sum, item) => sum + item.income, 0)

      setData({
        trends: {
          categoryTrends,
          topMerchants: [] // We don't have merchant data yet
        },
        insights: {
          savingsOpportunities: [] // We don't have this data yet
        },
        summary: {
          summary: {
            totalIncome,
            totalExpenses: totalSpending,
            netCashFlow: totalIncome - totalSpending,
            savingsRate: totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0,
            topExpenseCategory: categoryData[0]?.category || 'N/A'
          }
        },
        alerts: {
          spendingAlerts: [],
          budgetAlerts: []
        },
        categoryAnalysis: null
      })
    } catch (error) {
      console.error('Error loading analytics data:', error)
      // Set empty data on error
      setData({
        trends: null,
        insights: null,
        summary: null,
        alerts: null,
        categoryAnalysis: null
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCategoryAnalysis = async (category: string) => {
    try {
      // For now, create basic category analysis from available data
      const analysisData = {
        category,
        totalSpent: 0,
        avgPerTransaction: 0,
        topMerchants: [],
        recommendations: [`Consider setting a budget for ${category}`, 'Track spending patterns in this category']
      }
      setData(prev => ({ ...prev, categoryAnalysis: analysisData }))
    } catch (error) {
      console.error('Error loading category analysis:', error)
    }
  }

  // Listen for bank connection changes and refresh data
  useAppEvent(APP_EVENTS.BANK_CONNECTION_CHANGED, () => {
    loadAnalyticsData()
  }, [])

  useAppEvent(APP_EVENTS.DATA_SYNC_COMPLETED, () => {
    loadAnalyticsData()
  }, [])

  return {
    loading,
    data,
    loadCategoryAnalysis
  }
}
