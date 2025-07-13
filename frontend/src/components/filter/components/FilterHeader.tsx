import React from 'react'
import { Filter, ChevronDown, X } from 'lucide-react'
import { FilterHeaderProps } from '../types'

const FilterHeader: React.FC<FilterHeaderProps> = ({
  hasActiveFilters,
  activeFiltersCount,
  isFilterOpen,
  onToggleFilter,
  onClearFilters
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filter & Search
        </h3>
        {hasActiveFilters && (
          <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
            {activeFiltersCount} active
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleFilter}
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
  )
}

export default FilterHeader
