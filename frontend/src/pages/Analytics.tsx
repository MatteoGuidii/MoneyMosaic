import React, { useState, useEffect } from 'react'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { apiService } from '../services/apiService'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Target, 
  BarChart3,
  Store,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Data states
  const [trends, setTrends] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [categoryAnalysis, setCategoryAnalysis] = useState<any>(null)
  const [alerts, setAlerts] = useState<any>(null)

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedPeriod])

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryAnalysis(selectedCategory)
    }
  }, [selectedCategory])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Load all analytics data in parallel
      const [trendsData, insightsData, summaryData, alertsData] = await Promise.all([
        apiService.fetchSpendingTrends(selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90),
        apiService.fetchBudgetInsights(),
        apiService.fetchTransactionSummary(selectedPeriod, true),
        apiService.fetchSpendingAlerts()
      ])

      setTrends(trendsData)
      setInsights(insightsData)
      setSummary(summaryData)
      setAlerts(alertsData)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategoryAnalysis = async (category: string) => {
    try {
      const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90
      const analysisData = await apiService.fetchCategoryAnalysis(category, days)
      setCategoryAnalysis(analysisData)
    } catch (error) {
      console.error('Error loading category analysis:', error)
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

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />
    }
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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Financial Analytics
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Advanced insights into your spending patterns and financial health
        </p>
        
        {/* Period Selector */}
        <div className="mt-4 flex space-x-2">
          {['week', 'month', 'quarter'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.summary.totalIncome)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            {summary.comparison && (
              <div className="mt-2 flex items-center text-sm">
                {summary.comparison.changes.totalIncome.percentage > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={summary.comparison.changes.totalIncome.percentage > 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercentage(summary.comparison.changes.totalIncome.percentage)}
                </span>
                <span className="text-gray-500 ml-1">vs last {selectedPeriod}</span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.summary.totalExpenses)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
            {summary.comparison && (
              <div className="mt-2 flex items-center text-sm">
                {summary.comparison.changes.totalExpenses.percentage > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={summary.comparison.changes.totalExpenses.percentage > 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatPercentage(summary.comparison.changes.totalExpenses.percentage)}
                </span>
                <span className="text-gray-500 ml-1">vs last {selectedPeriod}</span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Cash Flow</p>
                <p className={`text-2xl font-bold ${summary.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.summary.netCashFlow)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            {summary.comparison && (
              <div className="mt-2 flex items-center text-sm">
                {summary.comparison.changes.netCashFlow.percentage > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={summary.comparison.changes.netCashFlow.percentage > 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercentage(summary.comparison.changes.netCashFlow.percentage)}
                </span>
                <span className="text-gray-500 ml-1">vs last {selectedPeriod}</span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</p>
                <p className={`text-2xl font-bold ${summary.summary.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.summary.savingsRate.toFixed(1)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Top category: {summary.summary.topExpenseCategory}
            </div>
          </div>
        </div>
      )}

      {/* Spending Alerts */}
      {alerts && (alerts.spendingAlerts.length > 0 || alerts.budgetAlerts.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Spending Alerts
            </h2>
          </div>
          <div className="space-y-3">
            {alerts.spendingAlerts.map((alert: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm opacity-75">{alert.date}</p>
                  </div>
                  <span className="font-bold">{formatCurrency(alert.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Trends */}
      {trends && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Category Trends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.categoryTrends.map((trend: any, index: number) => (
              <div 
                key={index} 
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(trend.category)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {trend.category}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatPercentage(trend.changePercent)} change
                    </p>
                  </div>
                  {getTrendIcon(trend.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Merchants */}
      {trends && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <Store className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Top Merchants
            </h2>
          </div>
          <div className="space-y-3">
            {trends.topMerchants.slice(0, 5).map((merchant: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{merchant.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {merchant.frequency} transactions
                  </p>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(merchant.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savings Opportunities */}
      {insights && insights.savingsOpportunities.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Savings Opportunities
            </h2>
          </div>
          <div className="space-y-4">
            {insights.savingsOpportunities.map((opportunity: any, index: number) => (
              <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {opportunity.category}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {opportunity.suggestion}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(opportunity.potentialSavings)}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      potential savings
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Analysis Modal */}
      {selectedCategory && categoryAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {categoryAnalysis.category} Analysis
              </h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(categoryAnalysis.totalSpent)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg per Transaction</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(categoryAnalysis.avgPerTransaction)}
                  </p>
                </div>
              </div>

              {/* Top Merchants */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Top Merchants</h3>
                <div className="space-y-2">
                  {categoryAnalysis.topMerchants.map((merchant: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-900 dark:text-white">{merchant.name}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(merchant.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {categoryAnalysis.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics
