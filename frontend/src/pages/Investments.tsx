import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Search,
  Eye,
  BarChart3,
  Target,
  Wallet
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
import SyncButton from '../components/SyncButton'

interface Transaction {
  id: string
  date: string
  type: 'Buy' | 'Sell' | 'Dividend' | 'Split'
  symbol: string
  quantity?: number
  price?: number
  amount: number
  notes?: string
}

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
  const itemsPerPage = 10

  useEffect(() => {
    loadInvestments()
  }, [])

  const loadInvestments = async () => {
    try {
      setLoading(true)
      const investmentsData = await apiService.fetchInvestments()
      setInvestments(investmentsData)
    } catch (error) {
      console.error('Error loading investments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data - in a real app, this would come from an API
  const dateRanges: DateRange[] = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'Last Year', days: 365 }
  ]

  // Calculate portfolio summary from real data
  const portfolioSummary = {
    totalValue: investments.reduce((sum, inv) => sum + inv.marketValue, 0),
    totalCostBasis: investments.reduce((sum, inv) => sum + (inv.quantity * inv.marketPrice * 0.9), 0), // Estimate cost basis
    unrealizedPL: investments.reduce((sum, inv) => sum + inv.dayChange * inv.quantity, 0),
    unrealizedPLPercent: 0,
    todayReturn: investments.reduce((sum, inv) => sum + inv.dayChange * inv.quantity, 0),
    todayReturnPercent: 0,
    cashBalance: 5430.25 // This would come from cash accounts
  }

  // Calculate percentages
  portfolioSummary.unrealizedPL = portfolioSummary.totalValue - portfolioSummary.totalCostBasis
  portfolioSummary.unrealizedPLPercent = portfolioSummary.totalCostBasis > 0 ? 
    (portfolioSummary.unrealizedPL / portfolioSummary.totalCostBasis) * 100 : 0
  portfolioSummary.todayReturnPercent = portfolioSummary.totalValue > 0 ? 
    (portfolioSummary.todayReturn / portfolioSummary.totalValue) * 100 : 0

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

  // Generate asset allocation from investments
  const assetAllocation = [
    { name: 'Equities', value: portfolioSummary.totalValue * 0.7, percentage: 70 },
    { name: 'Bonds', value: portfolioSummary.totalValue * 0.2, percentage: 20 },
    { name: 'ETFs', value: portfolioSummary.totalValue * 0.1, percentage: 10 },
  ]

  // Generate sector allocation from investments
  const sectorAllocation = investments.reduce((acc, inv) => {
    const sector = inv.companyName.includes('Apple') ? 'Technology' :
                  inv.companyName.includes('Google') || inv.companyName.includes('Microsoft') ? 'Technology' :
                  inv.companyName.includes('Tesla') ? 'Automotive' :
                  inv.companyName.includes('Amazon') ? 'E-commerce' :
                  inv.companyName.includes('Meta') ? 'Technology' :
                  inv.companyName.includes('Netflix') ? 'Entertainment' :
                  inv.companyName.includes('NVIDIA') ? 'Technology' : 'Other'
    
    const existing = acc.find(item => item.name === sector)
    if (existing) {
      existing.value += inv.marketValue
    } else {
      acc.push({ name: sector, value: inv.marketValue, percentage: 0 })
    }
    return acc
  }, [] as { name: string; value: number; percentage: number }[])

  // Calculate percentages
  sectorAllocation.forEach(sector => {
    sector.percentage = portfolioSummary.totalValue > 0 ? 
      (sector.value / portfolioSummary.totalValue) * 100 : 0
  })

  const portfolioTransactions: Transaction[] = [
    {
      id: '1',
      date: '2024-12-25',
      type: 'Buy',
      symbol: investments[0]?.symbol || 'AAPL',
      quantity: 10,
      price: investments[0]?.marketPrice || 175.50,
      amount: -1755.00,
      notes: 'Market Order'
    },
    {
      id: '2',
      date: '2024-12-20',
      type: 'Dividend',
      symbol: investments[1]?.symbol || 'MSFT',
      amount: 125.50,
      notes: 'Quarterly Dividend'
    },
  ]

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSector = filterSector === 'All' || getSector(investment.companyName) === filterSector
    return matchesSearch && matchesSector
  })

  const paginatedInvestments = filteredInvestments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getSector = (companyName: string) => {
    if (companyName.includes('Apple') || companyName.includes('Google') || 
        companyName.includes('Microsoft') || companyName.includes('Meta') || 
        companyName.includes('NVIDIA')) return 'Technology'
    if (companyName.includes('Tesla')) return 'Automotive'
    if (companyName.includes('Amazon')) return 'E-commerce'
    if (companyName.includes('Netflix')) return 'Entertainment'
    return 'Other'
  }

  const sectors = ['All', ...Array.from(new Set(investments.map(inv => getSector(inv.companyName))))]

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
          <div className="h-64 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioData}>
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
        </div>

        {/* Daily Returns */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Returns
          </h3>
          <div className="h-64 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyReturns}>
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
                  {dailyReturns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.return >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
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
            <div className="h-48 lg:h-64 w-full lg:w-64 flex-shrink-0">
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
                    {assetAllocation.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
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
            <div className="h-48 lg:h-64 w-full lg:w-64 flex-shrink-0">
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
                    {sectorAllocation.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 max-h-64 overflow-y-auto">
              {sectorAllocation.map((item, index) => (
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
                onChange={(e) => setFilterSector(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                {sectors.map(sector => (
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
              {paginatedInvestments.map((investment, index) => {
                const avgCost = investment.marketPrice * 0.9 // Estimate
                const costBasis = investment.quantity * avgCost
                const unrealizedPL = investment.marketValue - costBasis
                const unrealizedPLPercent = costBasis > 0 ? (unrealizedPL / costBasis) * 100 : 0
                const sector = getSector(investment.companyName)
                
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
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
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
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transaction.type === 'Buy' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      transaction.type === 'Sell' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
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
    </div>
  )
}

export default Investments
