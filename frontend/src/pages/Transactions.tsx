import React, { useState, useEffect } from 'react'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ToastContainer from '../components/ui/ToastContainer'
import SyncButton from '../components/SyncButton'
import { apiService, Transaction } from '../services/apiService'
import { TrendingUp, PieChart as PieChartIcon, Download } from 'lucide-react'
import { useToast } from '../hooks/useToast'

// Import new components
import TrendsChart from '../components/charts/TrendsChart'
import PieChart from '../components/charts/PieChart'
import InsightsWidget, { generateTransactionInsights } from '../components/widgets/InsightsWidget'
import StatsCard from '../components/widgets/StatsCard'
import TransactionsFilter from '../components/TransactionsFilter'
import TransactionsDataTable from '../components/TransactionsDataTable'

const Transactions: React.FC = () => {
  // Toast functionality
  const { toasts, dismissToast, success, error: showError } = useToast()

  // Basic data states
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [accounts, setAccounts] = useState<string[]>([])
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [previousPeriodTransactions, setPreviousPeriodTransactions] = useState<Transaction[]>([])

  // Filter and pagination states - grouped for better organization
  const [filters, setFilters] = useState({
    dateRange: '30',
    categories: [] as string[],
    accounts: [] as string[],
    searchTerm: '',
    amountRange: { min: 0, max: 10000 }
  })

  const [pagination, setPagination] = useState({
    currentPage: 1
  })

  const [sorting, setSorting] = useState({
    field: 'date',
    direction: 'desc' as 'asc' | 'desc'
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [filters, pagination.currentPage, sorting])

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
        filters.dateRange,
        filters.categories.length > 0 ? filters.categories : undefined,
        filters.searchTerm || undefined,
        pagination.currentPage,
        undefined, // startDate
        filters.accounts.length > 0 ? filters.accounts : undefined,
        filters.amountRange.min > 0 ? filters.amountRange.min : undefined,
        filters.amountRange.max < 10000 ? filters.amountRange.max : undefined,
        sorting.field,
        sorting.direction
      )
      setTransactions(transactionsResponse.transactions)
      setTotalTransactions(transactionsResponse.total)

      // Load previous period for comparison
      try {
        const prevStartDate = new Date(Date.now() - parseInt(filters.dateRange) * 24 * 60 * 60 * 1000 * 2).toISOString()
        const prevPeriodResponse = await apiService.fetchTransactions(
          filters.dateRange,
          filters.categories.length > 0 ? filters.categories : undefined,
          filters.searchTerm || undefined,
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
    setFilters(prev => ({ ...prev, dateRange: range }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleCategoryFilter = (categories: string[]) => {
    setFilters(prev => ({ ...prev, categories }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleAccountFilter = (accounts: string[]) => {
    setFilters(prev => ({ ...prev, accounts }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleAmountRangeChange = (range: { min: number; max: number }) => {
    setFilters(prev => ({ ...prev, amountRange: range }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleSearch = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSorting({ field, direction })
  }

  const handleClearFilters = () => {
    setFilters({
      dateRange: '30',
      categories: [],
      accounts: [],
      searchTerm: '',
      amountRange: { min: 0, max: 10000 }
    })
    setPagination({ currentPage: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleExport = async () => {
    try {
      if (transactions.length === 0) {
        showError('No transactions to export')
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
      a.download = `transactions_${filters.dateRange}_days.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      success('Transactions exported successfully!')
    } catch (error) {
      console.error('Error exporting transactions:', error)
      showError('Failed to export transactions')
    }
  }

  // Calculate analytics data
  const getAnalyticsData = () => {
    const daysToShow = Math.min(parseInt(filters.dateRange), 30) // Limit chart to 30 days max for readability
    
    // Transaction trends data for chart
    const trendsData = Array.from({ length: daysToShow }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (daysToShow - 1 - i))
      const dayTransactions = transactions.filter(t => 
        new Date(t.date).toDateString() === date.toDateString()
      )
      
      return {
        date: date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
        income: dayTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
        spending: dayTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
        net: dayTransactions.reduce((sum, t) => sum + t.amount, 0)
      }
    })

    // Category breakdown data
    const categoryTotals = transactions.reduce((acc, t) => {
      if (t.amount < 0) {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
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
      {/* Header with Date Range Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transaction Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your spending patterns and analyze transaction trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Toggle */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {[
              { value: '7', label: '7D' },
              { value: '30', label: '30D' },
              { value: '90', label: '90D' },
              { value: '180', label: '6M' },
              { value: '365', label: '1Y' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => handleDateRangeChange(range.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filters.dateRange === range.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <SyncButton 
            variant="button" 
            onSyncComplete={() => loadTransactions()}
          />
          <button 
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <StatsCard transactions={transactions} dateRange={filters.dateRange} />

      {/* Charts and Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Trends Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {filters.dateRange === '7' ? '7-Day' : 
               filters.dateRange === '30' ? '30-Day' :
               filters.dateRange === '90' ? '90-Day' :
               filters.dateRange === '180' ? '6-Month' :
               filters.dateRange === '365' ? '1-Year' : 'Transaction'} Trends
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
        selectedDateRange={filters.dateRange}
        selectedCategories={filters.categories}
        selectedAccounts={filters.accounts}
        amountRange={filters.amountRange}
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
        currentPage={pagination.currentPage}
        totalTransactions={totalTransactions}
        onPageChange={handlePageChange}
        onSort={handleSort}
        onExport={handleExport}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default Transactions
