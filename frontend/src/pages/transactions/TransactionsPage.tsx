import React, { useState } from 'react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ToastContainer from '../../components/ui/ToastContainer'
import StatsCard from '../../components/widgets/StatsCard'
import InsightsWidget from '../../components/widgets/InsightsWidget'
import Filter from '../../components/Filter'
import DataTable from '../../components/DataTable'
import DataRangeInfo from '../../components/DataRangeInfo'
import { useToast } from '../../hooks/useToast'
import { TransactionPagination, TransactionSorting } from './types'
import { 
  useTransactionFilters, 
  useTransactionData, 
  useTransactionAnalytics, 
  useTransactionExport 
} from './hooks'
import { 
  TransactionHeader, 
  CustomDatePicker, 
  TransactionCharts 
} from './components'

const TransactionsPage: React.FC = () => {
  const { toasts, dismissToast, success, error: showError } = useToast()
  
  const [pagination, setPagination] = useState<TransactionPagination>({
    currentPage: 1
  })

  const [sorting, setSorting] = useState<TransactionSorting>({
    field: 'date',
    direction: 'desc'
  })

  const {
    filters,
    showCustomDatePicker,
    handleDateRangeChange,
    handleCustomDateRangeChange,
    handleCategoryFilter,
    handleAccountFilter,
    handleAmountRangeChange,
    handleSearch,
    handleClearFilters,
    setShowCustomDatePicker
  } = useTransactionFilters(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  })

  const {
    transactions,
    loading,
    categories,
    accounts,
    totalTransactions,
    previousPeriodTransactions,
    loadInitialData,
    loadTransactions
  } = useTransactionData(filters, pagination, sorting)

  const { analyticsData, insights } = useTransactionAnalytics(
    transactions,
    previousPeriodTransactions,
    filters
  )

  const { handleExport } = useTransactionExport(
    transactions,
    filters,
    success,
    showError
  )

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSorting({ field, direction })
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleSyncComplete = () => {
    loadTransactions()
    loadInitialData()
  }

  const handleDataRangeRefresh = () => {
    // Trigger historical data fetch
    fetch('/api/transactions/fetch-historical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: '2024-01-01' })
    }).then(() => {
      // Refresh transactions after fetch
      loadTransactions()
    }).catch(console.error)
  }

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
      <TransactionHeader
        dateRange={filters.dateRange}
        onDateRangeChange={handleDateRangeChange}
        onCustomDatePicker={() => setShowCustomDatePicker(true)}
        onSync={handleSyncComplete}
        onExport={handleExport}
      />

      {/* Custom Date Picker Modal */}
      <CustomDatePicker
        isOpen={showCustomDatePicker}
        onClose={() => setShowCustomDatePicker(false)}
        onApply={handleCustomDateRangeChange}
        initialStartDate={filters.customDateRange.start}
        initialEndDate={filters.customDateRange.end}
      />

      {/* Quick Stats */}
      <StatsCard 
        transactions={transactions} 
        dateRange={filters.dateRange} 
        customDateRange={filters.customDateRange}
      />

      {/* Charts */}
      <TransactionCharts
        analyticsData={analyticsData}
        dateRange={filters.dateRange}
        selectedCategories={filters.categories}
        allCategories={analyticsData.allCategories}
        onCategoryFilter={handleCategoryFilter}
      />

      {/* Insights */}
      <InsightsWidget insights={insights} />

      {/* Data Range Info */}
      <DataRangeInfo 
        selectedDateRange={filters.dateRange}
        customDateRange={filters.customDateRange}
        onRefresh={handleDataRangeRefresh}
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

      {/* Transactions Table */}
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

export default TransactionsPage
