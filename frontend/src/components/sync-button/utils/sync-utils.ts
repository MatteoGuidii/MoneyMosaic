/**
 * Format last sync time as relative time
 */
export const formatLastSync = (lastSync: string): string => {
  try {
    const date = new Date(lastSync)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  } catch {
    return 'Unknown'
  }
}

/**
 * Get sync button text based on loading state and type
 */
export const getSyncButtonText = (isLoading: boolean, investmentOnly: boolean): string => {
  if (isLoading) {
    return investmentOnly ? 'Syncing Investments...' : 'Syncing...'
  }
  return investmentOnly ? 'Sync Investments' : 'Sync'
}

/**
 * Auto-sync interval in milliseconds (5 minutes)
 */
export const AUTO_SYNC_INTERVAL = 300000
