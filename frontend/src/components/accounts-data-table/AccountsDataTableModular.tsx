import React from 'react'
import { AccountsDataTableProps } from './types'
import { useAccountsDropdown } from './hooks'
import { EmptyState, AccountRow } from './components'

/**
 * Main accounts data table component
 */
const AccountsDataTable: React.FC<AccountsDataTableProps> = ({
  accounts,
  onAccountSelect,
  onSyncAccount,
  onViewTransactions,
  onDeleteAccount
}) => {
  const { handleDropdownToggle, isDropdownActive } = useAccountsDropdown()

  if (accounts.length === 0) {
    return (
      <EmptyState
        title="No accounts found"
        description="Connect your bank accounts to start managing your finances"
      />
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
            {accounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                isDropdownActive={isDropdownActive(account.id)}
                onAccountSelect={onAccountSelect}
                onDropdownToggle={handleDropdownToggle}
                onSyncAccount={onSyncAccount}
                onViewTransactions={onViewTransactions}
                onDeleteAccount={onDeleteAccount}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AccountsDataTable
