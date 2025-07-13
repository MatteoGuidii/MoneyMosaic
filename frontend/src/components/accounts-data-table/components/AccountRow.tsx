import React from 'react'
import { MoreHorizontal } from 'lucide-react'
import { AccountRowProps } from '../types'
import { 
  formatCurrency, 
  getAccountIcon, 
  getAccountTypeColor, 
  getAccountStatus, 
  formatRelativeTime 
} from '../utils'
import AccountActionsDropdown from './AccountActionsDropdown'

/**
 * Individual account row component
 */
const AccountRow: React.FC<AccountRowProps> = ({
  account,
  isDropdownActive,
  onAccountSelect,
  onDropdownToggle,
  onSyncAccount,
  onViewTransactions,
  onDeleteAccount
}) => {
  const status = getAccountStatus(account.lastUpdated)
  const StatusIcon = status.icon

  return (
    <tr
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
              {account.institutionName || 'Unknown Bank'}
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
              onDropdownToggle(account.id)
            }}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          <AccountActionsDropdown
            accountId={account.id}
            isOpen={isDropdownActive}
            onSyncAccount={onSyncAccount}
            onViewTransactions={onViewTransactions}
            onDeleteAccount={onDeleteAccount}
            onClose={() => onDropdownToggle(account.id)}
          />
        </div>
      </td>
    </tr>
  )
}

export default AccountRow
