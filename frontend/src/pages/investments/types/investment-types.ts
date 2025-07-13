export interface PortfolioData {
  date: string
  value: number
  costBasis: number
}

export interface DateRange {
  label: string
  days: number
}

export interface PortfolioSummary {
  totalValue: number
  totalCostBasis: number
  unrealizedPL: number
  unrealizedPLPercent: number
  todayReturn: number
  todayReturnPercent: number
  cashBalance: number
}

export interface AssetAllocation {
  name: string
  value: number
  percentage: number
}

export interface SectorAllocation {
  name: string
  value: number
  percentage: number
}

export interface PortfolioTransaction {
  id: string
  date: string
  type: 'Buy' | 'Sell' | 'Dividend' | 'Interest'
  symbol?: string
  quantity?: number
  price?: number
  amount: number
  notes?: string
}

export interface ChartData {
  portfolioData: PortfolioData[]
  dailyReturns: { date: string; return: number }[]
}

export interface InvestmentFilters {
  searchTerm: string
  filterSector: string
  currentPage: number
}

export interface InvestmentPageState {
  selectedDateRange: DateRange
  investments: any[]
  investmentSummary: any
  investmentAccounts: any
  selectedInvestment: any
  showInvestmentModal: boolean
  loading: boolean
}
