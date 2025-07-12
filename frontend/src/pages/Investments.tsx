import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Search,
  Eye,
  BarChart3,
  Target,
  Wallet,
  X
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { apiService, Investment as ApiInvestment } from '../services/apiService'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import LazyChart from '../components/LazyChart'
import SyncButton from '../components/SyncButton'

interface PortfolioData {
  date: string
  value: number
  costBasis: number
}

interface DateRange {
  label: string
  days: number
}

const Investments: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({ label: 'Last 30 Days', days: 30 })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSector, setFilterSector] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [investments, setInvestments] = useState<ApiInvestment[]>([])
  const [investmentSummary, setInvestmentSummary] = useState<any>(null)
  const [investmentAccounts, setInvestmentAccounts] = useState<any>(null)
  const [selectedInvestment, setSelectedInvestment] = useState<ApiInvestment | null>(null)
  const [showInvestmentModal, setShowInvestmentModal] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    loadInvestments()
  }, [])

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterSector])

  const loadInvestments = useCallback(async () => {
    try {
      setLoading(true)
      // Use the optimized single API call instead of two separate calls
      const { investments: investmentData, accounts: accountData, summary: summaryData } = await apiService.fetchInvestmentData()
      
      // Set all data at once to minimize re-renders
      setInvestments(investmentData)
      setInvestmentAccounts(accountData)
      setInvestmentSummary(summaryData)
    } catch (error) {
      console.error('Error loading investments:', error)
      // Set default values on error
      setInvestments([])
      setInvestmentAccounts({})
      setInvestmentSummary({})
    } finally {
      setLoading(false)
    }
  }, [])

  // Mock data - in a real app, this would come from an API
  const dateRanges: DateRange[] = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'Last 6 Months', days: 180 }
  ]

  // Memoize expensive calculations to prevent recalculation on every render
  const portfolioSummary = useMemo(() => {
    const summary = {
      totalValue: investmentSummary?.totalValue || investmentAccounts?.totalValue || investments.reduce((sum, inv) => sum + inv.marketValue, 0),
      totalCostBasis: investmentSummary?.totalCostBasis || investments.reduce((sum, inv) => sum + (inv.costBasis || inv.quantity * inv.marketPrice * 0.9), 0),
      unrealizedPL: investmentSummary?.totalDayChange || investments.reduce((sum, inv) => sum + inv.dayChange * inv.quantity, 0),
      unrealizedPLPercent: 0,
      todayReturn: investmentSummary?.totalDayChange || investments.reduce((sum, inv) => sum + inv.dayChange * inv.quantity, 0),
      todayReturnPercent: investmentSummary?.totalDayChangePercent || 0,
      cashBalance: 5430.25 // This would come from cash accounts
    }

    // Calculate percentages
    summary.unrealizedPL = summary.totalValue - summary.totalCostBasis
    summary.unrealizedPLPercent = summary.totalCostBasis > 0 ? 
      (summary.unrealizedPL / summary.totalCostBasis) * 100 : 0
    summary.todayReturnPercent = summary.totalValue > 0 ? 
      (summary.todayReturn / summary.totalValue) * 100 : 0

    return summary
  }, [investments, investmentSummary, investmentAccounts])

  // Memoize chart data to prevent recalculation
  const chartData = useMemo(() => {
    const portfolioData: PortfolioData[] = [
      { date: '2024-12-01', value: portfolioSummary.totalValue * 0.9, costBasis: portfolioSummary.totalCostBasis },
      { date: '2024-12-05', value: portfolioSummary.totalValue * 0.92, costBasis: portfolioSummary.totalCostBasis },
      { date: '2024-12-10', value: portfolioSummary.totalValue * 0.88, costBasis: portfolioSummary.totalCostBasis },
      { date: '2024-12-15', value: portfolioSummary.totalValue * 0.95, costBasis: portfolioSummary.totalCostBasis },
      { date: '2024-12-20', value: portfolioSummary.totalValue * 0.93, costBasis: portfolioSummary.totalCostBasis },
      { date: '2024-12-25', value: portfolioSummary.totalValue, costBasis: portfolioSummary.totalCostBasis },
    ]

    const dailyReturns = [
      { date: '2024-12-20', return: portfolioSummary.todayReturn * 0.7 },
      { date: '2024-12-21', return: portfolioSummary.todayReturn * -0.3 },
      { date: '2024-12-22', return: portfolioSummary.todayReturn * 1.2 },
      { date: '2024-12-23', return: portfolioSummary.todayReturn * 0.5 },
      { date: '2024-12-24', return: portfolioSummary.todayReturn * -0.2 },
      { date: '2024-12-25', return: portfolioSummary.todayReturn },
    ]

    return { portfolioData, dailyReturns }
  }, [portfolioSummary])

  // Memoize asset allocation data
  const assetAllocation = useMemo(() => [
    { name: 'Equities', value: portfolioSummary.totalValue * 0.7, percentage: 70 },
    { name: 'Bonds', value: portfolioSummary.totalValue * 0.2, percentage: 20 },
    { name: 'ETFs', value: portfolioSummary.totalValue * 0.1, percentage: 10 },
  ], [portfolioSummary.totalValue])

  // Memoize mock transaction data only when needed
  const portfolioTransactions = useMemo(() => [
    {
      id: '1',
      date: '2024-12-25',
      type: 'Buy' as const,
      symbol: investments[0]?.symbol || 'AAPL',
      quantity: 10,
      price: investments[0]?.marketPrice || 175.50,
      amount: -1755.00,
      notes: 'Market Order'
    },
    {
      id: '2',
      date: '2024-12-20',
      type: 'Dividend' as const,
      symbol: investments[1]?.symbol || 'MSFT',
      amount: 125.50,
      notes: 'Quarterly Dividend'
    },
  ], [investments])

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
  }

  const getSector = useCallback((companyName: string, sector?: string) => {
    // Use real sector data if available
    if (sector) return sector
    
    // Fallback to name-based classification
    if (companyName.includes('Apple') || companyName.includes('Google') || 
        companyName.includes('Microsoft') || companyName.includes('Meta') || 
        companyName.includes('NVIDIA')) return 'Technology'
    if (companyName.includes('Tesla')) return 'Automotive'
    if (companyName.includes('Amazon')) return 'E-commerce'
    if (companyName.includes('Netflix')) return 'Entertainment'
    return 'Other'
  }, [])

  // Memoize sector allocation from real data - moved after getSector definition
  const sectorAllocation = useMemo(() => {
    const sectors = investmentSummary?.sectorAllocation?.map((item: any) => ({
      name: item.sector,
      value: item.value,
      percentage: item.percentage
    })) || 
    investments.reduce((acc: { name: string; value: number; percentage: number }[], inv) => {
      const sector = inv.sector || getSector(inv.companyName)
      
      const existing = acc.find(item => item.name === sector)
      if (existing) {
        existing.value += inv.marketValue
      } else {
        acc.push({ name: sector, value: inv.marketValue, percentage: 0 })
      }
      return acc
    }, [])

    // Calculate percentages for sector allocation
    if (Array.isArray(sectors) && portfolioSummary.totalValue > 0) {
      sectors.forEach(sector => {
        sector.percentage = (sector.value / portfolioSummary.totalValue) * 100
      })
    }

    return sectors
  }, [investments, investmentSummary, portfolioSummary.totalValue, getSector])

  const sectors = useMemo(() => {
    return ['All', ...Array.from(new Set(investments.map(inv => getSector(inv.companyName, inv.sector))))]
  }, [investments, getSector])

  const filteredInvestments = useMemo(() => {
    return investments.filter(investment => {
      const matchesSearch = investment.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           investment.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSector = filterSector === 'All' || getSector(investment.companyName, investment.sector) === filterSector
      return matchesSearch && matchesSector
    })
  }, [investments, searchTerm, filterSector, getSector])

  const paginatedInvestments = useMemo(() => {
    return filteredInvestments.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  }, [filteredInvestments, currentPage, itemsPerPage])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // Show a helpful message if no investments or investment accounts are available
  if (investments.length === 0 && !investmentAccounts?.hasInvestmentAccounts) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your portfolio performance and holdings
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            {/* Sync Button */}
            <SyncButton 
              variant="button" 
              onSyncComplete={loadInvestments}
              investmentOnly={true}
            />
          </div>
        </div>

        {/* Empty State or Account Balances Only */}
        {investmentAccounts?.hasInvestmentAccounts && !investmentAccounts?.supportsDetailedData ? (
          <div className="space-y-6">
            {/* Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Total Portfolio Value</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(portfolioSummary.totalValue)}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Investment Accounts</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {investmentAccounts?.accounts?.length || 0}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <Wallet className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Accounts Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Investment Accounts</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Account balances are available, but detailed holdings data is not supported by your institution.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Institution
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {investmentAccounts?.accounts?.map((account: any, index: number) => (
                      <tr key={`${account.accountId}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.accountName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {account.accountType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(account.balance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {account.institutionName}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Information Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Limited Investment Data Available
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      Your institution has investment accounts but doesn't support detailed holdings data through the API. 
                      You can see account balances, but detailed holdings, performance metrics, and sector allocation are not available.
                    </p>
                    <p className="mt-2">
                      For full investment features in sandbox mode, try connecting to TD Bank (ins_109508), Wells Fargo (ins_109509), 
                      or Bank of America (ins_109510) with the "investments" product enabled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <Wallet className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No Investment Data Available
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This could be because:
              </p>
              <ul className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-left space-y-1">
                <li>• Your connected bank has investment accounts but doesn't support the investments API</li>
                <li>• The institution doesn't have investment data available in sandbox mode</li>
                <li>• You don't have any investment accounts linked</li>
                <li>• The accounts haven't been synced yet</li>
              </ul>
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  For testing with Plaid sandbox:
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Use institutions like TD Bank (ins_109508), Wells Fargo (ins_109509), or Bank of America (ins_109510) 
                  with the "investments" product enabled.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Note: TD Canada Trust (ins_42) has investment accounts but doesn't support the investments API.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your portfolio performance and holdings
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          {/* Sync Button */}
          <SyncButton 
            variant="button" 
            onSyncComplete={loadInvestments}
            investmentOnly={true}
          />
          
          {/* Date Range Selector */}
          <select
            value={selectedDateRange.label}
            onChange={(e) => {
              const range = dateRanges.find(r => r.label === e.target.value)
              if (range) setSelectedDateRange(range)
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {dateRanges.map(range => (
              <option key={range.label} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Total Portfolio Value</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(portfolioSummary.totalValue)}
              </p>
            </div>
            <div className="ml-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
              <Wallet className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Total Cost Basis</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(portfolioSummary.totalCostBasis)}
              </p>
            </div>
            <div className="ml-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-full flex-shrink-0">
              <Target className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Unrealized P/L</p>
              <p className={`text-xl lg:text-2xl font-bold ${portfolioSummary.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(portfolioSummary.unrealizedPL)}
              </p>
              <p className={`text-sm ${portfolioSummary.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(portfolioSummary.unrealizedPLPercent)}
              </p>
            </div>
            <div className={`ml-4 p-3 rounded-full flex-shrink-0 ${portfolioSummary.unrealizedPL >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              {portfolioSummary.unrealizedPL >= 0 ? (
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 lg:h-6 lg:w-6 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Today's Return</p>
              <p className={`text-xl lg:text-2xl font-bold ${portfolioSummary.todayReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(portfolioSummary.todayReturn)}
              </p>
              <p className={`text-sm ${portfolioSummary.todayReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(portfolioSummary.todayReturnPercent)}
              </p>
            </div>
            <div className={`ml-4 p-3 rounded-full flex-shrink-0 ${portfolioSummary.todayReturn >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Portfolio Value Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Portfolio Value Over Time
          </h3>
          <LazyChart height={320}>
            <div className="h-64 lg:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.portfolioData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    className="text-sm"
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    className="text-sm"
                    width={60}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelFormatter={(label: string) => formatDate(label)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Portfolio Value"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="costBasis" 
                    stroke="#6b7280" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Cost Basis"
                    dot={{ fill: '#6b7280', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </LazyChart>
        </div>

        {/* Daily Returns */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Returns
          </h3>
          <LazyChart height={320}>
            <div className="h-64 lg:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.dailyReturns}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    className="text-sm"
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    className="text-sm"
                    width={60}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Return']}
                    labelFormatter={(label: string) => formatDate(label)}
                  />
                  <Bar 
                    dataKey="return" 
                    fill="#10b981"
                    name="Daily Return"
                  >
                    {chartData.dailyReturns.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.return >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </LazyChart>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Asset Class Allocation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Asset Allocation
          </h3>
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <LazyChart height={256} className="h-48 lg:h-64 w-full lg:w-64 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {assetAllocation.map((_, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </LazyChart>
            <div className="flex-1 space-y-3">
              {assetAllocation.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sector Allocation
          </h3>
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <LazyChart height={256} className="h-48 lg:h-64 w-full lg:w-64 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={sectorAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sectorAllocation.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </LazyChart>
            <div className="flex-1 space-y-2 max-h-64 overflow-y-auto">
              {sectorAllocation.map((item: any, index: number) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Holdings
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search holdings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <select
                value={filterSector}
                onChange={(e) => {
                  setFilterSector(e.target.value)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                {sectors.length > 0 && sectors.map(sector => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Market Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Unrealized P/L
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  1D Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedInvestments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <p className="text-lg font-medium">No investments found</p>
                      <p className="text-sm mt-1">
                        {filteredInvestments.length === 0 
                          ? "Try adjusting your search or filter criteria"
                          : "No results on this page"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedInvestments.map((investment, index) => {
                const avgCost = investment.costBasis ? investment.costBasis / investment.quantity : investment.marketPrice * 0.9 // Use actual cost basis if available
                const costBasis = investment.costBasis || investment.quantity * avgCost
                const unrealizedPL = investment.marketValue - costBasis
                const unrealizedPLPercent = costBasis > 0 ? (unrealizedPL / costBasis) * 100 : 0
                const sector = getSector(investment.companyName, investment.sector)
                
                return (
                  <tr key={`${investment.symbol}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {investment.symbol}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {investment.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      {investment.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      {formatCurrency(avgCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      {formatCurrency(investment.marketPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      {formatCurrency(investment.marketValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className={unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(unrealizedPL)}
                      </div>
                      <div className={`text-xs ${unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(unrealizedPLPercent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className={investment.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(investment.dayChange)}
                      </div>
                      <div className={`text-xs ${investment.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(investment.dayChangePercent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {sector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => {
                          setSelectedInvestment(investment)
                          setShowInvestmentModal(true)
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title={`View details for ${investment.symbol}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredInvestments.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInvestments.length)} of {filteredInvestments.length} holdings
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(filteredInvestments.length / itemsPerPage), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(filteredInvestments.length / itemsPerPage)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {portfolioTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(transaction.date).toLocaleDateString('en-CA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transaction.type === 'Buy' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      transaction.type === 'Dividend' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {transaction.quantity || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {transaction.price ? formatCurrency(transaction.price) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash Balance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash Balance</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Available for investing</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolioSummary.cashBalance)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Settled funds</p>
          </div>
        </div>
      </div>

      {/* Investment Details Modal */}
      {showInvestmentModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="investment-modal-title"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 
                  id="investment-modal-title" 
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  {selectedInvestment.symbol} - {selectedInvestment.companyName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Investment Details
                </p>
              </div>
              <button
                onClick={() => setShowInvestmentModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Symbol:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedInvestment.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Company:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedInvestment.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Sector:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{getSector(selectedInvestment.companyName, selectedInvestment.sector)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Quantity:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedInvestment.quantity} shares</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Market Data</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Current Price:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(selectedInvestment.marketPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Market Value:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(selectedInvestment.marketValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Day Change:</span>
                      <span className={`text-sm font-medium ${selectedInvestment.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(selectedInvestment.dayChange)} ({formatPercent(selectedInvestment.dayChangePercent)})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(() => {
                    const avgCost = selectedInvestment.costBasis ? selectedInvestment.costBasis / selectedInvestment.quantity : selectedInvestment.marketPrice * 0.9
                    const costBasis = selectedInvestment.costBasis || selectedInvestment.quantity * avgCost
                    const unrealizedPL = selectedInvestment.marketValue - costBasis
                    const unrealizedPLPercent = costBasis > 0 ? (unrealizedPL / costBasis) * 100 : 0
                    
                    return (
                      <>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Cost</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(avgCost)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cost Basis</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(costBasis)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Unrealized P/L</p>
                          <p className={`text-lg font-semibold ${unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(unrealizedPL)}
                          </p>
                          <p className={`text-sm ${unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercent(unrealizedPLPercent)}
                          </p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Additional Information</h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> This is a detailed view of your {selectedInvestment.symbol} holdings. 
                    {selectedInvestment.costBasis 
                      ? 'Cost basis is based on actual purchase data from your brokerage account.' 
                      : 'Cost basis is estimated for demonstration purposes. Connect your brokerage account for accurate cost basis tracking.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Investments
