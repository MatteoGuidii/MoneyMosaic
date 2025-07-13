import { useState, useMemo } from 'react'
import { Account } from '../../../services/types'
import { AccountFilters, UseAccountFiltersReturn } from '../types'
import { filterAccounts } from '../utils'

export const useAccountFilters = (accounts: Account[]): UseAccountFiltersReturn => {
  const [filters, setFilters] = useState<AccountFilters>({
    searchTerm: '',
    selectedTypes: [],
    selectedStatus: 'all'
  })

  const handleTypeFilter = (types: string[]) => {
    setFilters(prev => ({ ...prev, selectedTypes: types }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, selectedStatus: status }))
  }

  const handleSearch = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }))
  }

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedTypes: [],
      selectedStatus: 'all'
    })
  }

  const filteredAccounts = useMemo(() => {
    return filterAccounts(accounts, filters)
  }, [accounts, filters])

  return {
    filters,
    handleTypeFilter,
    handleStatusFilter,
    handleSearch,
    handleClearFilters,
    filteredAccounts
  }
}
