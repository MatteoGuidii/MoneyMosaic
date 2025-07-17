import { useEffect, useCallback } from 'react'
import { useBankData } from './useBankData'
import { useBankOperations } from './useBankOperations'
import { usePlaidLink } from './usePlaidLink'
import { useNotifications } from './useNotifications'
import { apiService } from '../../../services/apiService'
import { dispatchAppEvent, APP_EVENTS } from '../../../utils/app-events'

export const useBankManagement = () => {
  const {
    banks,
    healthStatuses,
    loading,
    loadBanks,
    loadHealthStatus
  } = useBankData()

  const {
    syncing,
    connectingBank,
    checkingHealth,
    syncData,
    performHealthCheck,
    connectBank
  } = useBankOperations()

  const {
    isPlaidReady,
    initializePlaid,
    exchangeToken
  } = usePlaidLink()

  const {
    error,
    successMessage,
    showError,
    showSuccess,
    clearNotifications
  } = useNotifications()

  // Initialize data on mount
  useEffect(() => {
    loadBanks()
    loadHealthStatus()
  }, [loadBanks, loadHealthStatus])

  // Combined sync operation
  const handleSync = useCallback(async () => {
    try {
      clearNotifications()
      await syncData()
      await loadBanks()
      await loadHealthStatus()
      
      // Dispatch global event to notify other components
      dispatchAppEvent(APP_EVENTS.DATA_SYNC_COMPLETED)
      
      showSuccess('Sync completed successfully')
    } catch (error: any) {
      showError(error.message || 'Sync failed')
    }
  }, [syncData, loadBanks, loadHealthStatus, showError, showSuccess, clearNotifications])

  // Combined health check operation
  const handleHealthCheck = useCallback(async () => {
    try {
      clearNotifications()
      await performHealthCheck()
      await loadHealthStatus()
      showSuccess('Health check completed')
    } catch (error: any) {
      showError(error.message || 'Health check failed')
    }
  }, [performHealthCheck, loadHealthStatus, showError, showSuccess, clearNotifications])

  // Combined bank connection operation
  const handleConnectBank = useCallback(async () => {
    try {
      console.log('Starting bank connection process...')
      clearNotifications()
      
      console.log('Getting link token...')
      const linkToken = await connectBank()
      console.log('Link token received:', linkToken?.substring(0, 20) + '...')
      
      console.log('Initializing Plaid...')
      const { publicToken, metadata } = await initializePlaid(linkToken)
      console.log('Plaid completed successfully, exchanging token...')
      
      await exchangeToken(publicToken, metadata)
      console.log('Token exchange completed, reloading banks...')
      
      await loadBanks()
      
      // Dispatch global event to notify other components
      dispatchAppEvent(APP_EVENTS.BANK_CONNECTION_CHANGED, {
        institution: metadata.institution
      })
      
      showSuccess('Bank connected successfully')
    } catch (error: any) {
      console.error('Bank connection error:', error)
      showError(error.message || 'Failed to connect bank')
    }
  }, [connectBank, initializePlaid, exchangeToken, loadBanks, showError, showSuccess, clearNotifications])

  // Disconnect bank operation
  const handleDisconnectBank = useCallback(async (institutionId: string) => {
    try {
      clearNotifications()
      const response = await apiService.removeBankConnection(Number(institutionId))
      if (!response || response.success === false) {
        throw new Error('Failed to disconnect bank')
      }
      await loadBanks()
      await loadHealthStatus()
      // Dispatch global event to notify other components
      dispatchAppEvent(APP_EVENTS.BANK_CONNECTION_CHANGED)
      showSuccess('Bank disconnected successfully')
    } catch (error: any) {
      showError(error.message || 'Failed to disconnect bank')
    }
  }, [loadBanks, loadHealthStatus, showError, showSuccess, clearNotifications])

  return {
    // Data
    banks,
    healthStatuses,
    
    // Loading states
    loading,
    syncing,
    connectingBank,
    checkingHealth,
    isPlaidReady,
    
    // Notifications
    error,
    successMessage,
    clearNotifications,
    
    // Operations
    handleSync,
    handleHealthCheck,
    handleConnectBank,
    handleDisconnectBank,
    loadBanks,
    loadHealthStatus
  }
}
