import React from 'react'
import { Transaction } from '../../../services/apiService'
import { 
  formatCurrency, 
  formatDate, 
  getAmountColor, 
  getCategoryColor, 
  getStatusColor 
} from '../utils'

interface TransactionRowProps {
  transaction: Transaction
  isSelected: boolean
  onSelectTransaction: (id: string) => void
}

/**
 * Individual transaction row component
 */
const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  isSelected,
  onSelectTransaction
}) => {
  return (
    <tr 
      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectTransaction(transaction.id)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        <div className="flex items-center space-x-2">
          <span>{formatDate(transaction.date)}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
        <div className="max-w-xs">
          <div className="font-medium truncate" title={transaction.name}>
            {transaction.name}
          </div>
          {transaction.merchant_name && (
            <div className="text-gray-500 dark:text-gray-400 text-xs truncate">
              {transaction.merchant_name}
            </div>
          )}
        </div>
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getAmountColor(transaction.amount)}`}>
        <div className="flex items-center space-x-1">
          <span>{formatCurrency(transaction.amount)}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(transaction.category)}`}>
          {transaction.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {transaction.account_name || transaction.account_id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.pending)}`}>
          {transaction.pending ? 'Pending' : 'Posted'}
        </span>
      </td>
    </tr>
  )
}

export default TransactionRow
