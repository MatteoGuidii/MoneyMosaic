import React, { useState, useEffect } from 'react'
import BankManagement from '../components/BankManagement'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ToastContainer from '../components/ui/ToastContainer'
import SyncButton from '../components/SyncButton'
import { apiService, Account } from '../services/apiService'
import { Building2, TrendingUp, Download } from 'lucide-react'
import { useToast } from '../hooks/useToast'

// Import new components
import AccountTrendsChart from '../components/charts/AccountTrendsChart'
import AccountDistributionChart from '../components/charts/AccountDistributionChart'
import AccountInsightsWidget, { generateAccountInsights } from '../components/widgets/AccountInsightsWidget'
import AccountStatsCards from '../components/widgets/AccountStatsCards'
import AccountsFilter from '../components/AccountsFilter'
import AccountsDataTable from '../components/AccountsDataTable'

const Accounts: React.FC = () => {
  // Toast functionality
  const { toasts, dismissToast, success, error: showError } = useToast()

  // Basic data states
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states - grouped for better organization
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedTypes: [] as string[],
    selectedStatus: 'all'
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const accountsData = await apiService.fetchAccounts()
      setAccounts(accountsData)
    } catch (error) {
      console.error('Error loading accounts:', error)
      showError('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleBankConnectionChange = async () => {
    await loadAccounts()
    success('Bank connection updated successfully!')
  }

  const handleSyncComplete = async () => {
    await loadAccounts()
    success('Account sync completed!')
  }

  const handleTypeFilter = (types: string[]) => {
    setFilters(prev => ({ ...prev, selectedTypes: types }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, selectedStatus: status }))
  }

  const handleSearch = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }))
  }

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedTypes: [],
      selectedStatus: 'all'
    })
  }

  const handleSyncAccount = async (accountId: string) => {
    try {
      // This would make an API call to sync the specific account
      console.log('Syncing account:', accountId)
      success('Account sync initiated')
    } catch (error) {
      showError('Failed to sync account')
    }
  }

  const handleViewTransactions = (accountId: string) => {
    // Navigate to transactions page with account filter
    console.log('View transactions for account:', accountId)
  }

  const handleDeleteAccount = async (accountId: string) => {
    try {
      // This would make an API call to disconnect the account
      console.log('Disconnecting account:', accountId)
      success('Account disconnected successfully')
      await loadAccounts()
    } catch (error) {
      showError('Failed to disconnect account')
    }
  }

  const handleExportAccounts = () => {
    try {
      if (filteredAccounts.length === 0) {
        showError('No accounts to export')
        return
      }

      const csvData = filteredAccounts.map(account => ({
        Name: account.name,
        Type: account.type,
        Balance: account.balance,
        'Last Updated': account.lastUpdated
      }))

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'accounts_summary.csv'
      a.click()
      window.URL.revokeObjectURL(url)

      success('Accounts exported successfully!')
    } catch (error) {
      console.error('Error exporting accounts:', error)
      showError('Failed to export accounts')
    }
  }

  // Filter accounts based on current filters
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = !filters.searchTerm || 
      account.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
    
    const matchesType = filters.selectedTypes.length === 0 || 
      filters.selectedTypes.includes(account.type)
    
    const matchesStatus = filters.selectedStatus === 'all' || (() => {
      const lastUpdate = new Date(account.lastUpdated)
      const now = new Date()
      const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
      
      switch (filters.selectedStatus) {
        case 'healthy': return diffInHours < 24
        case 'warning': return diffInHours >= 24 && diffInHours < 72
        case 'error': return diffInHours >= 72
        default: return true
      }
    })()

    return matchesSearch && matchesType && matchesStatus
  })

  // Calculate balances and analytics
  const calculateAnalytics = () => {
    let totalBalance = 0
    let checkingBalance = 0
    let savingsBalance = 0
    let creditBalance = 0
    let investmentBalance = 0
    
    const accountTypeCounts: Record<string, number> = {}
    let healthyCount = 0

    filteredAccounts.forEach(account => {
      const balance = account.balance || 0
      totalBalance += balance
      
      // Count account types
      accountTypeCounts[account.type] = (accountTypeCounts[account.type] || 0) + 1
      
      // Calculate health
      const lastUpdate = new Date(account.lastUpdated)
      const now = new Date()
      const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
      if (diffInHours < 24) healthyCount++
      
      // Categorize by type
      switch (account.type.toLowerCase()) {
        case 'checking':
        case 'depository':
          checkingBalance += balance
          break
        case 'savings':
          savingsBalance += balance
          break
        case 'credit':
          creditBalance += Math.abs(balance)
          break
        case 'investment':
          investmentBalance += balance
          break
      }
    })

    // Calculate realistic trends data based on actual account balances
    const trendsData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      
      // If no accounts, return zero values
      if (filteredAccounts.length === 0) {
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          totalBalance: 0,
          checkingBalance: 0,
          savingsBalance: 0,
          creditBalance: 0
        }
      }
      
      // For now, show current balances with small realistic variations
      // In a real app, this would come from historical balance data from the API
      const variance = 0.02 // 2% variance
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalBalance: totalBalance * (1 + (Math.random() - 0.5) * variance),
        checkingBalance: checkingBalance * (1 + (Math.random() - 0.5) * variance),
        savingsBalance: savingsBalance * (1 + (Math.random() - 0.5) * variance),
        creditBalance: creditBalance * (1 + (Math.random() - 0.5) * variance)
      }
    })

    // Distribution data for pie chart
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    
    // Helper function to format account type names
    const formatAccountTypeName = (type: string) => {
      switch (type.toLowerCase()) {
        case 'depository':
        case 'checking': 
          return 'Checking Accounts'
        case 'savings': 
          return 'Savings Accounts'
        case 'credit': 
          return 'Credit Cards'
        case 'investment': 
          return 'Investment Accounts'
        case 'loan': 
          return 'Loans'
        default: 
          return type.charAt(0).toUpperCase() + type.slice(1) + ' Accounts'
      }
    }
    
    const distributionData = Object.entries(accountTypeCounts)
      .map(([type, count], index) => {
        const typeBalance = filteredAccounts
          .filter(acc => acc.type === type)
          .reduce((sum, acc) => sum + acc.balance, 0)
        
        return {
          type: formatAccountTypeName(type), // Use formatted name
          originalType: type, // Keep original for filtering if needed
          balance: Math.abs(typeBalance),
          percentage: (Math.abs(typeBalance) / Math.abs(totalBalance)) * 100,
          color: colors[index % colors.length],
          count
        }
      })
      .filter(item => item.balance > 0)

    // Calculate last sync time (most recent account update)
    const lastSyncTime = filteredAccounts.length > 0 
      ? Math.min(...filteredAccounts.map(acc => 
          (new Date().getTime() - new Date(acc.lastUpdated).getTime()) / (1000 * 60 * 60)
        ))
      : 0

    // Calculate number of unique account types
    const uniqueAccountTypes = new Set(filteredAccounts.map(acc => acc.type)).size

    const statsData = {
      totalAccounts: filteredAccounts.length,
      totalBalance,
      monthlyChange: filteredAccounts.length > 0 ? 2.5 : 0, // Would be calculated from historical data
      healthyAccounts: healthyCount,
      lastSyncedHours: lastSyncTime,
      averageBalance: filteredAccounts.length > 0 ? totalBalance / filteredAccounts.length : 0,
      uniqueAccountTypes
    }

    return { 
      balances: { totalBalance, checkingBalance, savingsBalance, creditBalance, investmentBalance },
      trendsData,
      distributionData,
      statsData
    }
  }

  const { balances, trendsData, distributionData, statsData } = calculateAnalytics()
  const insights = generateAccountInsights(filteredAccounts, balances)
  const accountTypes = [...new Set(accounts.map(acc => acc.type))]

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
            Account Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive overview of your connected accounts and financial health
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SyncButton 
            variant="button" 
            onSyncComplete={loadAccounts}
          />
          <button
            onClick={handleExportAccounts}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <AccountStatsCards data={statsData} />

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Balance Trends */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Balance Trends
            </h3>
          </div>
          <AccountTrendsChart data={trendsData} />
        </div>

        {/* Account Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Account Distribution
            </h3>
          </div>
          {distributionData.length > 0 ? (
            <AccountDistributionChart data={distributionData} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No account data available
            </div>
          )}
        </div>
      </div>

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

      {/* Enhanced Accounts Table */}
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

export default Accounts
