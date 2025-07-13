import React from 'react'
import { Building2, Wallet, TrendingUp, CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { AccountStatus } from '../types'

/**
 * Format number as currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(amount)
}

/**
 * Get icon for account type
 */
export const getAccountIcon = (type: string): React.ReactElement => {
  switch (type.toLowerCase()) {
    case 'checking':
    case 'depository':
      return React.createElement(Wallet, { className: 'w-5 h-5' })
    case 'savings':
      return React.createElement(TrendingUp, { className: 'w-5 h-5' })
    case 'credit':
      return React.createElement(CreditCard, { className: 'w-5 h-5' })
    default:
      return React.createElement(Building2, { className: 'w-5 h-5' })
  }
}

/**
 * Get color classes for account type
 */
export const getAccountTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'checking':
    case 'depository':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'savings':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'credit':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

/**
 * Get account status based on last updated time
 */
export const getAccountStatus = (lastUpdated: string): AccountStatus => {
  const lastUpdate = new Date(lastUpdated)
  const now = new Date()
  const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return { 
      status: 'healthy', 
      label: 'Healthy', 
      icon: CheckCircle, 
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    }
  } else if (diffInHours < 72) {
    return { 
      status: 'warning', 
      label: 'Needs Sync', 
      icon: Clock, 
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    }
  } else {
    return { 
      status: 'error', 
      label: 'Connection Issue', 
      icon: AlertCircle, 
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  }
}

/**
 * Format date as relative time
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
  if (diffInHours < 72) return `${Math.floor(diffInHours / 24)}d ago`
  return date.toLocaleDateString('en-CA')
}
