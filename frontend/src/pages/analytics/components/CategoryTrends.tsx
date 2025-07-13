import React from 'react'
import { CategoryTrendsProps } from '../types'
import { formatPercentage, getTrendIcon, getTrendColor } from '../utils'

const CategoryTrends: React.FC<CategoryTrendsProps> = ({ trends, onCategorySelect }) => {
  if (!trends || !trends.categoryTrends) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Category Trends
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trends.categoryTrends.map((trend, index) => {
          const TrendIcon = getTrendIcon(trend.trend)
          const iconColor = getTrendColor(trend.trend)
          
          return (
            <div 
              key={index} 
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onCategorySelect(trend.category)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {trend.category}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPercentage(trend.changePercent)} change
                  </p>
                </div>
                <TrendIcon className={`w-4 h-4 ${iconColor}`} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryTrends
