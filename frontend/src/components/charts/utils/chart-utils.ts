/**
 * Format number as currency (CAD)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0
  }).format(value)
}

/**
 * Format date string for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-CA', { 
    month: 'short', 
    day: 'numeric' 
  })
}

/**
 * Chart color palette
 */
export const CHART_COLORS = [
  '#6366f1', 
  '#8b5cf6', 
  '#ec4899', 
  '#06b6d4', 
  '#10b981', 
  '#f59e0b'
]

/**
 * Generate category options for dropdown
 */
export const generateCategoryOptions = (categoryData: { category: string }[]) => {
  const uniqueCategories = [...new Set(categoryData.map(item => item.category))]
  return [
    { value: 'all', label: 'All Categories' },
    ...uniqueCategories.map(category => ({
      value: category,
      label: category
    }))
  ]
}

/**
 * Filter category data by selected category
 */
export const filterCategoryData = <T extends { category: string }>(
  data: T[], 
  selectedCategory: string
): T[] => {
  if (selectedCategory === 'all') {
    return data
  }
  return data.filter(item => item.category === selectedCategory)
}
