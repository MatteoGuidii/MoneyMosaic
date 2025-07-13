import React from 'react'

interface BankManagementAlertsProps {
  error: string | null
  successMessage: string | null
  onClearError: () => void
  onClearSuccess: () => void
}

const BankManagementAlerts: React.FC<BankManagementAlertsProps> = ({
  error,
  successMessage,
  onClearError,
  onClearSuccess
}) => {
  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={onClearError}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded-md flex justify-between items-center">
          <span>{successMessage}</span>
          <button
            onClick={onClearSuccess}
            className="ml-4 text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}

export default BankManagementAlerts
