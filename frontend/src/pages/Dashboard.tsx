import React, { useState, useEffect } from 'react'
import OverviewCards from '../components/OverviewCards'
import CashFlowInsights from '../components/CashFlowInsights'
import SimplifiedChartsSection from '../components/charts/SimplifiedChartsSection'
import BudgetSummaryWidget from '../components/widgets/BudgetSummaryWidget'
import InvestmentSummaryWidget from '../components/widgets/InvestmentSummaryWidget'
import RecentTransactionsWidget from '../components/widgets/RecentTransactionsWidget'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import SyncButton from '../components/SyncButton'
import { apiService, OverviewData, SpendingData, CategoryData, EarningsData } from '../services/apiService'
import { Receipt, Building2, TrendingUp, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [spendingData, setSpendingData] = useState<SpendingData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [categoryPeriod, setCategoryPeriod] = useState('30')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [overview, spending, categories, earnings] = await Promise.all([
        apiService.fetchOverviewData(),
        apiService.fetchSpendingData('30'),
        apiService.fetchCategoryData(categoryPeriod),
        apiService.fetchEarningsData()
      ])
      
      setOverviewData(overview)
      setSpendingData(spending)
      setCategoryData(categories)
      setEarningsData(earnings)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (category: string) => {
    // Navigate to transactions page with category filter
    // This would be implemented with navigation state
    console.log('Selected category:', category)
  }

  const handleCategoryPeriodChange = async (period: string) => {
    setCategoryPeriod(period)
    try {
      const categories = await apiService.fetchCategoryData(period)
      setCategoryData(categories)
    } catch (error) {
      console.error('Error loading category data:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 rounded-3xl p-8 border border-gray-100 dark:border-gray-800">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back! 👋
              </h1>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            Here's your comprehensive financial overview. Your wealth is growing steadily, and all systems are performing well.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">All systems operational</span>
              </div>
            </div>
            <SyncButton 
              variant="button" 
              onSyncComplete={loadDashboardData}
              className="ml-4"
            />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Overview Cards */}
      <OverviewCards data={overviewData} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/transactions" 
          className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:-translate-y-1"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Receipt className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">View Transactions</p>
              <p className="text-gray-500 dark:text-gray-400">Manage your spending history</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/accounts" 
          className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 hover:-translate-y-1"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">Manage Accounts</p>
              <p className="text-gray-500 dark:text-gray-400">Connect and manage banks</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/investments" 
          className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:-translate-y-1"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">Portfolio</p>
              <p className="text-gray-500 dark:text-gray-400">Track your investments</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Financial Summary Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BudgetSummaryWidget />
        <InvestmentSummaryWidget />
      </div>

      {/* Recent Transactions & Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentTransactionsWidget />
        <CashFlowInsights data={earningsData} />
      </div>

      {/* Charts Section - Simplified */}
      <SimplifiedChartsSection
        spendingData={spendingData}
        categoryData={categoryData}
        onCategorySelect={handleCategorySelect}
        onCategoryPeriodChange={handleCategoryPeriodChange}
      />
    </div>
  )
}

export default Dashboard
