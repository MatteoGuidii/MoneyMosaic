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
    loading,
    syncing,
    checkingHealth,
    connectingBank,
    error,
    successMessage,
    connectNewBank,
    syncAll,
    checkHealth,
    removeBank,
    getHealthStatus,
    clearError,
    clearSuccessMessage
  } = useBankManagement()

  const handleConnectNewBank = () => {
    connectNewBank({ onBankConnectionChange, onSyncComplete })
  }

  const handleSyncAll = () => {
    syncAll({ onBankConnectionChange, onSyncComplete })
  }

  const handleRemoveBank = (bankId: number) => {
    removeBank(bankId, { onBankConnectionChange, onSyncComplete })
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
        onHealthCheck={checkHealth}
        connectingBank={connectingBank}
        syncing={syncing}
        checkingHealth={checkingHealth}
      />

      <BankManagementAlerts
        error={error}
        successMessage={successMessage}
        onClearError={clearError}
        onClearSuccess={clearSuccessMessage}
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
              healthStatus={getHealthStatus(bank.name)}
              onRemove={handleRemoveBank}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BankManagement
