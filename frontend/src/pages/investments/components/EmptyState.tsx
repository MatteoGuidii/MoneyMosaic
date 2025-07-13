import React from 'react'
import { Target, Wallet } from 'lucide-react'
import { PortfolioSummary } from '../types/investment-types'
import { formatCurrency } from '../utils/investment-utils'

interface EmptyStateProps {
  investmentAccounts: any
  portfolioSummary: PortfolioSummary
}

const EmptyState: React.FC<EmptyStateProps> = ({ investmentAccounts, portfolioSummary }) => {
  if (investmentAccounts?.hasInvestmentAccounts && !investmentAccounts?.supportsDetailedData) {
    return (
      <div className="space-y-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Total Portfolio Value</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(portfolioSummary.totalValue)}
                </p>
              </div>
              <div className="ml-2 flex-shrink-0">
                <Wallet className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Investment Accounts</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {investmentAccounts?.accounts?.length || 0}
                </p>
              </div>
              <div className="ml-2 flex-shrink-0">
                <Wallet className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Investment Accounts Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Investment Accounts</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Account balances are available, but detailed holdings data is not supported by your institution.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Institution
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {investmentAccounts?.accounts?.map((account: any, index: number) => (
                  <tr key={`${account.accountId}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {account.accountName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {account.accountType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(account.balance)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {account.institutionName}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Information Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Limited Investment Data Available
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Your institution has investment accounts but doesn't support detailed holdings data through the API. 
                  You can see account balances, but detailed holdings, performance metrics, and sector allocation are not available.
                </p>
                <p className="mt-2">
                  For full investment features in sandbox mode, try connecting to TD Bank (ins_109508), Wells Fargo (ins_109509), 
                  or Bank of America (ins_109510) with the "investments" product enabled.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
      <div className="max-w-md mx-auto">
        <Wallet className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No Investment Data Available
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Connect a bank account with investment holdings to see your portfolio performance and analytics.
        </p>
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3 text-left">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Sandbox Mode Tips
              </h4>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                To test investment features, connect to TD Bank (ins_109508), Wells Fargo (ins_109509), 
                or Bank of America (ins_109510) with the "investments" product enabled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyState
