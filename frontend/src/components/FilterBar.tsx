import React, { useState } from 'react'
import { Search, Filter, Calendar, X } from 'lucide-react'

interface FilterBarProps {
  categories: string[]
  selectedDateRange: string
  selectedCategories: string[]
  onDateRangeChange: (range: string) => void
  onCategoryFilter: (categories: string[]) => void
  onSearch: (term: string) => void
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedDateRange,
  selectedCategories,
  onDateRangeChange,
  onCategoryFilter,
  onSearch
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '180', label: 'Last 6 months' }
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

  const clearFilters = () => {
    onCategoryFilter([])
    setSearchTerm('')
    onSearch('')
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Date Range Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={selectedDateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Categories</span>
            {selectedCategories.length > 0 && (
              <span className="bg-navy-100 dark:bg-navy-900 text-navy-800 dark:text-navy-200 px-2 py-1 rounded-full text-xs">
                {selectedCategories.length}
              </span>
            )}
          </button>

          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Filter by Category</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-4 h-4 text-navy-600 border-gray-300 dark:border-gray-600 rounded focus:ring-navy-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>

                {selectedCategories.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="w-full mt-3 px-3 py-2 text-sm text-navy-600 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-900/20 rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {selectedCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedCategories.map(category => (
            <span
              key={category}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-navy-100 dark:bg-navy-900 text-navy-800 dark:text-navy-200"
            >
              {category}
              <button
                onClick={() => handleCategoryToggle(category)}
                className="ml-2 text-navy-600 dark:text-navy-400 hover:text-navy-800 dark:hover:text-navy-200"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default FilterBar
