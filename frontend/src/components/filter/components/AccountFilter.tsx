import React, { useState } from 'react'
import { DollarSign, ChevronDown } from 'lucide-react'
import { AccountFilterProps } from '../types'

const AccountFilter: React.FC<AccountFilterProps> = ({
  accounts,
  selectedAccounts,
  onAccountToggle
}) => {
  const [showAccounts, setShowAccounts] = useState(false)

  if (accounts.length === 0) return null

  return (
    <div>
      <button
        onClick={() => setShowAccounts(!showAccounts)}
        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        <span className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1" />
          Accounts ({selectedAccounts.length} selected)
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showAccounts ? 'rotate-180' : ''}`} />
      </button>
      {showAccounts && (
        <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700">
          <div className="space-y-2">
            {accounts.map((account) => (
              <label key={account} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedAccounts.includes(account)}
                  onChange={() => onAccountToggle(account)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{account}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountFilter
