import React, { useState, useEffect } from 'react'
import { RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react'
import { apiService } from '../services/apiService'

interface SyncButtonProps {
  onSyncComplete?: () => void
  variant?: 'icon' | 'button' | 'full'
  className?: string
}

interface SyncStatus {
  lastSync: string
  isHealthy: boolean
  nextAutoSync: string
}

const SyncButton: React.FC<SyncButtonProps> = ({ 
  onSyncComplete, 
  variant = 'button',
  className = '' 
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null)

  // Fetch sync status on component mount
  useEffect(() => {
    fetchSyncStatus()
    
    // Set up auto-sync every 5 minutes (300000ms)
    const interval = setInterval(() => {
      handleAutoSync()
    }, 300000)
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  const fetchSyncStatus = async () => {
    try {
      const status = await apiService.getSyncStatus()
      setSyncStatus(status)
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
    }
  }

  const handleManualSync = async () => {
    setIsLoading(true)
    setLastSyncResult(null)
    
    try {
      const result = await apiService.syncAllData()
      
      if (result.success) {
        setLastSyncResult(`✅ Synced ${result.transactionCount || 0} transactions`)
        await fetchSyncStatus() // Refresh status
        onSyncComplete?.()
      } else {
        setLastSyncResult('❌ Sync failed')
      }
    } catch (error) {
      console.error('Sync failed:', error)
      setLastSyncResult('❌ Sync failed')
    } finally {
      setIsLoading(false)
      
      // Clear result message after 3 seconds
      setTimeout(() => setLastSyncResult(null), 3000)
    }
  }

  const handleAutoSync = async () => {
    try {
      console.log('🔄 Auto-syncing data...')
      const result = await apiService.syncAllData()
      if (result.success) {
        await fetchSyncStatus()
        onSyncComplete?.()
        console.log(`✅ Auto-sync completed: ${result.transactionCount || 0} transactions`)
      }
    } catch (error) {
      console.error('Auto-sync failed:', error)
    }
  }

  const formatLastSync = (lastSync: string) => {
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

  const renderIcon = () => {
    if (isLoading) {
      return <RefreshCw className="w-4 h-4 animate-spin" />
    }
    
    if (syncStatus?.isHealthy === false) {
      return <WifiOff className="w-4 h-4 text-red-500" />
    }
    
    return <RefreshCw className="w-4 h-4" />
  }

  const renderContent = () => {
    switch (variant) {
      case 'icon':
        return (
          <button
            onClick={handleManualSync}
            disabled={isLoading}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
            title="Sync data"
          >
            {renderIcon()}
          </button>
        )

      case 'button':
        return (
          <button
            onClick={handleManualSync}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${className}`}
          >
            {renderIcon()}
            {isLoading ? 'Syncing...' : 'Sync'}
          </button>
        )

      case 'full':
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
              onClick={handleManualSync}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
            >
              {renderIcon()}
              {isLoading ? 'Syncing Data...' : 'Sync Now'}
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return <>{renderContent()}</>
}

export default SyncButton
