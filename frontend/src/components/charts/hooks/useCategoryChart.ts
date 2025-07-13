import { useState } from 'react'

/**
 * Hook for managing category chart state
 */
export const useCategoryChart = (onCategoryPeriodChange?: (period: string) => void) => {
  const [categoryPeriod, setCategoryPeriod] = useState('30')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleCategoryPeriodChange = (period: string) => {
    setCategoryPeriod(period)
    if (onCategoryPeriodChange) {
      onCategoryPeriodChange(period)
    }
  }

  const handleCategorySelectionChange = (category: string) => {
    setSelectedCategory(category)
  }

  return {
    categoryPeriod,
    selectedCategory,
    handleCategoryPeriodChange,
    handleCategorySelectionChange
  }
}
