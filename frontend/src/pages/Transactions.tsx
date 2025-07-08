import React, { useState, useEffect } from 'react'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { apiService, Transaction } from '../services/apiService'
import { TrendingUp, PieChart as PieChartIcon, Download } from 'lucide-react'

// Import new components
import TrendsChart from '../components/charts/TrendsChart'
import PieChart from '../components/charts/PieChart'
import InsightsWidget, { generateTransactionInsights } from '../components/widgets/InsightsWidget'
import StatsCard from '../components/widgets/StatsCard'
import TransactionsFilter from '../components/TransactionsFilter'
import TransactionsDataTable from '../components/TransactionsDataTable'

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [accounts, setAccounts] = useState<string[]>([])
  const [selectedDateRange, setSelectedDateRange] = useState('30')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [amountRange, setAmountRange] = useState({ min: 0, max: 10000 })
  const [sortField, setSortField] = useState('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [previousPeriodTransactions, setPreviousPeriodTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [selectedDateRange, selectedCategories, selectedAccounts, searchTerm, currentPage, amountRange, sortField, sortDirection])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const categoriesData = await apiService.fetchCategories()
      setCategories(categoriesData)
      
      // Load accounts
      try {
        const accountsData = await apiService.fetchAccounts()
        setAccounts(accountsData.map((acc: any) => acc.name || acc.id))
      } catch (error) {
        console.log('Accounts endpoint not available')
      }
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
        selectedCategories.length > 0 ? selectedCategories : undefined,
        searchTerm || undefined,
        currentPage,
        undefined, // startDate
        selectedAccounts.length > 0 ? selectedAccounts : undefined,
        amountRange.min > 0 ? amountRange.min : undefined,
        amountRange.max < 10000 ? amountRange.max : undefined,
        sortField,
        sortDirection
      )
      setTransactions(transactionsResponse.transactions)
      setTotalTransactions(transactionsResponse.total)

      // Load previous period for comparison
      try {
        const prevStartDate = new Date(Date.now() - parseInt(selectedDateRange) * 24 * 60 * 60 * 1000 * 2).toISOString()
        const prevPeriodResponse = await apiService.fetchTransactions(
          selectedDateRange,
          selectedCategories.length > 0 ? selectedCategories : undefined,
          searchTerm || undefined,
          1,
          prevStartDate
        )
        setPreviousPeriodTransactions(prevPeriodResponse.transactions)
      } catch (error) {
        console.log('Could not load previous period data')
      }
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

  const handleAccountFilter = (accounts: string[]) => {
    setSelectedAccounts(accounts)
    setCurrentPage(1)
  }

  const handleAmountRangeChange = (range: { min: number; max: number }) => {
    setAmountRange(range)
    setCurrentPage(1)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field)
    setSortDirection(direction)
  }

  const handleClearFilters = () => {
    setSelectedCategories([])
    setSelectedAccounts([])
    setAmountRange({ min: 0, max: 10000 })
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleExport = async () => {
    try {
      if (transactions.length === 0) {
        alert('No transactions to export')
        return
      }

      const csvData = transactions.map(t => ({
        Date: t.date,
        Description: t.name.replace(/,/g, ';'), // Replace commas to avoid CSV issues
        Amount: t.amount,
        Category: t.category,
        Account: t.account_name || t.account_id,
        Status: t.pending ? 'Pending' : 'Posted'
      }))
      
      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions_${selectedDateRange}_days.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting transactions:', error)
    }
  }

  // Calculate analytics data
  const getAnalyticsData = () => {
    // Transaction trends data for chart
    const trendsData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dayTransactions = transactions.filter(t => 
        new Date(t.date).toDateString() === date.toDateString()
      )
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: dayTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
        spending: dayTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
        net: dayTransactions.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : -t.amount), 0)
      }
    })

    // Category breakdown data
    const categoryTotals = transactions.reduce((acc, t) => {
      if (t.amount > 0) {
        acc[t.category] = (acc[t.category] || 0) + t.amount
      }
      return acc
    }, {} as Record<string, number>)

    const totalSpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']
    
    const categoryData = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage: (amount / totalSpending) * 100,
        color: colors[index % colors.length]
      }))

    return { trendsData, categoryData }
  }

  const { trendsData, categoryData } = getAnalyticsData()
  const insights = generateTransactionInsights(transactions, previousPeriodTransactions)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transaction Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive view of your financial transactions and spending patterns
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Quick Stats */}
      <StatsCard transactions={transactions} dateRange={selectedDateRange} />

      {/* Charts and Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Trends Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              7-Day Spending Trend
            </h3>
          </div>
          <TrendsChart data={trendsData} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Category Breakdown
            </h3>
          </div>
          {categoryData.length > 0 ? (
            <PieChart data={categoryData} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No spending data available
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <InsightsWidget insights={insights} />

      {/* Advanced Filters */}
      <TransactionsFilter
        categories={categories}
        accounts={accounts}
        selectedDateRange={selectedDateRange}
        selectedCategories={selectedCategories}
        selectedAccounts={selectedAccounts}
        amountRange={amountRange}
        onDateRangeChange={handleDateRangeChange}
        onCategoryFilter={handleCategoryFilter}
        onAccountFilter={handleAccountFilter}
        onAmountRangeChange={handleAmountRangeChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
      />

      {/* Enhanced Transactions Table */}
      <TransactionsDataTable
        transactions={transactions}
        currentPage={currentPage}
        totalTransactions={totalTransactions}
        onPageChange={setCurrentPage}
        onSort={handleSort}
        onExport={handleExport}
      />
    </div>
  )
}

export default Transactions
