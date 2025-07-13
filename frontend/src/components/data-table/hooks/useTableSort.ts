import { useState } from 'react'
import { SortField, SortDirection, SortConfig } from '../types'

/**
 * Custom hook for managing table sorting state and logic
 */
export const useTableSort = (
  initialField: SortField = 'date',
  initialDirection: SortDirection = 'desc',
  onSort: (field: string, direction: SortDirection) => void
) => {
  const [sortField, setSortField] = useState<SortField>(initialField)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection)

  const handleSort = (field: SortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortDirection(newDirection)
    onSort(field, newDirection)
  }

  const getSortConfig = (): SortConfig => ({
    field: sortField,
    direction: sortDirection
  })

  return {
    sortField,
    sortDirection,
    handleSort,
    getSortConfig
  }
}
