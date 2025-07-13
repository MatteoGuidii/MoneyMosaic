/// <reference path="../../../types/window.d.ts" />
import { useState, useEffect, useCallback } from 'react'
import { HealthStatus, BankManagementState } from '../types/bank-management-types'

export const useBankManagement = () => {
  const [state, setState] = useState<BankManagementState>({
    banks: [],
    healthStatuses: [],
    loading: true,
    syncing: false,
    checkingHealth: false,
    connectingBank: false,
    error: null,
    successMessage: null
  })

  const updateState = useCallback((updates: Partial<BankManagementState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const loadBanks = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions/connected_banks')
      const data = await response.json()
      updateState({ banks: data.banks || [] })
    } catch (error) {
      console.error('Error loading banks:', error)
      updateState({ error: 'Failed to load connected banks' })
    } finally {
      updateState({ loading: false })
    }
  }, [updateState])

  const loadHealthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions/health_check')
      const data = await response.json()
      
      const healthStatuses: HealthStatus[] = []
      
      // Add healthy banks
      if (data.healthy && Array.isArray(data.healthy)) {
        data.healthy.forEach((bankName: string) => {
          healthStatuses.push({
            institution_id: bankName,
            status: 'healthy',
            last_check: new Date().toISOString()
          })
        })
      }
      
      // Add unhealthy banks
      if (data.unhealthy && Array.isArray(data.unhealthy)) {
        data.unhealthy.forEach((bank: { name: string; error: string }) => {
          healthStatuses.push({
            institution_id: bank.name,
            status: 'unhealthy',
            last_check: new Date().toISOString(),
            error: bank.error
          })
        })
      }
      
      updateState({ healthStatuses })
      
      // Log health check results for debugging
      console.log('=== Health Check Results ===', {
        healthy: data.healthy,
        unhealthy: data.unhealthy,
        total: healthStatuses.length,
        timestamp: new Date().toISOString()
      })
      console.log('Health check completed at:', new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Error loading health status:', error)
    }
  }, [updateState])

  const createLinkToken = useCallback(async () => {
    try {
      const response = await fetch('/api/link/token/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.link_token) {
        return data.link_token
      } else {
        throw new Error('Failed to create link token')
      }
    } catch (error) {
      console.error('Error creating link token:', error)
      updateState({ error: 'Failed to create link token' })
      return null
    }
  }, [updateState])

  const handlePlaidSuccess = useCallback(async (publicToken: string, metadata: any, callbacks: {
    onBankConnectionChange?: () => Promise<void>
    onSyncComplete?: () => Promise<void>
  }) => {
    try {
      updateState({ connectingBank: true, error: null })
      
      const response = await fetch('/api/token/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_token: publicToken,
          institution: metadata.institution
        }),
      })
      
      const data = await response.json()
      if (data.success || data.access_token) {
        // Refresh the banks list
        await loadBanks()
        await loadHealthStatus()
        updateState({ error: null })
        
        // Trigger callbacks
        if (callbacks.onBankConnectionChange) {
          await callbacks.onBankConnectionChange()
        }
        if (callbacks.onSyncComplete) {
          await callbacks.onSyncComplete()
        }
      } else {
        updateState({ error: 'Failed to connect bank' })
      }
    } catch (error) {
      console.error('Error connecting bank:', error)
      updateState({ error: 'Failed to connect bank' })
    } finally {
      updateState({ connectingBank: false })
    }
  }, [updateState, loadBanks, loadHealthStatus])

  const handlePlaidExit = useCallback((err: any) => {
    if (err) {
      console.error('Plaid Link error:', err)
      updateState({ error: 'Bank connection was cancelled or failed' })
    }
    updateState({ connectingBank: false })
  }, [updateState])

  const connectNewBank = useCallback(async (callbacks: {
    onBankConnectionChange?: () => Promise<void>
    onSyncComplete?: () => Promise<void>
  }) => {
    if (!window.Plaid) {
      updateState({ error: 'Plaid Link is not loaded. Please refresh the page.' })
      return
    }

    updateState({ connectingBank: true, error: null })

    try {
      const token = await createLinkToken()
      if (!token) {
        updateState({ connectingBank: false })
        return
      }

      const handler = window.Plaid.create({
        token: token,
        onSuccess: (publicToken: string, metadata: any) => handlePlaidSuccess(publicToken, metadata, callbacks),
        onExit: handlePlaidExit,
        onEvent: (eventName: string, metadata: any) => {
          console.log('Plaid event:', eventName, metadata)
        }
      })

      handler.open()
    } catch (error) {
      console.error('Error opening Plaid Link:', error)
      updateState({ error: 'Failed to open bank connection', connectingBank: false })
    }
  }, [updateState, createLinkToken, handlePlaidSuccess, handlePlaidExit])

  const syncAll = useCallback(async (callbacks: {
    onBankConnectionChange?: () => Promise<void>
    onSyncComplete?: () => Promise<void>
  }) => {
    updateState({ syncing: true, error: null })
    try {
      const response = await fetch('/api/transactions/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        await loadBanks()
        updateState({ error: null })
        
        if (callbacks.onSyncComplete) {
          await callbacks.onSyncComplete()
        }
        if (callbacks.onBankConnectionChange) {
          await callbacks.onBankConnectionChange()
        }
      } else {
        updateState({ error: 'Sync failed' })
      }
    } catch (error) {
      console.error('Error syncing:', error)
      updateState({ error: 'Failed to sync transactions' })
    } finally {
      updateState({ syncing: false })
    }
  }, [updateState, loadBanks])

  const checkHealth = useCallback(async () => {
    updateState({ checkingHealth: true, error: null, successMessage: null })
    try {
      const response = await fetch('/api/transactions/health_check')
      const data = await response.json()
      
      await loadHealthStatus()
      
      const healthyCount = data.healthy?.length || 0
      const unhealthyCount = data.unhealthy?.length || 0
      const total = healthyCount + unhealthyCount
      
      let message = `Health check completed! `
      if (total === 0) {
        message += 'No banks connected.'
      } else {
        message += `${healthyCount} healthy, ${unhealthyCount} unhealthy connection(s).`
      }
      
      updateState({ successMessage: message })
      
      // Clear success message after 5 seconds
      setTimeout(() => updateState({ successMessage: null }), 5000)
    } catch (error) {
      console.error('Error checking health:', error)
      updateState({ error: 'Failed to check connection health' })
    } finally {
      updateState({ checkingHealth: false })
    }
  }, [updateState, loadHealthStatus])

  const removeBank = useCallback(async (institutionId: number, callbacks: {
    onBankConnectionChange?: () => Promise<void>
    onSyncComplete?: () => Promise<void>
  }) => {
    if (!window.confirm('Are you sure you want to remove this bank connection?')) {
      return
    }

    try {
      const response = await fetch(`/api/transactions/banks/${institutionId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        await loadBanks()
        await loadHealthStatus()
        updateState({ error: null })
        
        if (callbacks.onBankConnectionChange) {
          await callbacks.onBankConnectionChange()
        }
        if (callbacks.onSyncComplete) {
          await callbacks.onSyncComplete()
        }
      } else {
        updateState({ error: 'Failed to remove bank connection' })
      }
    } catch (error) {
      console.error('Error removing bank:', error)
      updateState({ error: 'Failed to remove bank connection' })
    }
  }, [updateState, loadBanks, loadHealthStatus])

  const getHealthStatus = useCallback((bankName: string) => {
    return state.healthStatuses.find(status => status.institution_id === bankName)
  }, [state.healthStatuses])

  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  const clearSuccessMessage = useCallback(() => {
    updateState({ successMessage: null })
  }, [updateState])

  useEffect(() => {
    loadBanks()
    loadHealthStatus()
  }, [loadBanks, loadHealthStatus])

  return {
    ...state,
    connectNewBank,
    syncAll,
    checkHealth,
    removeBank,
    getHealthStatus,
    clearError,
    clearSuccessMessage
  }
}
