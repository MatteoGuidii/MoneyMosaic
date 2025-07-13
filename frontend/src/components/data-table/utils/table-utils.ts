/**
 * Format currency amount with proper sign indication
 */
export const formatCurrency = (amount: number): string => {
  const sign = amount < 0 ? '+' : '-'
  return `${sign}$${Math.abs(amount).toFixed(2)}`
}

/**
 * Format date string to readable format
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Get color classes for transaction amount based on value
 */
export const getAmountColor = (amount: number): string => {
  return amount < 0 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400'
}

/**
 * Get color classes for category badge based on category name
 */
export const getCategoryColor = (category: string): string => {
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
  ]
  
  const hash = category.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Get status color classes for transaction status
 */
export const getStatusColor = (pending: boolean): string => {
  return pending 
    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
}

/**
 * Calculate pagination info
 */
export const calculatePaginationInfo = (
  currentPage: number, 
  totalItems: number, 
  itemsPerPage: number = 20
) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = ((currentPage - 1) * itemsPerPage) + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  
  return {
    totalPages,
    startItem,
    endItem,
    itemsPerPage
  }
}
