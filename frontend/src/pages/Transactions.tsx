import React, { useState, useEffect } from 'react'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ToastContainer from '../components/ui/ToastContainer'
import SyncButton from '../components/SyncButton'
import { apiService, Transaction } from '../services/apiService'
import { TrendingUp, PieChart as PieChartIcon, Download } from 'lucide-react'
import { useToast } from '../hooks/useToast'

// Import new components
import LineChart from '../components/charts/LineChart'
import PieChart from '../components/charts/PieChart'
import InsightsWidget, { generateTransactionInsights } from '../components/widgets/InsightsWidget'
import StatsCard from '../components/widgets/StatsCard'
import Filter from '../components/Filter'
import DataTable from '../components/DataTable'
import DataRangeInfo from '../components/DataRangeInfo'

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
    dateRange: '180', // Changed to 6 months to show good amount of historical data
    categories: [] as string[],
    accounts: [] as string[],
    searchTerm: '',
    amountRange: { min: 0, max: 10000 },
    customDateRange: { start: '', end: '' }
  })

  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  // Remove separate category filter - use the main filters.categories instead

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
      // Determine date parameters based on filter type
      let dateRange: string | undefined = filters.dateRange;
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      if (filters.dateRange === 'custom' && filters.customDateRange.start && filters.customDateRange.end) {
        startDate = filters.customDateRange.start;
        endDate = filters.customDateRange.end;
        dateRange = undefined; // Don't use range when we have custom dates
      }
      
      const transactionsResponse = await apiService.fetchTransactions(
        dateRange,
        filters.categories.length > 0 ? filters.categories : undefined,
        filters.searchTerm || undefined,
        pagination.currentPage,
        startDate,
        filters.accounts.length > 0 ? filters.accounts : undefined,
        filters.amountRange.min > 0 ? filters.amountRange.min : undefined,
        filters.amountRange.max < 10000 ? filters.amountRange.max : undefined,
        sorting.field,
        sorting.direction,
        1000, // Default to 1000 for open source usage
        endDate
      )
      setTransactions(transactionsResponse.transactions)
      setTotalTransactions(transactionsResponse.total)

      // Load previous period for comparison
      try {
        let prevStartDate: string;
        if (filters.dateRange === 'custom' && filters.customDateRange.start && filters.customDateRange.end) {
          // For custom ranges, calculate a previous period of the same length
          const start = new Date(filters.customDateRange.start);
          const end = new Date(filters.customDateRange.end);
          const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          const prevEnd = new Date(start);
          prevEnd.setDate(prevEnd.getDate() - 1);
          const prevStart = new Date(prevEnd);
          prevStart.setDate(prevStart.getDate() - daysDiff);
          prevStartDate = prevStart.toISOString().split('T')[0];
        } else {
          prevStartDate = new Date(Date.now() - parseInt(filters.dateRange) * 24 * 60 * 60 * 1000 * 2).toISOString().split('T')[0];
        }
        
        const prevPeriodResponse = await apiService.fetchTransactions(
          filters.dateRange !== 'custom' ? filters.dateRange : undefined,
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

  const handleCustomDateRangeChange = (startDate: string, endDate: string) => {
    setFilters(prev => ({ 
      ...prev, 
      dateRange: 'custom',
      customDateRange: { start: startDate, end: endDate }
    }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    setShowCustomDatePicker(false)
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
      dateRange: '180',
      categories: [],
      accounts: [],
      searchTerm: '',
      amountRange: { min: 0, max: 10000 },
      customDateRange: { start: '', end: '' }
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
    // Calculate date range based on filter
    let startDate: Date;
    let endDate: Date = new Date();
    
    if (filters.dateRange === 'custom' && filters.customDateRange.start && filters.customDateRange.end) {
      startDate = new Date(filters.customDateRange.start);
      endDate = new Date(filters.customDateRange.end);
    } else {
      const days = parseInt(filters.dateRange);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
    }
    
    // Calculate the number of days to show in the chart
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysToShow = Math.min(daysDiff, 30); // Limit to 30 days max for readability
    
    // Generate date range for the chart based on actual date range
    const chartStartDate = new Date(endDate);
    chartStartDate.setDate(chartStartDate.getDate() - daysToShow + 1);
    
    // Transaction trends data for chart - filter by categories if selected
    const filteredForTrends = filters.categories.length > 0 
      ? transactions.filter(t => filters.categories.includes(t.category))
      : transactions;

    const trendsData = Array.from({ length: daysToShow }, (_, i) => {
      const date = new Date(chartStartDate);
      date.setDate(date.getDate() + i);
      const dayTransactions = filteredForTrends.filter(t => 
        new Date(t.date).toDateString() === date.toDateString()
      );
      
      const income = dayTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const spending = dayTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: date.toLocaleDateString('en-CA', { 
          month: 'short', 
          day: 'numeric',
          ...(daysToShow > 7 && { year: 'numeric' })
        }),
        income,
        spending,
        net: income - spending
      };
    });

    // Category breakdown data - use filtered transactions if categories are selected
    const filteredForCategories = filters.categories.length > 0 
      ? transactions.filter(t => filters.categories.includes(t.category))
      : transactions;

    const categoryTotals = filteredForCategories.reduce((acc, t) => {
      if (t.amount > 0) { // Positive amounts are spending
        acc[t.category] = (acc[t.category] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalSpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];
    
    let categoryData = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
        color: colors[index % colors.length]
      }));

    // Show top 8 categories
    categoryData = categoryData.slice(0, 8);

    return { trendsData, categoryData, allCategories: Object.keys(categoryTotals).sort() };
  };

  const { trendsData, categoryData, allCategories } = getAnalyticsData();
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
              { value: '180', label: '6M' }
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
            <button
              onClick={() => setShowCustomDatePicker(true)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filters.dateRange === 'custom'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Custom
            </button>
          </div>
          
          <SyncButton 
            variant="button" 
            onSyncComplete={() => {
              loadTransactions();
              loadInitialData();
            }}
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

      {/* Custom Date Picker Modal */}
      {showCustomDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Custom Date Range
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.customDateRange.start}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    customDateRange: { ...prev.customDateRange, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.customDateRange.end}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    customDateRange: { ...prev.customDateRange, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCustomDatePicker(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (filters.customDateRange.start && filters.customDateRange.end) {
                      handleCustomDateRangeChange(filters.customDateRange.start, filters.customDateRange.end);
                    }
                  }}
                  disabled={!filters.customDateRange.start || !filters.customDateRange.end}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <StatsCard 
        transactions={transactions} 
        dateRange={filters.dateRange} 
        customDateRange={filters.customDateRange}
      />

      {/* Charts and Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Trends Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {filters.dateRange === '7' ? '7-Day' : 
                 filters.dateRange === '30' ? '30-Day' :
                 filters.dateRange === '90' ? '90-Day' :
                 filters.dateRange === '180' ? '6-Month' :
                 filters.dateRange === 'custom' ? 'Custom Range' : 'Transaction'} Trends
              </h3>
            </div>
            {filters.categories.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Filtered by:</span>
                <div className="flex flex-wrap gap-1">
                  {filters.categories.slice(0, 2).map(category => (
                    <span key={category} className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                      {category}
                    </span>
                  ))}
                  {filters.categories.length > 2 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{filters.categories.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <LineChart 
            data={trendsData} 
            hideIncomeWhenAllExpenses={filters.categories.length > 0} 
          />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Category Breakdown
              </h3>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <select
                value={filters.categories.length === 1 ? filters.categories[0] : filters.categories.length > 1 ? 'multiple' : 'all'}
                onChange={(e) => {
                  if (e.target.value === 'all') {
                    handleCategoryFilter([]);
                  } else if (e.target.value === 'multiple') {
                    // Keep existing multiple selection
                    return;
                  } else {
                    handleCategoryFilter([e.target.value]);
                  }
                }}
                className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {filters.categories.length > 1 && (
                  <option value="multiple">Multiple Categories ({filters.categories.length})</option>
                )}
                {allCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {filters.categories.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Shows filtered data only
                </span>
              )}
            </div>
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

      {/* Data Range Info */}
      <DataRangeInfo 
        selectedDateRange={filters.dateRange}
        customDateRange={filters.customDateRange}
        onRefresh={() => {
          // Trigger historical data fetch
          fetch('/api/transactions/fetch-historical', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: '2024-01-01' })
          }).then(() => {
            // Refresh transactions after fetch
            loadTransactions()
          }).catch(console.error)
        }} 
      />

      {/* Advanced Filters */}
      <Filter
        categories={categories}
        accounts={accounts}
        selectedDateRange={filters.dateRange}
        selectedCategories={filters.categories}
        selectedAccounts={filters.accounts}
        amountRange={filters.amountRange}
        customDateRange={filters.customDateRange}
        onDateRangeChange={handleDateRangeChange}
        onCustomDateRangeChange={handleCustomDateRangeChange}
        onCategoryFilter={handleCategoryFilter}
        onAccountFilter={handleAccountFilter}
        onAmountRangeChange={handleAmountRangeChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
      />

      {/* Enhanced Transactions Table */}
      <DataTable
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
