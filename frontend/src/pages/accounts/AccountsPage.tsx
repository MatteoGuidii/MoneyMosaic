import React from 'react'
import BankManagement from '../../components/BankManagement'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ToastContainer from '../../components/ui/ToastContainer'
import AccountStatsCards from '../../components/widgets/AccountStatsCards'
import AccountInsightsWidget from '../../components/widgets/AccountInsightsWidget'
import AccountsFilter from '../../components/AccountsFilter'
import AccountsDataTable from '../../components/AccountsDataTable'
import { useToast } from '../../hooks/useToast'
import { 
  useAccounts, 
  useAccountFilters, 
  useAccountAnalytics 
} from './hooks'
import { 
  AccountsHeader, 
  AccountsCharts 
} from './components'

const AccountsPage: React.FC = () => {
  const { toasts, dismissToast, success, error: showError } = useToast()

  const {
    accounts,
    loading,
    loadAccounts,
    handleBankConnectionChange,
    handleSyncComplete,
    handleSyncAccount,
    handleViewTransactions,
    handleDeleteAccount,
    handleExportAccounts
  } = useAccounts(success, showError)

  const {
    filters,
    handleTypeFilter,
    handleStatusFilter,
    handleSearch,
    handleClearFilters,
    filteredAccounts
  } = useAccountFilters(accounts)

  const {
    analytics,
    insights,
    accountTypes
  } = useAccountAnalytics(filteredAccounts)

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
      <AccountsHeader
        onSync={loadAccounts}
        onExport={handleExportAccounts}
      />

      {/* Quick Stats */}
      <AccountStatsCards data={analytics.statsData} />

      {/* Charts */}
      <AccountsCharts analytics={analytics} />

      {/* Account Insights */}
      <AccountInsightsWidget insights={insights} />

      {/* Bank Management */}
      <BankManagement 
        onBankConnectionChange={handleBankConnectionChange}
        onSyncComplete={handleSyncComplete}
      />

      {/* Account Filters */}
      <AccountsFilter
        accountTypes={accountTypes}
        selectedTypes={filters.selectedTypes}
        selectedStatus={filters.selectedStatus}
        searchTerm={filters.searchTerm}
        onTypeFilter={handleTypeFilter}
        onStatusFilter={handleStatusFilter}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
      />

      {/* Accounts Table */}
      <AccountsDataTable
        accounts={filteredAccounts}
        onAccountSelect={(account) => console.log('Selected account:', account)}
        onSyncAccount={handleSyncAccount}
        onViewTransactions={handleViewTransactions}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default AccountsPage
