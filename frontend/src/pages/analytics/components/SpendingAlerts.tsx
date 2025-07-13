import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { SpendingAlertsProps } from '../types'
import { formatCurrency, getSeverityColor } from '../utils'

const SpendingAlerts: React.FC<SpendingAlertsProps> = ({ alerts }) => {
  if (!alerts || (alerts.spendingAlerts.length === 0 && alerts.budgetAlerts.length === 0)) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
      <div className="flex items-center mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Spending Alerts
        </h2>
      </div>
      <div className="space-y-3">
        {alerts.spendingAlerts.map((alert, index) => (
          <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{alert.message}</p>
                <p className="text-sm opacity-75">{alert.date}</p>
              </div>
              <span className="font-bold">{formatCurrency(alert.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SpendingAlerts
