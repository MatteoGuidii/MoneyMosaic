import React from 'react'
import { RefreshCw, WifiOff } from 'lucide-react'
import { SyncIconProps } from '../types'

/**
 * Sync icon component with loading and status states
 */
const SyncIcon: React.FC<SyncIconProps> = ({ isLoading, isHealthy }) => {
  if (isLoading) {
    return <RefreshCw className="w-4 h-4 animate-spin" />
  }
  
  if (isHealthy === false) {
    return <WifiOff className="w-4 h-4 text-red-500" />
  }
  
  return <RefreshCw className="w-4 h-4" />
}

export default SyncIcon
