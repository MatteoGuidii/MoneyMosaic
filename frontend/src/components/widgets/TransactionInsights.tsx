import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle } from 'lucide-react'

interface TransactionInsight {
  id: string
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  title: string
  description: string
  value?: string
  icon: React.ReactNode
}

interface TransactionInsightsProps {
  insights: TransactionInsight[]
}

const TransactionInsights: React.FC<TransactionInsightsProps> = ({ insights }) => {
  const getInsightStyles = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'negative':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-600 dark:text-green-400'
      case 'negative':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  }

  const getTextColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-800 dark:text-green-200'
      case 'negative':
        return 'text-red-800 dark:text-red-200'
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200'
      default:
        return 'text-blue-800 dark:text-blue-200'
    }
  }

  if (insights.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Financial Insights
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No insights available for the current period
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Financial Insights
      </h3>
      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border ${getInsightStyles(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${getIconColor(insight.type)}`}>
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${getTextColor(insight.type)}`}>
                    {insight.title}
                  </h4>
                  {insight.value && (
                    <span className={`text-sm font-semibold ${getTextColor(insight.type)}`}>
                      {insight.value}
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-1 ${getTextColor(insight.type)} opacity-80`}>
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper function to generate insights based on transaction data
export const generateTransactionInsights = (
  transactions: any[],
  previousPeriodTransactions: any[] = []
): TransactionInsight[] => {
  const insights: TransactionInsight[] = []

  if (transactions.length === 0) return insights

  // Calculate current period stats
  const totalSpending = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const avgTransactionAmount = totalSpending / transactions.filter(t => t.amount > 0).length

  // Calculate previous period stats for comparison
  const prevTotalSpending = previousPeriodTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  
  // Spending trend insight
  if (previousPeriodTransactions.length > 0) {
    const spendingChange = ((totalSpending - prevTotalSpending) / prevTotalSpending) * 100
    if (Math.abs(spendingChange) > 10) {
      insights.push({
        id: 'spending-trend',
        type: spendingChange > 0 ? 'warning' : 'positive',
        title: spendingChange > 0 ? 'Increased Spending' : 'Reduced Spending',
        description: `Your spending has ${spendingChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(spendingChange).toFixed(1)}% compared to the previous period.`,
        value: `${spendingChange > 0 ? '+' : '-'}${Math.abs(spendingChange).toFixed(1)}%`,
        icon: spendingChange > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />
      })
    }
  }

  // High-value transaction insight
  const highValueTransactions = transactions.filter(t => t.amount > avgTransactionAmount * 3)
  if (highValueTransactions.length > 0) {
    insights.push({
      id: 'high-value-transactions',
      type: 'warning',
      title: 'Large Transactions Detected',
      description: `You have ${highValueTransactions.length} unusually large transaction(s) in this period.`,
      value: `${highValueTransactions.length} transactions`,
      icon: <AlertTriangle className="w-5 h-5" />
    })
  }

  // Top spending category
  const categoryTotals = transactions.reduce((acc, t) => {
    if (t.amount > 0) {
      acc[t.category] = (acc[t.category] || 0) + t.amount
    }
    return acc
  }, {} as Record<string, number>)

  const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => (b as number) - (a as number))[0]
  if (topCategory) {
    const percentage = ((topCategory[1] as number) / totalSpending) * 100
    insights.push({
      id: 'top-category',
      type: percentage > 40 ? 'warning' : 'neutral',
      title: 'Top Spending Category',
      description: `${topCategory[0]} accounts for ${percentage.toFixed(1)}% of your spending this period.`,
      value: `${percentage.toFixed(1)}%`,
      icon: <Target className="w-5 h-5" />
    })
  }

  // Cash flow insight
  const netFlow = totalIncome - totalSpending
  insights.push({
    id: 'cash-flow',
    type: netFlow >= 0 ? 'positive' : 'negative',
    title: netFlow >= 0 ? 'Positive Cash Flow' : 'Negative Cash Flow',
    description: `Your net cash flow is ${netFlow >= 0 ? 'positive' : 'negative'} for this period.`,
    value: new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(Math.abs(netFlow)),
    icon: <DollarSign className="w-5 h-5" />
  })

  return insights
}

export default TransactionInsights
