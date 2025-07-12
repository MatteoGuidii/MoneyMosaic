import React, { useState, useEffect } from 'react'
import { Building2, Plus, RefreshCw, Activity, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import LoadingSpinner from './ui/LoadingSpinner'

// Plaid Link types
declare global {
  interface Window {
    Plaid: any;
  }
}

interface Bank {
  id: number
  institution_id: string
  name: string
  created_at: string
  updated_at: string
  is_active: boolean
}

interface HealthStatus {
  institution_id: string
  status: string
  last_check: string
  error?: string
}

interface BankManagementProps {
  onBankConnectionChange?: () => Promise<void>
  onSyncComplete?: () => Promise<void>
}

const BankManagement: React.FC<BankManagementProps> = ({ 
  onBankConnectionChange,
  onSyncComplete 
}) => {
  const [banks, setBanks] = useState<Bank[]>([])
  const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [checkingHealth, setCheckingHealth] = useState(false)
  const [connectingBank, setConnectingBank] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadBanks()
    loadHealthStatus()
  }, [])

  const loadBanks = async () => {
    try {
      const response = await fetch('/api/transactions/connected_banks')
      const data = await response.json()
      setBanks(data.banks || [])
    } catch (error) {
      console.error('Error loading banks:', error)
      setError('Failed to load connected banks')
    } finally {
      setLoading(false)
    }
  }

  const loadHealthStatus = async () => {
    try {
      const response = await fetch('/api/transactions/health_check')
      const data = await response.json()
      
      // Convert backend response format to frontend format
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
      
      setHealthStatuses(healthStatuses)
      
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
  }

  const createLinkToken = async () => {
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
      setError('Failed to create link token')
      return null
    }
  }

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      setConnectingBank(true)
      setError(null)
      
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
        setError(null)
        
        // Trigger dashboard refresh
        if (onBankConnectionChange) {
          await onBankConnectionChange()
        }
        
        // Also trigger sync complete to refresh all related components
        if (onSyncComplete) {
          await onSyncComplete()
        }
      } else {
        setError('Failed to connect bank')
      }
    } catch (error) {
      console.error('Error connecting bank:', error)
      setError('Failed to connect bank')
    } finally {
      setConnectingBank(false)
    }
  }

  const handlePlaidExit = (err: any, _metadata: any) => {
    if (err) {
      console.error('Plaid Link error:', err)
      setError('Bank connection was cancelled or failed')
    }
    setConnectingBank(false)
  }

  const handleConnectNewBank = async () => {
    if (!window.Plaid) {
      setError('Plaid Link is not loaded. Please refresh the page.')
      return
    }

    setConnectingBank(true)
    setError(null)

    try {
      const token = await createLinkToken()
      if (!token) {
        setConnectingBank(false)
        return
      }

      const handler = window.Plaid.create({
        token: token,
        onSuccess: handlePlaidSuccess,
        onExit: handlePlaidExit,
        onEvent: (eventName: string, metadata: any) => {
          console.log('Plaid event:', eventName, metadata)
        }
      })

      handler.open()
    } catch (error) {
      console.error('Error opening Plaid Link:', error)
      setError('Failed to open bank connection')
      setConnectingBank(false)
    }
  }

  const handleSyncAll = async () => {
    setSyncing(true)
    setError(null)
    try {
      const response = await fetch('/api/transactions/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        // Refresh banks data after sync
        await loadBanks()
        setError(null)
        
        // Trigger dashboard refresh
        if (onSyncComplete) {
          await onSyncComplete()
        }
        
        // Also trigger bank connection change to refresh all related components
        if (onBankConnectionChange) {
          await onBankConnectionChange()
        }
      } else {
        setError('Sync failed')
      }
    } catch (error) {
      console.error('Error syncing:', error)
      setError('Failed to sync transactions')
    } finally {
      setSyncing(false)
    }
  }

  const handleHealthCheck = async () => {
    setCheckingHealth(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch('/api/transactions/health_check')
      const data = await response.json()
      
      // Update health status first
      await loadHealthStatus()
      
      // Create detailed success message
      const healthyCount = data.healthy?.length || 0
      const unhealthyCount = data.unhealthy?.length || 0
      const total = healthyCount + unhealthyCount
      
      let message = `Health check completed! `
      if (total === 0) {
        message += 'No banks connected.'
      } else {
        message += `${healthyCount} healthy, ${unhealthyCount} unhealthy connection(s).`
      }
      
      setSuccessMessage(message)
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (error) {
      console.error('Error checking health:', error)
      setError('Failed to check connection health')
    } finally {
      setCheckingHealth(false)
    }
  }

  const handleRemoveBank = async (institutionId: number) => {
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
        setError(null)
        
        // Trigger dashboard refresh
        if (onBankConnectionChange) {
          await onBankConnectionChange()
        }
        
        // Also trigger sync complete to refresh all related components
        if (onSyncComplete) {
          await onSyncComplete()
        }
      } else {
        setError('Failed to remove bank connection')
      }
    } catch (error) {
      console.error('Error removing bank:', error)
      setError('Failed to remove bank connection')
    }
  }

  const getHealthStatus = (bankName: string) => {
    return healthStatuses.find(status => status.institution_id === bankName)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Connected Banks
          </h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleConnectNewBank}
            disabled={connectingBank}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-md transition-colors"
          >
            <Plus className={`h-4 w-4 ${connectingBank ? 'animate-pulse' : ''}`} />
            <span>{connectingBank ? 'Connecting...' : 'Connect New Bank'}</span>
          </button>
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync All'}</span>
          </button>
          <button
            onClick={handleHealthCheck}
            disabled={checkingHealth}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors"
          >
            <Activity className={`h-4 w-4 ${checkingHealth ? 'animate-pulse' : ''}`} />
            <span>{checkingHealth ? 'Checking...' : 'Health Check'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded-md">
          {successMessage}
        </div>
      )}

      {banks.length === 0 ? (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No banks connected yet</p>
          <button
            onClick={handleConnectNewBank}
            disabled={connectingBank}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-md transition-colors"
          >
            {connectingBank ? 'Connecting...' : 'Connect Your First Bank'}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banks.map((bank) => {
            const healthStatus = getHealthStatus(bank.name)
            const isHealthy = healthStatus?.status === 'healthy'
            
            return (
              <div
                key={bank.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {bank.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Connected: {formatDate(bank.created_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveBank(bank.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                    title="Remove bank connection"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isHealthy ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className={`text-sm ${
                      isHealthy 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {healthStatus?.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Last updated: {formatDate(bank.updated_at)}
                    </div>
                    {healthStatus?.last_check && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Health check: {new Date(healthStatus.last_check).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>

                {healthStatus?.error && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-xs text-red-600 dark:text-red-400">
                    {healthStatus.error}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default BankManagement
