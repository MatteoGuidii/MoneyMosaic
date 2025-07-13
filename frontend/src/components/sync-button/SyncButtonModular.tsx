import React from 'react'
import { SyncButtonProps } from './types'
import { useSync } from './hooks'
import { IconButton, StandardButton, SyncStatusPanel } from './components'

/**
 * Main sync button component with multiple variants
 */
const SyncButton: React.FC<SyncButtonProps> = ({ 
  onSyncComplete, 
  variant = 'button',
  className = '',
  includeInvestments = true,
  investmentOnly = false
}) => {
  const {
    isLoading,
    syncStatus,
    lastSyncResult,
    handleManualSync
  } = useSync({
    onSyncComplete,
    includeInvestments,
    investmentOnly
  })

  switch (variant) {
    case 'icon':
      return (
        <IconButton
          isLoading={isLoading}
          onSync={handleManualSync}
          className={className}
        />
      )

    case 'button':
      return (
        <StandardButton
          isLoading={isLoading}
          onSync={handleManualSync}
          className={className}
          investmentOnly={investmentOnly}
        />
      )

    case 'full':
      return (
        <SyncStatusPanel
          syncStatus={syncStatus}
          lastSyncResult={lastSyncResult}
          isLoading={isLoading}
          onSync={handleManualSync}
          className={className}
        />
      )

    default:
      return null
  }
}

export default SyncButton
