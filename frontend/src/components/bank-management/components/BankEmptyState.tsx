import React from 'react'
import { Building2 } from 'lucide-react'

interface BankEmptyStateProps {
  onConnectFirstBank: () => void
  connectingBank: boolean
}

const BankEmptyState: React.FC<BankEmptyStateProps> = ({ onConnectFirstBank, connectingBank }) => {
  return (
    <div className="text-center py-8">
      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-400">No banks connected yet</p>
      <button
        onClick={onConnectFirstBank}
        disabled={connectingBank}
        className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-md transition-colors"
      >
        {connectingBank ? 'Connecting...' : 'Connect Your First Bank'}
      </button>
    </div>
  )
}

export default BankEmptyState
