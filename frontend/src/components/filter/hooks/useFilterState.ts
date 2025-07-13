import { useState } from 'react'
import { FilterState } from '../types'

export const useFilterState = (customDateRange?: { start: string; end: string }) => {
  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: '',
    isFilterOpen: false,
    showCategories: false,
    showAccounts: false,
    showCustomDatePicker: false,
    tempStartDate: customDateRange?.start || '',
    tempEndDate: customDateRange?.end || ''
  })

  const updateFilterState = (updates: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...updates }))
  }

  const resetCustomDateState = () => {
    setFilterState(prev => ({
      ...prev,
      showCustomDatePicker: false,
      tempStartDate: customDateRange?.start || '',
      tempEndDate: customDateRange?.end || ''
    }))
  }

  return {
    filterState,
    updateFilterState,
    resetCustomDateState
  }
}
