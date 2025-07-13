import React from 'react'
import { TransactionsDataTableProps, SortField } from './types'
import { useTableSort, useTableSelection } from './hooks'
import { calculatePaginationInfo } from './utils'
import { 
  SortIcon, 
  TableHeader, 
  TablePagination, 
  TransactionRow 
} from './components'

/**
 * Main data table component for displaying transactions
 */
const TransactionsDataTable: React.FC<TransactionsDataTableProps> = ({
  transactions,
  currentPage,
  totalTransactions,
  onPageChange,
  onSort,
  onExport
}) => {
  const { sortField, sortDirection, handleSort } = useTableSort('date', 'desc', onSort)
  const { 
    selectedTransactions, 
    handleSelectTransaction, 
    handleSelectAll, 
    isSelected, 
    isAllSelected 
  } = useTableSelection(transactions)

  const paginationInfo = calculatePaginationInfo(currentPage, totalTransactions, 20)

  const columns = [
    { key: 'date' as SortField, label: 'Date', sortable: true },
    { key: 'name' as SortField, label: 'Description', sortable: true },
    { key: 'amount' as SortField, label: 'Amount', sortable: true },
    { key: 'category' as SortField, label: 'Category', sortable: true }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <TableHeader 
        selectedCount={selectedTransactions.size}
        onExport={onExport}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected()}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <SortIcon 
                        field={column.key}
                        currentField={sortField}
                        direction={sortDirection}
                      />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                isSelected={isSelected(transaction.id)}
                onSelectTransaction={handleSelectTransaction}
              />
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={paginationInfo.totalPages}
        itemsPerPage={paginationInfo.itemsPerPage}
        totalItems={totalTransactions}
        onPageChange={onPageChange}
      />
    </div>
  )
}

export default TransactionsDataTable
