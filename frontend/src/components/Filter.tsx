import React, { useState } from 'react'
import { Search, Filter, Calendar, X, ChevronDown, DollarSign, Tag } from 'lucide-react'

interface TransactionsFilterProps {
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
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [showAccounts, setShowAccounts] = useState(false)
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const [tempStartDate, setTempStartDate] = useState(customDateRange?.start || '')
  const [tempEndDate, setTempEndDate] = useState(customDateRange?.end || '')

  const handleDateRangeClick = (range: string) => {
    if (range === 'custom') {
      setShowCustomDatePicker(true)
    } else {
      onDateRangeChange(range)
    }
  }

  const handleCustomDateSubmit = () => {
    if (tempStartDate && tempEndDate && onCustomDateRangeChange) {
      onCustomDateRangeChange(tempStartDate, tempEndDate)
      setShowCustomDatePicker(false)
    }
  }

  const dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '180', label: 'Last 6 months' },
    { value: 'custom', label: 'Custom range' }
  ]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    onSearch(e.target.value)
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    
    onCategoryFilter(newCategories)
  }

  const handleAccountToggle = (account: string) => {
    const newAccounts = selectedAccounts.includes(account)
      ? selectedAccounts.filter(a => a !== account)
      : [...selectedAccounts, account]
    
    onAccountFilter(newAccounts)
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedAccounts.length > 0 || 
    amountRange.min > 0 || amountRange.max < 10000 || searchTerm.length > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filter & Search
          </h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
              {selectedCategories.length + selectedAccounts.length + (amountRange.min > 0 || amountRange.max < 10000 ? 1 : 0) + (searchTerm.length > 0 ? 1 : 0)} active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
              isFilterOpen
                ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-300'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Advanced
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search transactions by name, merchant, or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Quick Date Range Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Time Period
        </label>
        <div className="flex flex-wrap gap-2">
          {dateRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => handleDateRangeClick(range.value)}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedDateRange === range.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {range.label}
            </button>
          ))}
        </div>
        
        {/* Custom Date Range Modal */}
        {showCustomDatePicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Select Custom Date Range
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCustomDatePicker(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomDateSubmit}
                    disabled={!tempStartDate || !tempEndDate}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-4">
          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Amount Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountRange.min}
                  onChange={(e) => onAmountRangeChange({ ...amountRange, min: parseFloat(e.target.value) || 0 })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountRange.max}
                  onChange={(e) => onAmountRangeChange({ ...amountRange, max: parseFloat(e.target.value) || 10000 })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10000.00"
                />
              </div>
            </div>
          </div>

          {/* Categories Filter */}
          <div>
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <span className="flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                Categories ({selectedCategories.length} selected)
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
            </button>
            {showCategories && (
              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300 truncate">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Accounts Filter */}
          {accounts.length > 0 && (
            <div>
              <button
                onClick={() => setShowAccounts(!showAccounts)}
                className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Accounts ({selectedAccounts.length} selected)
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAccounts ? 'rotate-180' : ''}`} />
              </button>
              {showAccounts && (
                <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700">
                  <div className="space-y-2">
                    {accounts.map((account) => (
                      <label key={account} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedAccounts.includes(account)}
                          onChange={() => handleAccountToggle(account)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{account}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TransactionsFilter
