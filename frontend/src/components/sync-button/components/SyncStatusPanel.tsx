import React from 'react'
import { Clock, Wifi, WifiOff } from 'lucide-react'
import { SyncStatusPanelProps } from '../types'
import { formatLastSync } from '../utils'
import SyncIcon from './SyncIcon'

/**
 * Full sync status panel component
 */
const SyncStatusPanel: React.FC<SyncStatusPanelProps> = ({
  syncStatus,
  lastSyncResult,
  isLoading,
  onSync,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Data Sync
        </h3>
        <div className="flex items-center gap-2">
          {syncStatus?.isHealthy ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-xs ${syncStatus?.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
            {syncStatus?.isHealthy ? 'Healthy' : 'Issues'}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Last sync:</span>
          <span className="text-gray-900 dark:text-white">
            {syncStatus ? formatLastSync(syncStatus.lastSync) : '...'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Auto-sync:</span>
          <span className="text-gray-900 dark:text-white flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Every 5 min
          </span>
        </div>
      </div>

      {lastSyncResult && (
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
          {lastSyncResult}
        </div>
      )}

      <button
        onClick={onSync}
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
      >
        <SyncIcon isLoading={isLoading} />
        {isLoading ? 'Syncing Data...' : 'Sync Now'}
      </button>
    </div>
  )
}

export default SyncStatusPanel
