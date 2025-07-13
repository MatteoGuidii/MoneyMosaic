import React from 'react'
import { SyncButtonVariantProps } from '../types'
import { getSyncButtonText } from '../utils'
import SyncIcon from './SyncIcon'

/**
 * Icon-only sync button variant
 */
export const IconButton: React.FC<SyncButtonVariantProps> = ({
  isLoading,
  onSync,
  className = ''
}) => (
  <button
    onClick={onSync}
    disabled={isLoading}
    className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
    title="Sync data"
  >
    <SyncIcon isLoading={isLoading} />
  </button>
)

/**
 * Standard button sync variant
 */
export const StandardButton: React.FC<SyncButtonVariantProps> = ({
  isLoading,
  onSync,
  className = '',
  investmentOnly = false
}) => (
  <button
    onClick={onSync}
    disabled={isLoading}
    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${className}`}
  >
    <SyncIcon isLoading={isLoading} />
    {getSyncButtonText(isLoading, investmentOnly)}
  </button>
)
