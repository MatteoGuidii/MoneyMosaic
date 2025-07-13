import React from 'react'
import { TrendingUp, Building2 } from 'lucide-react'
import AccountTrendsChart from '../../../components/charts/AccountTrendsChart'
import AccountDistributionChart from '../../../components/charts/AccountDistributionChart'
import { AccountAnalytics } from '../types'

interface AccountsChartsProps {
  analytics: AccountAnalytics
}

const AccountsCharts: React.FC<AccountsChartsProps> = ({
  analytics
}) => {
  const { trendsData, distributionData } = analytics

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Account Balance Trends */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Balance Trends
          </h3>
        </div>
        <AccountTrendsChart data={trendsData} />
      </div>

      {/* Account Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Distribution
          </h3>
        </div>
        {distributionData.length > 0 ? (
          <AccountDistributionChart data={distributionData} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            No account data available
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountsCharts
