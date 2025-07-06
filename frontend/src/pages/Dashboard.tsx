import React, { useState, useEffect } from 'react'
import OverviewCards from '../components/OverviewCards'
import CashFlowInsights from '../components/CashFlowInsights'
import SimplifiedChartsSection from '../components/charts/SimplifiedChartsSection'
import BudgetSummaryWidget from '../components/widgets/BudgetSummaryWidget'
import InvestmentSummaryWidget from '../components/widgets/InvestmentSummaryWidget'
import RecentTransactionsWidget from '../components/widgets/RecentTransactionsWidget'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { apiService, OverviewData, SpendingData, CategoryData, EarningsData } from '../services/apiService'
import { Receipt, Building2 } from 'lucide-react'
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
      const [overview, spending,        categories, earnings] = await Promise.all([
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-800 dark:from-navy-700 dark:to-navy-900 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to your Financial Dashboard</h1>
        <p className="text-navy-100 dark:text-navy-200">
          Here's your financial overview for today.
        </p>
      </div>

      {/* Overview Cards */}
      <OverviewCards data={overviewData} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          to="/transactions" 
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">View Transactions</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your spending</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/accounts" 
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Manage Accounts</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connect banks</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Financial Summary Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetSummaryWidget />
        <InvestmentSummaryWidget />
      </div>

      {/* Recent Transactions & Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
