import { useState, useCallback } from 'react'
import { Bank, HealthStatus } from '../types/bank-management-types'

export const useBankData = () => {
  const [banks, setBanks] = useState<Bank[]>([])
  const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([])
  const [loading, setLoading] = useState(true)

  const loadBanks = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions/connected_banks')
      const data = await response.json()
      setBanks(data.banks || [])
    } catch (error) {
      console.error('Error loading banks:', error)
      throw new Error('Failed to load connected banks')
    } finally {
      setLoading(false)
    }
  }, [])

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
        data.unhealthy.forEach((bankName: string) => {
          healthStatuses.push({
            institution_id: bankName,
            status: 'unhealthy',
            last_check: new Date().toISOString()
          })
        })
      }

      setHealthStatuses(healthStatuses)
    } catch (error) {
      console.error('Error loading health status:', error)
      throw new Error('Failed to load health status')
    }
  }, [])

  return {
    banks,
    healthStatuses,
    loading,
    loadBanks,
    loadHealthStatus
  }
}
