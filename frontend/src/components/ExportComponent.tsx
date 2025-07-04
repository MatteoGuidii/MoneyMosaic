import React, { useState } from 'react'
import { Download, FileText, Table, Calendar, Loader2 } from 'lucide-react'
import { apiService } from '../services/apiService'

interface ExportComponentProps {
  className?: string
}

const ExportComponent: React.FC<ExportComponentProps> = ({ className = '' }) => {
  const [loading, setLoading] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf'>('csv')
  const [selectedRange, setSelectedRange] = useState('30')

  const handleExport = async () => {
    try {
      setLoading(true)
      const blob = await apiService.exportTransactions(selectedFormat, selectedRange)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions_${selectedRange}days.${selectedFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
    } finally {
      setLoading(false)
    }
  }

  const dateRangeOptions = [
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' },
    { value: '365', label: '1 Year' },
    { value: 'all', label: 'All Time' }
  ]

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <Download className="w-5 h-5 text-navy-600 dark:text-teal-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Export Data
        </h3>
      </div>

      <div className="space-y-4">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedFormat('csv')}
              className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
                selectedFormat === 'csv'
                  ? 'border-navy-500 bg-navy-50 dark:bg-navy-900 text-navy-700 dark:text-navy-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Table className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">CSV</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Spreadsheet format
                </p>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedFormat('pdf')}
              className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
                selectedFormat === 'pdf'
                  ? 'border-navy-500 bg-navy-50 dark:bg-navy-900 text-navy-700 dark:text-navy-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <FileText className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">PDF</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Formatted report
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Date Range Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                       focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 
                   bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 
                   text-white rounded-md transition-colors"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span>
            {loading ? 'Exporting...' : `Export as ${selectedFormat.toUpperCase()}`}
          </span>
        </button>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Export Information
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                {selectedFormat === 'csv' 
                  ? 'CSV files can be opened in Excel, Google Sheets, or any spreadsheet application. Perfect for data analysis and custom reporting.'
                  : 'PDF files provide a formatted report with charts and summaries. Great for sharing and archiving.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportComponent
