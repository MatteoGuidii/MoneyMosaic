import React, { useState, useEffect } from 'react'
import { Receipt, ArrowUpRight } from 'lucide-react'
import { apiService, Transaction } from '../../services/apiService'
import LoadingSpinner from '../ui/LoadingSpinner'
import { Link } from 'react-router-dom'

const RecentTransactionsWidget: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const response = await apiService.fetchTransactions('7', [], '', 1) // Last 7 days, first page
      setTransactions(response.transactions.slice(0, 5)) // Only show 5 most recent
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="small" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
        </div>
        <Link 
          to="/transactions" 
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1"
        >
          <span>View All</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          No recent transactions
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.transaction_id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {transaction.merchant_name || transaction.name}
                  </p>
                  <p className={`text-sm font-semibold ${
                    transaction.amount >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Array.isArray(transaction.category) && transaction.category.length > 0 
                      ? transaction.category.join(', ') 
                      : 'Other'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecentTransactionsWidget
