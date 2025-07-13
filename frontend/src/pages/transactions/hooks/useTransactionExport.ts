import { useCallback } from 'react'
import { exportTransactionsToCSV } from '../utils'
import { TransactionFilters, UseTransactionExportReturn } from '../types'

export const useTransactionExport = (
  transactions: any[],
  filters: TransactionFilters,
  onSuccess: (message: string) => void,
  onError: (message: string) => void
): UseTransactionExportReturn => {
  const handleExport = useCallback(async () => {
    try {
      exportTransactionsToCSV(transactions, filters)
      onSuccess('Transactions exported successfully!')
    } catch (error) {
      console.error('Error exporting transactions:', error)
      onError('Failed to export transactions')
    }
  }, [transactions, filters, onSuccess, onError])

  return {
    handleExport
  }
};
