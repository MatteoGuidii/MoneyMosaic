import React, { useState } from 'react'
import { Building2, Wallet, TrendingUp, CreditCard, CheckCircle, AlertCircle, Clock, MoreHorizontal, RefreshCw, Eye, Trash2 } from 'lucide-react'
import { Account } from '../services/apiService'

interface AccountsDataTableProps {
  accounts: Account[]
  onAccountSelect?: (account: Account) => void
  onSyncAccount?: (accountId: string) => void
  onViewTransactions?: (accountId: string) => void
  onDeleteAccount?: (accountId: string) => void
}

const AccountsDataTable: React.FC<AccountsDataTableProps> = ({
  accounts,
  onAccountSelect,
  onSyncAccount,
  onViewTransactions,
  onDeleteAccount
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
      case 'depository':
        return <Wallet className="w-5 h-5" />
      case 'savings':
        return <TrendingUp className="w-5 h-5" />
      case 'credit':
        return <CreditCard className="w-5 h-5" />
      default:
        return <Building2 className="w-5 h-5" />
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
      case 'depository':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'savings':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'credit':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getAccountStatus = (lastUpdated: string) => {
    const lastUpdate = new Date(lastUpdated)
    const now = new Date()
    const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return { 
        status: 'healthy', 
        label: 'Healthy', 
        icon: CheckCircle, 
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20'
      }
    } else if (diffInHours < 72) {
      return { 
        status: 'warning', 
        label: 'Needs Sync', 
        icon: Clock, 
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
      }
    } else {
      return { 
        status: 'error', 
        label: 'Connection Issue', 
        icon: AlertCircle, 
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/20'
      }
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    if (diffInHours < 72) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const handleDropdownToggle = (accountId: string) => {
    setActiveDropdown(activeDropdown === accountId ? null : accountId)
  }

  if (accounts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No accounts found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Connect your bank accounts to start managing your finances
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Connected Accounts
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
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
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {accounts.map((account) => {
              const status = getAccountStatus(account.lastUpdated)
              const StatusIcon = status.icon

              return (
                <tr
                  key={account.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => onAccountSelect?.(account)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getAccountTypeColor(account.type)}`}>
                        {getAccountIcon(account.type)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {account.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {account.id || 'Unknown Bank'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeColor(account.type)}`}>
                      {account.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(account.balance)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded-full ${status.bgColor}`}>
                        <StatusIcon className={`w-3 h-3 ${status.color}`} />
                      </div>
                      <span className={`text-sm font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(account.lastUpdated)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDropdownToggle(account.id)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {activeDropdown === account.id && (
                        <div className="absolute right-0 z-10 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                          {onSyncAccount && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onSyncAccount(account.id)
                                setActiveDropdown(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2 first:rounded-t-lg"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>Sync Account</span>
                            </button>
                          )}
                          {onViewTransactions && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewTransactions(account.id)
                                setActiveDropdown(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Transactions</span>
                            </button>
                          )}
                          {onDeleteAccount && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteAccount(account.id)
                                setActiveDropdown(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 last:rounded-b-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Disconnect</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AccountsDataTable
