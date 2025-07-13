import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import { SyncStatus, SyncButtonProps } from '../types'
import { AUTO_SYNC_INTERVAL } from '../utils'

/**
 * Hook for managing sync functionality and status
 */
export const useSync = ({
  onSyncComplete,
  includeInvestments = true,
  investmentOnly = false
}: Pick<SyncButtonProps, 'onSyncComplete' | 'includeInvestments' | 'investmentOnly'>) => {
  const [isLoading, setIsLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null)

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const status = await apiService.getSyncStatus()
      setSyncStatus(status)
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
    }
  }

  // Auto-sync functionality
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

  // Manual sync functionality
  const handleManualSync = async () => {
    setIsLoading(true)
    setLastSyncResult(null)
    
    try {
      let result: any
      
      if (investmentOnly) {
        result = await apiService.syncInvestments()
        if (result.success) {
          setLastSyncResult(`✅ Investment sync completed`)
          await fetchSyncStatus()
          onSyncComplete?.()
        } else {
          setLastSyncResult('❌ Investment sync failed')
        }
      } else {
        result = await apiService.syncAllData()
        
        if (result.success) {
          let message = `✅ Synced ${result.transactionCount || 0} transactions`
          
          if (includeInvestments) {
            try {
              const investmentResult = await apiService.syncInvestments()
              if (investmentResult.success) {
                message += ` and investments`
              }
            } catch (error) {
              console.error('Investment sync failed:', error)
            }
          }
          
          setLastSyncResult(message)
          await fetchSyncStatus()
          onSyncComplete?.()
        } else {
          setLastSyncResult('❌ Sync failed')
        }
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

  // Set up auto-sync and fetch initial status
  useEffect(() => {
    fetchSyncStatus()
    
    const interval = setInterval(() => {
      handleAutoSync()
    }, AUTO_SYNC_INTERVAL)
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  return {
    isLoading,
    syncStatus,
    lastSyncResult,
    handleManualSync,
    fetchSyncStatus
  }
}
