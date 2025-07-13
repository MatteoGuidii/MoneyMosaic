import React, { useState } from 'react'
import { Tag, ChevronDown } from 'lucide-react'
import { CategoryFilterProps } from '../types'

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle
}) => {
  const [showCategories, setShowCategories] = useState(false)

  return (
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
                  onChange={() => onCategoryToggle(category)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300 truncate">{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryFilter
