import { PortfolioSummary, AssetAllocation, PortfolioTransaction, ChartData } from '../types/investment-types'

export const DATE_RANGES = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'Last 6 Months', days: 180 }
]

export const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

export const ITEMS_PER_PAGE = 10

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2
  }).format(value)
}

export const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

export const getSector = (companyName: string, sector?: string): string => {
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
}

export const generateMockChartData = (portfolioSummary: PortfolioSummary): ChartData => {
  const portfolioData = [
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
}

export const generateMockAssetAllocation = (totalValue: number): AssetAllocation[] => [
  { name: 'Equities', value: totalValue * 0.7, percentage: 70 },
  { name: 'Bonds', value: totalValue * 0.2, percentage: 20 },
  { name: 'ETFs', value: totalValue * 0.1, percentage: 10 },
]

export const generateMockPortfolioTransactions = (investments: any[]): PortfolioTransaction[] => [
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
