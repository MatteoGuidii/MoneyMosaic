import React from 'react'
import { Building2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { Bank, HealthStatus } from '../types/bank-management-types'

interface BankCardProps {
  bank: Bank
  healthStatus?: HealthStatus
  onRemove: (bankId: number) => void
}

const BankCard: React.FC<BankCardProps> = ({ bank, healthStatus, onRemove }) => {
  const isHealthy = healthStatus?.status === 'healthy'
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA')
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
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
          onClick={() => onRemove(bank.id)}
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
}

export default BankCard
