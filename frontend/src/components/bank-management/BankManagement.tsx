import React from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'
import { BankManagementProps } from './types/bank-management-types'
import { useBankManagement } from './hooks/useBankManagement'
import BankManagementHeader from './components/BankManagementHeader'
import BankManagementAlerts from './components/BankManagementAlerts'
import BankCard from './components/BankCard'
import BankEmptyState from './components/BankEmptyState'

const BankManagement: React.FC<BankManagementProps> = ({ 
  onBankConnectionChange,
  onSyncComplete 
}) => {
  const {
    banks,
    healthStatuses,
    loading,
    syncing,
    checkingHealth,
    connectingBank,
    error,
    successMessage,
    handleConnectBank,
    handleSync,
    handleHealthCheck,
    handleDisconnectBank,
    clearNotifications
  } = useBankManagement()

  const handleConnectNewBank = async () => {
    try {
      await handleConnectBank()
      onBankConnectionChange?.()
    } catch (error) {
      // Error handling is done in handleConnectBank
      console.error('Error connecting bank:', error)
    }
  }

  const handleSyncAll = () => {
    handleSync().then(() => {
      onSyncComplete?.()
    })
  }

  const handleRemoveBank = (institutionId: string) => {
    handleDisconnectBank(institutionId).then(() => {
      onBankConnectionChange?.()
    })
  }

  const getHealthStatus = (institutionId: number | string) => {
    const key = String(institutionId)
    return healthStatuses.find(status => String(status.institution_id) === key) || { status: 'unknown', institution_id: key, last_check: new Date().toISOString() }
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
      <BankManagementHeader
        onConnectNewBank={handleConnectNewBank}
        onSyncAll={handleSyncAll}
        onHealthCheck={handleHealthCheck}
        connectingBank={connectingBank}
        syncing={syncing}
        checkingHealth={checkingHealth}
      />

      <BankManagementAlerts
        error={error}
        successMessage={successMessage}
        onClearError={clearNotifications}
        onClearSuccess={clearNotifications}
      />

      {banks.length === 0 ? (
        <BankEmptyState
          onConnectFirstBank={handleConnectNewBank}
          connectingBank={connectingBank}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banks.map((bank) => (
            <BankCard
              key={bank.id}
              bank={bank}
              healthStatus={getHealthStatus(bank.id) as any}
              onRemove={(bankId: number) => handleRemoveBank(String(bankId))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BankManagement
