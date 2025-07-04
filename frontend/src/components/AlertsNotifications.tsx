import React, { useState, useEffect } from 'react'
import { Bell, AlertTriangle, Info, DollarSign, Clock, X, CheckCircle } from 'lucide-react'
import { apiService, Alert } from '../services/apiService'
import LoadingSpinner from './LoadingSpinner'

interface AlertsNotificationsProps {
  className?: string
}

const AlertsNotifications: React.FC<AlertsNotificationsProps> = ({ className = '' }) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const alertsData = await apiService.fetchAlerts()
      setAlerts(alertsData)
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (alertId: string) => {
    try {
      await apiService.markAlertAsRead(alertId)
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ))
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'large_transaction':
        return <DollarSign className="w-5 h-5" />
      case 'low_balance':
        return <AlertTriangle className="w-5 h-5" />
      case 'recurring_payment':
        return <Clock className="w-5 h-5" />
      case 'budget_exceeded':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getAlertColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200'
    }
  }

  const getIconColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'info':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.read
    if (filter === 'read') return alert.read
    return true
  })

  const unreadCount = alerts.filter(alert => !alert.read).length

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-navy-600 dark:text-teal-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alerts & Notifications
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                     focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          >
            <option value="all">All Alerts</option>
            <option value="unread">Unread ({unreadCount})</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'unread' ? 'No unread alerts' : 'No alerts to show'}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 relative ${getAlertColor(alert.severity)} ${
                  alert.read ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 ${getIconColor(alert.severity)}`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatDate(alert.date)}</span>
                          {alert.amount && (
                            <span className="font-medium">
                              {formatCurrency(alert.amount)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {alert.read && (
                          <CheckCircle className="w-4 h-4 text-success-500" />
                        )}
                        {!alert.read && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            title="Mark as read"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {!alert.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default AlertsNotifications
