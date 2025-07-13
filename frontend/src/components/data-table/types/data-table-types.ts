import { Transaction } from '../../../services/apiService'

export type SortField = 'date' | 'amount' | 'category' | 'name'
export type SortDirection = 'asc' | 'desc'

export interface TransactionsDataTableProps {
  transactions: Transaction[]
  currentPage: number
  totalTransactions: number
  onPageChange: (page: number) => void
  onSort: (field: string, direction: 'asc' | 'desc') => void
  onExport: () => void
}

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

export interface SelectionState {
  selectedTransactions: Set<string>
  selectAll: boolean
}

export interface TableColumn {
  key: SortField
  label: string
  sortable: boolean
  width?: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
}
