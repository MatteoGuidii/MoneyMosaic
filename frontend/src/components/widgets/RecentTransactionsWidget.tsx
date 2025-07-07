import React, { useState, useEffect } from 'react'
import { Receipt, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react'
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
      const response = await apiService.fetchTransactions('7', [], '', 1)
      setTransactions(response.transactions.slice(0, 5))
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="small" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 days</p>
          </div>
        </div>
        <Link
          to="/transactions"
          className="flex items-center space-x-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No recent transactions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {transaction.amount > 0 ? (
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <ArrowDownRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {transaction.merchant_name || transaction.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${
                  transaction.amount > 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecentTransactionsWidget
