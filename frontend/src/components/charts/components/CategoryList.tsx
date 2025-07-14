import React from 'react'
import { PieChartIcon } from 'lucide-react'
import { CategoryListProps } from '../types'
import { formatCurrency } from '../utils'

/**
 * Category breakdown list component
 */
const CategoryList: React.FC<CategoryListProps> = ({
  categoryData,
  selectedCategory,
  onCategorySelect,
  colors
}) => {
  // Ensure categoryData is always an array
  const safeCategories = Array.isArray(categoryData) ? categoryData : []
  
  if (safeCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <PieChartIcon className="w-8 h-8 mb-3 opacity-30" />
        <p className="text-sm text-center">
          No category data available for the selected period
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {selectedCategory !== 'all' && (
        <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            Showing: <strong>{selectedCategory}</strong> category
          </p>
        </div>
      )}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {safeCategories.slice(0, 8).map((item, index) => (
          <div 
            key={item.category}
            className="group flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
            onClick={() => onCategorySelect(item.category)}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.category}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.percentage}%
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(item.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryList
