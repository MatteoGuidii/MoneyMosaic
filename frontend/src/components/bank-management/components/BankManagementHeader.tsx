import React from 'react'
import { Building2, Plus, RefreshCw, Activity } from 'lucide-react'

interface BankManagementHeaderProps {
  onConnectNewBank: () => void
  onSyncAll: () => void
  onHealthCheck: () => void
  connectingBank: boolean
  syncing: boolean
  checkingHealth: boolean
}

const BankManagementHeader: React.FC<BankManagementHeaderProps> = ({
  onConnectNewBank,
  onSyncAll,
  onHealthCheck,
  connectingBank,
  syncing,
  checkingHealth
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Connected Banks
        </h2>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onConnectNewBank}
          disabled={connectingBank}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-md transition-colors"
        >
          <Plus className={`h-4 w-4 ${connectingBank ? 'animate-pulse' : ''}`} />
          <span>{connectingBank ? 'Connecting...' : 'Connect New Bank'}</span>
        </button>
        <button
          onClick={onSyncAll}
          disabled={syncing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync All'}</span>
        </button>
        <button
          onClick={onHealthCheck}
          disabled={checkingHealth}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors"
        >
          <Activity className={`h-4 w-4 ${checkingHealth ? 'animate-pulse' : ''}`} />
          <span>{checkingHealth ? 'Checking...' : 'Health Check'}</span>
        </button>
      </div>
    </div>
  )
}

export default BankManagementHeader
