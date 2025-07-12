import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import { TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Lightbulb } from 'lucide-react'
import { Link } from 'react-router-dom'

interface InsightPreviewProps {
  className?: string
}

const InsightPreview: React.FC<InsightPreviewProps> = ({ className = '' }) => {
  const [insights, setInsights] = useState<any>(null)
  const [alerts, setAlerts] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      const [insightsData, alertsData] = await Promise.all([
        apiService.fetchBudgetInsights(),
        apiService.fetchSpendingAlerts()
      ])
      setInsights(insightsData)
      setAlerts(alertsData)
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          💡 Smart Insights
        </h2>
        <Link 
          to="/analytics" 
          className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="space-y-4">
        {/* Spending Alerts */}
        {alerts && alerts.spendingAlerts.length > 0 && (
          <div className="space-y-3">
            {alerts.spendingAlerts.slice(0, 2).map((alert: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs opacity-75 mt-1">{alert.date}</p>
                  </div>
                  <span className="font-bold text-sm">{formatCurrency(alert.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top Savings Opportunity */}
        {insights && insights.savingsOpportunities.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100 text-sm">
                  {insights.savingsOpportunities[0].category} Savings Opportunity
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {insights.savingsOpportunities[0].suggestion}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 dark:text-green-400 text-sm">
                  {formatCurrency(insights.savingsOpportunities[0].potentialSavings)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  potential savings
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category Spending Insights */}
        {insights && insights.categorySpending.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recent Category Trends
            </h3>
            {insights.categorySpending.slice(0, 3).map((category: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {category.spent > category.avgMonthly * 1.2 ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : category.spent < category.avgMonthly * 0.8 ? (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.category}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(category.spent)} this month
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.spent > category.avgMonthly * 1.2 ? '+' : ''}
                    {(((category.spent - category.avgMonthly) / category.avgMonthly) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    vs avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No data state */}
        {(!insights || insights.categorySpending.length === 0) && 
         (!alerts || alerts.spendingAlerts.length === 0) && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Connect your accounts to see personalized insights
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InsightPreview
