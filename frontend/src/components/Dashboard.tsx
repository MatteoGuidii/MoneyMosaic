import React, { useState, useEffect } from 'react'
import Header from './Header'
import OverviewCards from './OverviewCards'
import FilterBar from './FilterBar'
import ChartsSection from './ChartsSection'
import TransactionsTable from './TransactionsTable'
import InvestmentsPanel from './InvestmentsPanel'
import EarningsSummary from './EarningsSummary'
import LoadingSpinner from './LoadingSpinner'
import BankManagement from './BankManagement'
import { apiService, OverviewData, Transaction, Investment, SpendingData, CategoryData, EarningsData } from '../services/apiService'

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [spendingData, setSpendingData] = useState<SpendingData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedDateRange, setSelectedDateRange] = useState('30')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadFilteredData()
  }, [selectedDateRange, selectedCategories, searchTerm, currentPage])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [overview, investments, earnings, categories] = await Promise.all([
        apiService.fetchOverviewData(),
        apiService.fetchInvestments(),
        apiService.fetchEarningsData(),
        apiService.fetchCategories()
      ])
      
      setOverviewData(overview)
      setInvestments(investments)
      setEarningsData(earnings)
      setCategories(categories)
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFilteredData = async () => {
    try {
      const [transactionsResponse, spendingData, categoryData] = await Promise.all([
        apiService.fetchTransactions(selectedDateRange, selectedCategories, searchTerm, currentPage),
        apiService.fetchSpendingData(selectedDateRange),
        apiService.fetchCategoryData(selectedDateRange)
      ])
      
      setTransactions(transactionsResponse.transactions)
      setTotalTransactions(transactionsResponse.total)
      setSpendingData(spendingData)
      setCategoryData(categoryData)
    } catch (error) {
      console.error('Error loading filtered data:', error)
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

  const handleCategorySelect = (category: string) => {
    setSelectedCategories([category])
    setCurrentPage(1)
  }

  // Callback functions for BankManagement to trigger dashboard refresh
  const handleBankConnectionChange = async () => {
    // Refresh all dashboard data when banks are added/removed
    await loadInitialData()
    await loadFilteredData()
  }

  const handleSyncComplete = async () => {
    // Refresh all dashboard data when sync completes
    await loadInitialData()
    await loadFilteredData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Bank Management */}
          <BankManagement onBankConnectionChange={handleBankConnectionChange} onSyncComplete={handleSyncComplete} />
          
          {/* Overview Cards */}
          <OverviewCards data={overviewData} />
          
          {/* Filter Bar */}
          <FilterBar
            categories={categories}
            selectedDateRange={selectedDateRange}
            selectedCategories={selectedCategories}
            onDateRangeChange={handleDateRangeChange}
            onCategoryFilter={handleCategoryFilter}
            onSearch={handleSearch}
          />
          
          {/* Charts Section */}
          <ChartsSection
            spendingData={spendingData}
            categoryData={categoryData}
            onCategorySelect={handleCategorySelect}
          />
          
          {/* Earnings Summary */}
          <EarningsSummary data={earningsData} />
          
          {/* Transactions Table */}
          <TransactionsTable
            transactions={transactions}
            currentPage={currentPage}
            totalTransactions={totalTransactions}
            onPageChange={setCurrentPage}
          />
          
          {/* Investments Panel */}
          <InvestmentsPanel investments={investments} />
        </div>
      </main>
    </div>
  )
}

export default Dashboard
