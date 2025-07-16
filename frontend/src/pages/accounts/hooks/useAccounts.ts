import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import { Account } from '../../../services/types'
import { UseAccountsReturn } from '../types'
import { exportAccountsToCSV } from '../utils'

export const useAccounts = (
  onSuccess: (message: string) => void,
  onError: (message: string) => void
): UseAccountsReturn => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  const loadAccounts = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true)
      const accountsData = await apiService.fetchAccounts()
      setAccounts(accountsData)
    } catch (error) {
      console.error('Error loading accounts:', error)
      onError('Failed to load accounts')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const handleBankConnectionChange = async () => {
    await loadAccounts()
    onSuccess('Bank connection updated successfully!')
  }

  const handleSyncComplete = async () => {
    await loadAccounts()
    onSuccess('Account sync completed!')
  }

  const handleSyncAccount = async (accountId: string) => {
    try {
      console.log('Syncing account:', accountId)
      onSuccess('Account sync initiated')
    } catch (error) {
      onError('Failed to sync account')
    }
  }

  const handleViewTransactions = (accountId: string) => {
    console.log('View transactions for account:', accountId)
  }

  const handleDeleteAccount = async (accountId: string) => {
    try {
      console.log('Disconnecting account:', accountId)
      await apiService.deleteAccount(accountId)
      onSuccess('Account disconnected successfully')
      await loadAccounts()
    } catch (error) {
      onError('Failed to disconnect account')
    }
  }

  const handleExportAccounts = () => {
    try {
      exportAccountsToCSV(accounts)
      onSuccess('Accounts exported successfully!')
    } catch (error) {
      console.error('Error exporting accounts:', error)
      onError('Failed to export accounts')
    }
  }

  useEffect(() => {
    loadAccounts(true)
  }, [])

  return {
    accounts,
    loading,
    loadAccounts,
    handleBankConnectionChange,
    handleSyncComplete,
    handleSyncAccount,
    handleViewTransactions,
    handleDeleteAccount,
    handleExportAccounts
  }
}
