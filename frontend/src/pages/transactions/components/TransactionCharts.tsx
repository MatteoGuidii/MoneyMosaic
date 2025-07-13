import React from 'react'
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react'
import LineChart from '../../../components/charts/LineChart'
import PieChart from '../../../components/charts/PieChart'
import { TransactionAnalyticsData } from '../types'

interface TransactionChartsProps {
  analyticsData: TransactionAnalyticsData
  dateRange: string
  selectedCategories: string[]
  allCategories: string[]
  onCategoryFilter: (categories: string[]) => void
}

const TransactionCharts: React.FC<TransactionChartsProps> = ({
  analyticsData,
  dateRange,
  selectedCategories,
  allCategories,
  onCategoryFilter
}) => {
  const { trendsData, categoryData } = analyticsData

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case '7': return '7-Day'
      case '30': return '30-Day'
      case '90': return '90-Day'
      case '180': return '6-Month'
      case 'custom': return 'Custom Range'
      default: return 'Transaction'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Transaction Trends Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getDateRangeLabel(dateRange)} Trends
            </h3>
          </div>
          {selectedCategories.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Filtered by:</span>
              <div className="flex flex-wrap gap-1">
                {selectedCategories.slice(0, 2).map(category => (
                  <span key={category} className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                    {category}
                  </span>
                ))}
                {selectedCategories.length > 2 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{selectedCategories.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <LineChart 
          data={trendsData} 
          hideIncomeWhenAllExpenses={selectedCategories.length > 0} 
        />
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Category Breakdown
            </h3>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <select
              value={selectedCategories.length === 1 ? selectedCategories[0] : selectedCategories.length > 1 ? 'multiple' : 'all'}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  onCategoryFilter([]);
                } else if (e.target.value === 'multiple') {
                  // Keep existing multiple selection
                  return;
                } else {
                  onCategoryFilter([e.target.value]);
                }
              }}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {selectedCategories.length > 1 && (
                <option value="multiple">Multiple Categories ({selectedCategories.length})</option>
              )}
              {allCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {selectedCategories.length > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Shows filtered data only
              </span>
            )}
          </div>
        </div>
        {categoryData.length > 0 ? (
          <PieChart data={categoryData} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            No spending data available
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionCharts
