import { DateRangeOption } from '../types'

export const DATE_RANGES: DateRangeOption[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '180', label: 'Last 6 months' },
  { value: 'custom', label: 'Custom range' }
]

export const calculateActiveFiltersCount = (
  selectedCategories: string[],
  selectedAccounts: string[],
  amountRange: { min: number; max: number },
  searchTerm: string
): number => {
  let count = 0
  
  if (selectedCategories.length > 0) count++
  if (selectedAccounts.length > 0) count++
  if (amountRange.min > 0 || amountRange.max < 10000) count++
  if (searchTerm.length > 0) count++
  
  return count
}

export const hasActiveFilters = (
  selectedCategories: string[],
  selectedAccounts: string[],
  amountRange: { min: number; max: number },
  searchTerm: string
): boolean => {
  return selectedCategories.length > 0 || 
         selectedAccounts.length > 0 || 
         amountRange.min > 0 || 
         amountRange.max < 10000 || 
         searchTerm.length > 0
}

export const toggleArrayItem = <T>(array: T[], item: T): T[] => {
  return array.includes(item)
    ? array.filter(i => i !== item)
    : [...array, item]
}
