import React from 'react'
import { Download } from 'lucide-react'
import SyncButton from '../../../components/SyncButton'

interface AccountsHeaderProps {
  onSync: () => void
  onExport: () => void
}

const AccountsHeader: React.FC<AccountsHeaderProps> = ({
  onSync,
  onExport
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Account Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Comprehensive overview of your connected accounts and financial health
        </p>
      </div>
      <div className="flex items-center gap-3">
        <SyncButton 
          variant="button" 
          onSyncComplete={onSync}
        />
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  )
}

export default AccountsHeader
