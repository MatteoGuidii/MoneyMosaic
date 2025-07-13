import React from 'react'
import { RefreshCw, Eye, Trash2 } from 'lucide-react'
import { AccountActionsDropdownProps } from '../types'

/**
 * Dropdown menu for account actions
 */
const AccountActionsDropdown: React.FC<AccountActionsDropdownProps> = ({
  accountId,
  isOpen,
  onSyncAccount,
  onViewTransactions,
  onDeleteAccount,
  onClose
}) => {
  if (!isOpen) return null

  const handleAction = (action: () => void) => {
    action()
    onClose()
  }

  return (
    <div className="absolute right-0 z-10 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
      {onSyncAccount && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleAction(() => onSyncAccount(accountId))
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
            handleAction(() => onViewTransactions(accountId))
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
            handleAction(() => onDeleteAccount(accountId))
          }}
          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 last:rounded-b-lg"
        >
          <Trash2 className="w-4 h-4" />
          <span>Disconnect</span>
        </button>
      )}
    </div>
  )
}

export default AccountActionsDropdown
