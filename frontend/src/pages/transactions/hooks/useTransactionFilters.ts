import { useState, useCallback } from 'react'
import { TransactionFilters, UseTransactionFiltersReturn } from '../types'

export const useTransactionFilters = (
  onFiltersChange?: () => void
): UseTransactionFiltersReturn => {
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: '180', // 6 months default
    categories: [],
    accounts: [],
    searchTerm: '',
    amountRange: { min: 0, max: 10000 },
    customDateRange: { start: '', end: '' }
  })

  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)

  const updateFilters = useCallback((updates: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
    onFiltersChange?.()
  }, [onFiltersChange])

  const handleDateRangeChange = useCallback((range: string) => {
    updateFilters({ dateRange: range })
  }, [updateFilters])

  const handleCustomDateRangeChange = useCallback((startDate: string, endDate: string) => {
    updateFilters({ 
      dateRange: 'custom',
      customDateRange: { start: startDate, end: endDate }
    })
    setShowCustomDatePicker(false)
  }, [updateFilters])

  const handleCategoryFilter = useCallback((categories: string[]) => {
    updateFilters({ categories })
  }, [updateFilters])

  const handleAccountFilter = useCallback((accounts: string[]) => {
    updateFilters({ accounts })
  }, [updateFilters])

  const handleAmountRangeChange = useCallback((range: { min: number; max: number }) => {
    updateFilters({ amountRange: range })
  }, [updateFilters])

  const handleSearch = useCallback((term: string) => {
    updateFilters({ searchTerm: term })
  }, [updateFilters])

  const handleClearFilters = useCallback(() => {
    setFilters({
      dateRange: '180',
      categories: [],
      accounts: [],
      searchTerm: '',
      amountRange: { min: 0, max: 10000 },
      customDateRange: { start: '', end: '' }
    })
    onFiltersChange?.()
  }, [onFiltersChange])

  return {
    filters,
    showCustomDatePicker,
    handleDateRangeChange,
    handleCustomDateRangeChange,
    handleCategoryFilter,
    handleAccountFilter,
    handleAmountRangeChange,
    handleSearch,
    handleClearFilters,
    setShowCustomDatePicker
  }
};
