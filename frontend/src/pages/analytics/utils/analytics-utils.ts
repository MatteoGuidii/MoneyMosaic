import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
  switch (trend) {
    case 'increasing': return TrendingUp
    case 'decreasing': return TrendingDown
    case 'stable': return Minus
  }
}

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-blue-100 text-blue-800 border-blue-200'
  }
}

export const getTrendColor = (trend: 'increasing' | 'decreasing' | 'stable'): string => {
  switch (trend) {
    case 'increasing': return 'text-red-500'
    case 'decreasing': return 'text-green-500'
    case 'stable': return 'text-gray-500'
  }
}

export const getChangeIcon = (percentage: number) => {
  return percentage > 0 ? ArrowUpRight : ArrowDownRight
}

export const getChangeColor = (percentage: number, isIncome: boolean = false): string => {
  if (isIncome) {
    return percentage > 0 ? 'text-green-600' : 'text-red-600'
  }
  return percentage > 0 ? 'text-red-600' : 'text-green-600'
}

export const getChangeIconColor = (percentage: number, isIncome: boolean = false): string => {
  if (isIncome) {
    return percentage > 0 ? 'text-green-500' : 'text-red-500'
  }
  return percentage > 0 ? 'text-red-500' : 'text-green-500'
}

export const getPeriodDays = (period: string): number => {
  switch (period) {
    case 'week': return 7
    case 'month': return 30
    case 'quarter': return 90
    default: return 30
  }
}
