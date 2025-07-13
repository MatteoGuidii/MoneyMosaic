import { BudgetSummary } from '../types'
import { BudgetData } from '../../../services/types'

export const CATEGORY_MAXIMUMS: Record<string, number> = {
  'Housing': 3000,
  'Transportation': 1500,
  'Food': 1000,
  'Utilities': 500,
  'Entertainment': 500,
  'Healthcare': 800,
  'Shopping': 800,
  'Travel': 2000,
  'Education': 1000,
  'Other': 1000
}

export const getCategoryMax = (category: string): number => {
  return CATEGORY_MAXIMUMS[category] || 1000
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount)
}

export const calculateBudgetSummary = (budgets: BudgetData[]): BudgetSummary => {
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent

  return {
    totalBudgeted,
    totalSpent,
    totalRemaining
  }
}

export const getPresetAmounts = (maxAmount: number): number[] => {
  return [0.25, 0.5, 0.75, 1].map(multiplier => Math.round(maxAmount * multiplier))
}

export const isOverBudget = (percentage: number): boolean => {
  return percentage > 100
}

export const getBudgetStatusColor = (percentage: number): string => {
  if (percentage > 100) return 'bg-red-500'
  if (percentage > 80) return 'bg-yellow-500'
  return 'bg-green-500'
}

export const getBudgetTextColor = (percentage: number): string => {
  if (percentage > 100) return 'text-red-600 dark:text-red-400'
  return 'text-green-600 dark:text-green-400'
}
