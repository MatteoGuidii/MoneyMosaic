import { useState } from 'react'
import { SelectionState } from '../types'

/**
 * Custom hook for managing table row selection
 */
export const useTableSelection = (items: { id: string }[]) => {
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())

  const handleSelectTransaction = (transactionId: string) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId)
    } else {
      newSelected.add(transactionId)
    }
    setSelectedTransactions(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedTransactions.size === items.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(items.map(item => item.id)))
    }
  }

  const clearSelection = () => {
    setSelectedTransactions(new Set())
  }

  const isSelected = (id: string): boolean => {
    return selectedTransactions.has(id)
  }

  const isAllSelected = (): boolean => {
    return items.length > 0 && selectedTransactions.size === items.length
  }

  const getSelectionState = (): SelectionState => ({
    selectedTransactions,
    selectAll: isAllSelected()
  })

  return {
    selectedTransactions,
    handleSelectTransaction,
    handleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    getSelectionState
  }
}
