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

      // Build a lookup of bank name -> id from the latest banks list
      const nameToId = new Map<string, number | string>()
      for (const b of banks) {
        nameToId.set(b.name, b.id)
      }
      
      const healthStatuses: HealthStatus[] = []
      
      // Add healthy banks
      if (Array.isArray(data.healthy)) {
        data.healthy.forEach((bankName: string) => {
          const institution_id = nameToId.get(bankName) ?? bankName
          healthStatuses.push({
            institution_id: String(institution_id),
            status: 'healthy',
            last_check: new Date().toISOString()
          })
        })
      }

      // Add unhealthy banks
      if (Array.isArray(data.unhealthy)) {
        data.unhealthy.forEach((bankName: string) => {
          const institution_id = nameToId.get(bankName) ?? bankName
          healthStatuses.push({
            institution_id: String(institution_id),
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
  }, [banks])

  return {
    banks,
    healthStatuses,
    loading,
    loadBanks,
    loadHealthStatus
  }
}
