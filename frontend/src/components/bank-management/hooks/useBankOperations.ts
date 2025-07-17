import { useState, useCallback } from 'react'

export const useBankOperations = () => {
  const [syncing, setSyncing] = useState(false)
  const [connectingBank, setConnectingBank] = useState(false)
  const [checkingHealth, setCheckingHealth] = useState(false)

  const syncData = useCallback(async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/transactions/sync', { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Sync failed')
      }
      
      return data
    } catch (error) {
      console.error('Error syncing data:', error)
      throw error
    } finally {
      setSyncing(false)
    }
  }, [])

  const performHealthCheck = useCallback(async () => {
    setCheckingHealth(true)
    try {
      const response = await fetch('/api/transactions/health_check')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error performing health check:', error)
      throw error
    } finally {
      setCheckingHealth(false)
    }
  }, [])

  const connectBank = useCallback(async () => {
    setConnectingBank(true)
    try {
      const response = await fetch('/api/link/token/create', { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get link token')
      }
      
      return data.link_token
    } catch (error) {
      console.error('Error connecting bank:', error)
      throw error
    } finally {
      setConnectingBank(false)
    }
  }, [])

  return {
    syncing,
    connectingBank,
    checkingHealth,
    syncData,
    performHealthCheck,
    connectBank
  }
}
