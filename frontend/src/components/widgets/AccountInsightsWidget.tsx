import React from 'react'
import { TrendingUp, AlertTriangle, CheckCircle, CreditCard, Shield, Percent } from 'lucide-react'

interface AccountInsight {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  description: string
  icon: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

interface AccountInsightsWidgetProps {
  insights: AccountInsight[]
}

export const generateAccountInsights = (accounts: any[], balances: any): AccountInsight[] => {
  const insights: AccountInsight[] = []

  // Check for accounts that haven't been updated recently
  const staleAccounts = accounts.filter(account => {
    const lastUpdate = new Date(account.lastUpdated)
    const now = new Date()
    const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
    return diffInHours > 72
  })

  if (staleAccounts.length > 0) {
    insights.push({
      id: 'stale-accounts',
      type: 'warning',
      title: 'Accounts Need Sync',
      description: `${staleAccounts.length} account${staleAccounts.length > 1 ? 's' : ''} haven't been updated in over 3 days. Consider refreshing your connection.`,
      icon: <AlertTriangle className="w-5 h-5" />,
      action: {
        label: 'Sync Accounts',
        onClick: () => console.log('Sync accounts')
      }
    })
  }

  // Check for high credit utilization
  const creditAccounts = accounts.filter(acc => acc.type.toLowerCase() === 'credit')
  const highUtilizationAccounts = creditAccounts.filter(acc => {
    const utilization = Math.abs(acc.balance) / (acc.credit_limit || 1000)
    return utilization > 0.8
  })

  if (highUtilizationAccounts.length > 0) {
    insights.push({
      id: 'high-credit-utilization',
      type: 'error',
      title: 'High Credit Utilization',
      description: `${highUtilizationAccounts.length} credit account${highUtilizationAccounts.length > 1 ? 's' : ''} ${highUtilizationAccounts.length > 1 ? 'have' : 'has'} utilization above 80%. Consider paying down balances.`,
      icon: <CreditCard className="w-5 h-5" />
    })
  }

  // Check for positive net worth growth
  if (balances.totalBalance > 0) {
    insights.push({
      id: 'positive-net-worth',
      type: 'success',
      title: 'Positive Net Worth',
      description: `Your total account balance is ${new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(balances.totalBalance)}. Great job managing your finances!`,
      icon: <TrendingUp className="w-5 h-5" />
    })
  }

  // Check for emergency fund adequacy
  const monthlyExpenseEstimate = 3000 // This would be calculated from transaction data
  const emergencyFundTarget = monthlyExpenseEstimate * 6
  if (balances.savingsBalance < emergencyFundTarget) {
    insights.push({
      id: 'emergency-fund',
      type: 'info',
      title: 'Build Emergency Fund',
      description: `Consider increasing your savings to reach the recommended 6-month emergency fund target of ${new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(emergencyFundTarget)}.`,
      icon: <Shield className="w-5 h-5" />
    })
  }

  // Account diversification insight
  const accountTypes = new Set(accounts.map(acc => acc.type))
  if (accountTypes.size === 1 && accounts.length > 1) {
    insights.push({
      id: 'diversification',
      type: 'info',
      title: 'Consider Account Diversification',
      description: 'All your accounts are the same type. Consider diversifying with different account types for better financial management.',
      icon: <Percent className="w-5 h-5" />
    })
  }

  return insights
}

const AccountInsightsWidget: React.FC<AccountInsightsWidgetProps> = ({ insights }) => {
  const getInsightStyles = (type: AccountInsight['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
    }
  }

  if (insights.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Insights
          </h3>
        </div>
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            All your accounts look healthy! Keep up the great financial management.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Account Insights
        </h3>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border ${getInsightStyles(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium mb-1">
                  {insight.title}
                </h4>
                <p className="text-sm opacity-90">
                  {insight.description}
                </p>
                {insight.action && (
                  <button
                    onClick={insight.action.onClick}
                    className="mt-2 text-xs font-medium underline hover:no-underline"
                  >
                    {insight.action.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AccountInsightsWidget
