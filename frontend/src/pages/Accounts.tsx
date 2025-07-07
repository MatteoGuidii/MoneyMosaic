import React, { useState, useEffect } from 'react'
import BankManagement from '../components/BankManagement'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { apiService, Account } from '../services/apiService'
import { Building2, CreditCard, Wallet, TrendingUp, Shield, CheckCircle, AlertCircle } from 'lucide-react'

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

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
    } finally {
      setLoading(false)
    }
  }

  const handleBankConnectionChange = async () => {
    // Refresh accounts when bank connections change
    await loadAccounts()
  }

  const handleSyncComplete = async () => {
    // Refresh accounts when sync completes
    await loadAccounts()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return <Wallet className="w-5 h-5" />
      case 'savings':
        return <TrendingUp className="w-5 h-5" />
      case 'credit':
        return <CreditCard className="w-5 h-5" />
      default:
        return <Building2 className="w-5 h-5" />
    }
  }

  const getAccountColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'savings':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'credit':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getAccountStatus = (lastUpdated: string) => {
    const lastUpdate = new Date(lastUpdated)
    const now = new Date()
    const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return { status: 'healthy', label: 'Healthy', icon: CheckCircle, color: 'text-green-600 dark:text-green-400' }
    } else if (diffInHours < 72) {
      return { status: 'warning', label: 'Needs Sync', icon: AlertCircle, color: 'text-yellow-600 dark:text-yellow-400' }
    } else {
      return { status: 'error', label: 'Connection Issue', icon: AlertCircle, color: 'text-red-600 dark:text-red-400' }
    }
  }

  // Calculate balances properly by account type
  const calculateBalances = () => {
    let totalBalance = 0;
    let checkingBalance = 0;
    let savingsBalance = 0;
    let creditBalance = 0;
    let investmentBalance = 0;
    
    accounts.forEach(account => {
      const balance = account.balance || 0;
      
      switch (account.type.toLowerCase()) {
        case 'depository':
          // Check subtype for more specific categorization
          if (account.name.toLowerCase().includes('checking')) {
            checkingBalance += balance;
          } else if (account.name.toLowerCase().includes('saving')) {
            savingsBalance += balance;
          } else {
            // Default depository accounts to checking
            checkingBalance += balance;
          }
          totalBalance += balance;
          break;
        case 'credit':
          creditBalance += Math.abs(balance); // Track credit as positive for display
          totalBalance += balance; // Credit balances are already negative, add them as-is
          break;
        case 'investment':
          investmentBalance += balance;
          totalBalance += balance;
          break;
        case 'loan':
          // Loans are debt, already negative in Plaid
          totalBalance += balance;
          break;
        default:
          totalBalance += balance;
      }
    });
    
    return {
      totalBalance,
      checkingBalance,
      savingsBalance,
      creditBalance,
      investmentBalance
    };
  };
  
  const balances = calculateBalances();

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
      <div className="bg-gradient-to-r from-navy-600 to-blue-600 dark:from-navy-700 dark:to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Accounts & Banks</h1>
            <p className="text-navy-100 dark:text-navy-200">
              Manage your connected accounts and bank relationships
            </p>
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-navy-600 dark:text-navy-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Balance</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(balances.totalBalance)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Checking</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(balances.checkingBalance)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Savings</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {formatCurrency(balances.savingsBalance)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Credit</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {formatCurrency(balances.creditBalance)}
          </p>
        </div>
      </div>

      {/* Bank Management */}
      <BankManagement 
        onBankConnectionChange={handleBankConnectionChange}
        onSyncComplete={handleSyncComplete}
      />

      {/* Account Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Details
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and manage your connected accounts
          </p>
        </div>

        <div className="p-6">
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No accounts connected yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Connect your bank accounts to start tracking your finances
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => {
                const status = getAccountStatus(account.lastUpdated)
                const StatusIcon = status.icon
                
                return (
                  <div
                    key={account.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedAccount?.id === account.id
                        ? 'border-navy-500 bg-navy-50 dark:bg-navy-900'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedAccount(account)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${getAccountColor(account.type)}`}>
                          {getAccountIcon(account.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {account.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {account.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        <span className={`text-xs ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(account.balance)}
                      </p>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Last updated: {new Date(account.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Account Details Modal/Panel */}
      {selectedAccount && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedAccount.name} Details
            </h3>
            <button
              onClick={() => setSelectedAccount(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Account Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account Type:</span>
                  <span className="text-gray-900 dark:text-white">{selectedAccount.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(selectedAccount.balance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(selectedAccount.lastUpdated).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  View Recent Transactions
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  Force Sync Account
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded">
                  Disconnect Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Accounts
