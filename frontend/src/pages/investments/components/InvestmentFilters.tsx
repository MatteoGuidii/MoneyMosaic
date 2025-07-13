import React from 'react'
import { Search } from 'lucide-react'
import { DateRange, InvestmentFilters } from '../types/investment-types'
import { DATE_RANGES } from '../utils/investment-utils'

interface InvestmentFiltersProps {
  filters: InvestmentFilters
  sectors: string[]
  selectedDateRange: DateRange
  onFiltersChange: (filters: Partial<InvestmentFilters>) => void
  onDateRangeChange: (dateRange: DateRange) => void
}

const InvestmentFiltersComponent: React.FC<InvestmentFiltersProps> = ({
  filters,
  sectors,
  selectedDateRange,
  onFiltersChange,
  onDateRangeChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Date Range Filter */}
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <select
            value={selectedDateRange.label}
            onChange={(e) => {
              const range = DATE_RANGES.find(r => r.label === e.target.value)
              if (range) onDateRangeChange(range)
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            {DATE_RANGES.map((range) => (
              <option key={range.label} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Holdings
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by symbol or company name..."
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Sector Filter */}
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sector
          </label>
          <select
            value={filters.filterSector}
            onChange={(e) => onFiltersChange({ filterSector: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default InvestmentFiltersComponent
