import React, { useState, useEffect } from 'react'
import FilterBar from '../components/FilterBar'
import TransactionsTable from '../components/TransactionsTable'
import TopMerchants from '../components/TopMerchants'
import ExportComponent from '../components/ExportComponent'
import LoadingSpinner from '../components/LoadingSpinner'
import { apiService, Transaction } from '../services/apiService'
import { Receipt, Search, Filter, Download } from 'lucide-react'

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedDateRange, setSelectedDateRange] = useState('30')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [selectedDateRange, selectedCategories, searchTerm, currentPage])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const categoriesData = await apiService.fetchCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTransactions = async () => {
    try {
      const transactionsResponse = await apiService.fetchTransactions(
        selectedDateRange,
        selectedCategories,
        searchTerm,
        currentPage
      )
      setTransactions(transactionsResponse.transactions)
      setTotalTransactions(transactionsResponse.total)
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range)
    setCurrentPage(1)
  }

  const handleCategoryFilter = (categories: string[]) => {
    setSelectedCategories(categories)
    setCurrentPage(1)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const totalSpending = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {totalTransactions.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Spending</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {formatCurrency(totalSpending)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-navy-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Net Flow</span>
          </div>
          <p className={`text-2xl font-bold mt-1 ${
            totalIncome - totalSpending >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(totalIncome - totalSpending)}
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filter Transactions
            </h3>
          </div>
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-navy-600 hover:bg-navy-700 
                     text-white rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        <FilterBar
          categories={categories}
          selectedDateRange={selectedDateRange}
          selectedCategories={selectedCategories}
          onDateRangeChange={handleDateRangeChange}
          onCategoryFilter={handleCategoryFilter}
          onSearch={handleSearch}
        />
      </div>

      {/* Export Panel */}
      {showExport && (
        <ExportComponent />
      )}

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Transactions
            </h3>
          </div>
        </div>
        <TransactionsTable
          transactions={transactions}
          currentPage={currentPage}
          totalTransactions={totalTransactions}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Top Merchants */}
      <TopMerchants />
    </div>
  )
}

export default Transactions
