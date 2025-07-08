import React, { useState } from 'react'
import { Search, Filter, X, ChevronDown, Building2, Activity } from 'lucide-react'

interface AccountsFilterProps {
  accountTypes: string[]
  selectedTypes: string[]
  selectedStatus: string
  searchTerm: string
  onTypeFilter: (types: string[]) => void
  onStatusFilter: (status: string) => void
  onSearch: (term: string) => void
  onClearFilters: () => void
}

const AccountsFilter: React.FC<AccountsFilterProps> = ({
  accountTypes,
  selectedTypes,
  selectedStatus,
  searchTerm,
  onTypeFilter,
  onStatusFilter,
  onSearch,
  onClearFilters
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showTypes, setShowTypes] = useState(false)

  const statusOptions = [
    { value: 'all', label: 'All Accounts' },
    { value: 'healthy', label: 'Healthy' },
    { value: 'warning', label: 'Needs Sync' },
    { value: 'error', label: 'Connection Issues' }
  ]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value)
  }

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeFilter(selectedTypes.filter(t => t !== type))
    } else {
      onTypeFilter([...selectedTypes, type])
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedTypes.length > 0) count++
    if (selectedStatus !== 'all') count++
    if (searchTerm) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex flex-col space-y-4">
        {/* Search and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              isFilterOpen || activeFiltersCount > 0
                ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-300'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            {/* Account Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Activity className="w-4 h-4 inline mr-1" />
                Account Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => onStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Types Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Account Types
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowTypes(!showTypes)}
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                >
                  <span>
                    {selectedTypes.length === 0 
                      ? 'All Types'
                      : `${selectedTypes.length} selected`
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTypes ? 'rotate-180' : ''}`} />
                </button>
                
                {showTypes && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {accountTypes.map(type => (
                      <label
                        key={type}
                        className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => handleTypeToggle(type)}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountsFilter
