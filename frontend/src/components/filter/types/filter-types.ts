export interface TransactionsFilterProps {
  categories: string[]
  accounts: string[]
  selectedDateRange: string
  selectedCategories: string[]
  selectedAccounts: string[]
  amountRange: { min: number; max: number }
  customDateRange?: { start: string; end: string }
  onDateRangeChange: (range: string) => void
  onCustomDateRangeChange?: (startDate: string, endDate: string) => void
  onCategoryFilter: (categories: string[]) => void
  onAccountFilter: (accounts: string[]) => void
  onAmountRangeChange: (range: { min: number; max: number }) => void
  onSearch: (term: string) => void
  onClearFilters: () => void
}

export interface DateRangeOption {
  value: string
  label: string
}

export interface CustomDatePickerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (startDate: string, endDate: string) => void
  initialStartDate?: string
  initialEndDate?: string
}

export interface FilterHeaderProps {
  hasActiveFilters: boolean
  activeFiltersCount: number
  isFilterOpen: boolean
  onToggleFilter: () => void
  onClearFilters: () => void
}

export interface SearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
}

export interface DateRangeSelectorProps {
  dateRanges: DateRangeOption[]
  selectedDateRange: string
  onDateRangeClick: (range: string) => void
}

export interface AmountRangeFilterProps {
  amountRange: { min: number; max: number }
  onAmountRangeChange: (range: { min: number; max: number }) => void
}

export interface CategoryFilterProps {
  categories: string[]
  selectedCategories: string[]
  onCategoryToggle: (category: string) => void
}

export interface AccountFilterProps {
  accounts: string[]
  selectedAccounts: string[]
  onAccountToggle: (account: string) => void
}

export interface FilterState {
  searchTerm: string
  isFilterOpen: boolean
  showCategories: boolean
  showAccounts: boolean
  showCustomDatePicker: boolean
  tempStartDate: string
  tempEndDate: string
}
