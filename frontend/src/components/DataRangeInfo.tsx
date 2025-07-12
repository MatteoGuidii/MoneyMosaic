import React, { useState, useEffect } from 'react'
import { Calendar, Info, AlertCircle } from 'lucide-react'

interface DateRangeInfo {
  institutionId: number
  institutionName: string
  earliestDate: string | null
  latestDate: string | null
  availableTransactionCount: number
  error?: string
}

interface DataRangeInfoProps {
  onRefresh?: () => void
  selectedDateRange?: string
  customDateRange?: { start: string; end: string }
}

const DataRangeInfo: React.FC<DataRangeInfoProps> = ({ onRefresh, selectedDateRange, customDateRange }) => {
  const [dateRanges, setDateRanges] = useState<DateRangeInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDateRanges()
  }, [])

  const fetchDateRanges = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/transactions/date-range')
      const data = await response.json()
      
      if (data.success) {
        setDateRanges(data.institutions)
      } else {
        setError('Failed to fetch date ranges')
      }
    } catch (err) {
      console.error('Error fetching date ranges:', err)
      setError('Failed to fetch date ranges')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSelectedDateRangeDisplay = () => {
    if (customDateRange && customDateRange.start && customDateRange.end) {
      return `${formatDate(customDateRange.start)} - ${formatDate(customDateRange.end)}`
    }
    
    if (selectedDateRange) {
      const days = parseInt(selectedDateRange)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      return `${formatDate(startDate.toISOString().split('T')[0])} - ${formatDate(endDate.toISOString().split('T')[0])}`
    }
    
    return null
  }

  if (loading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Checking available transaction data...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-800 dark:text-red-200">
            Error: {error}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Available Transaction Data
          </h3>
          
          {dateRanges.length === 0 ? (
            <p className="text-sm text-blue-700 dark:text-blue-300">
              No institutions connected.
            </p>
          ) : (
            <div className="space-y-2">
              {dateRanges.map((range) => (
                <div key={range.institutionId} className="text-sm">
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    {range.institutionName}
                  </div>
                  <div className="text-blue-700 dark:text-blue-300">
                    {range.availableTransactionCount > 0 ? (
                      <>
                        <span className="font-medium">{range.availableTransactionCount}</span> transactions available
                        {getSelectedDateRangeDisplay() ? (
                          <span className="ml-1">
                            ({getSelectedDateRangeDisplay()})
                          </span>
                        ) : range.earliestDate && range.latestDate ? (
                          <span className="ml-1">
                            ({formatDate(range.earliestDate)} - {formatDate(range.latestDate)})
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span>No transaction data available</span>
                    )}
                  </div>
                  {range.error && (
                    <div className="text-red-600 dark:text-red-400 text-xs mt-1">
                      {range.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
            {getSelectedDateRangeDisplay() && (
              <p className="mb-2">
                <strong>Selected Range:</strong> {getSelectedDateRangeDisplay()}
              </p>
            )}
            <p>
              <strong>Note:</strong> The available date range depends on your bank's data sharing policy. 
              Some banks only provide recent transactions (30-180 days), while others may provide up to 2 years of history.
            </p>
            <p className="mt-1">
              <strong>Tip:</strong> Data is updated automatically when you sync your accounts. 
              If you need more historical data, try using the sync button above.
            </p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="mt-2 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-200"
              >
                Sync to get more historical data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataRangeInfo
