import React from 'react'
import { TransactionsFilterProps } from './types'
import {
  FilterHeader,
  SearchBar,
  DateRangeSelector,
  CustomDatePicker,
  AmountRangeFilter,
  CategoryFilter,
  AccountFilter
} from './components'
import { useFilterState } from './hooks'
import { DATE_RANGES, hasActiveFilters, calculateActiveFiltersCount, toggleArrayItem } from './utils'

const TransactionsFilter: React.FC<TransactionsFilterProps> = ({
  categories,
  accounts,
  selectedDateRange,
  selectedCategories,
  selectedAccounts,
  amountRange,
  customDateRange,
  onDateRangeChange,
  onCustomDateRangeChange,
  onCategoryFilter,
  onAccountFilter,
  onAmountRangeChange,
  onSearch,
  onClearFilters
}) => {
  const { filterState, updateFilterState, resetCustomDateState } = useFilterState(customDateRange)

  const handleSearchChange = (term: string) => {
    updateFilterState({ searchTerm: term })
    onSearch(term)
  }

  const handleDateRangeClick = (range: string) => {
    if (range === 'custom') {
      updateFilterState({ showCustomDatePicker: true })
    } else {
      onDateRangeChange(range)
    }
  }

  const handleCustomDateSubmit = (startDate: string, endDate: string) => {
    if (onCustomDateRangeChange) {
      onCustomDateRangeChange(startDate, endDate)
    }
    resetCustomDateState()
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = toggleArrayItem(selectedCategories, category)
    onCategoryFilter(newCategories)
  }

  const handleAccountToggle = (account: string) => {
    const newAccounts = toggleArrayItem(selectedAccounts, account)
    onAccountFilter(newAccounts)
  }

  const activeFilters = hasActiveFilters(selectedCategories, selectedAccounts, amountRange, filterState.searchTerm)
  const activeFiltersCount = calculateActiveFiltersCount(selectedCategories, selectedAccounts, amountRange, filterState.searchTerm)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <FilterHeader
        hasActiveFilters={activeFilters}
        activeFiltersCount={activeFiltersCount}
        isFilterOpen={filterState.isFilterOpen}
        onToggleFilter={() => updateFilterState({ isFilterOpen: !filterState.isFilterOpen })}
        onClearFilters={onClearFilters}
      />

      <SearchBar
        searchTerm={filterState.searchTerm}
        onSearchChange={handleSearchChange}
      />

      <DateRangeSelector
        dateRanges={DATE_RANGES}
        selectedDateRange={selectedDateRange}
        onDateRangeClick={handleDateRangeClick}
      />

      <CustomDatePicker
        isOpen={filterState.showCustomDatePicker}
        onClose={() => updateFilterState({ showCustomDatePicker: false })}
        onSubmit={handleCustomDateSubmit}
        initialStartDate={filterState.tempStartDate}
        initialEndDate={filterState.tempEndDate}
      />

      {/* Advanced Filters */}
      {filterState.isFilterOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-4">
          <AmountRangeFilter
            amountRange={amountRange}
            onAmountRangeChange={onAmountRangeChange}
          />

          <CategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
          />

          <AccountFilter
            accounts={accounts}
            selectedAccounts={selectedAccounts}
            onAccountToggle={handleAccountToggle}
          />
        </div>
      )}
    </div>
  )
}

export default TransactionsFilter
