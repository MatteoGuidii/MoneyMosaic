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

  const optimisticComplete = async (message: string) => {
    setLastSyncResult(message)
    await fetchSyncStatus()
    onSyncComplete?.()
  }

  // Manual sync functionality with timeout safeguard
  const handleManualSync = async () => {
    setIsLoading(true)
    setLastSyncResult(null)
    let timeoutId: any

    const finish = () => {
      clearTimeout(timeoutId)
      setIsLoading(false)
      setTimeout(() => setLastSyncResult(null), 3000)
    }

    try {
      let message = ''

      if (investmentOnly) {
        const result = await apiService.syncInvestments()
        if (result.success) {
          message = '✅ Investment sync started'
          await optimisticComplete(message)
        } else {
          setLastSyncResult('❌ Investment sync failed to start')
        }
      } else {
        const result = await apiService.syncAllData()
        if (result.success) {
          message = `✅ Sync started`
          // kick an immediate status refresh and a short poll to reflect progress
          await optimisticComplete(message)
          setTimeout(fetchSyncStatus, 2000)
        } else {
          setLastSyncResult('❌ Sync failed to start')
        }

        if (includeInvestments) {
          // fire-and-forget investments; don't block the button
          apiService.syncInvestments().catch(err => console.error('Investment sync failed:', err))
        }
      }
    } catch (error) {
      console.error('Sync failed:', error)
      setLastSyncResult('❌ Sync failed')
    } finally {
      // Safety timeout: never let spinner run forever
      timeoutId = setTimeout(finish, 8000)
      // If the server responded immediately, finish sooner
      finish()
    }
  }

  // Auto-sync and initial status
  useEffect(() => {
    fetchSyncStatus()

    const interval = setInterval(() => {
      handleManualSync()
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
