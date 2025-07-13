export interface AnalyticsData {
  trends: SpendingTrends | null
  insights: BudgetInsights | null
  summary: TransactionSummary | null
  alerts: SpendingAlerts | null
  categoryAnalysis: CategoryAnalysis | null
}

export interface SpendingTrends {
  categoryTrends: CategoryTrend[]
  topMerchants: Merchant[]
}

export interface CategoryTrend {
  category: string
  trend: 'increasing' | 'decreasing' | 'stable'
  changePercent: number
}

export interface Merchant {
  name: string
  amount: number
  frequency: number
}

export interface BudgetInsights {
  savingsOpportunities: SavingsOpportunity[]
}

export interface SavingsOpportunity {
  category: string
  suggestion: string
  potentialSavings: number
}

export interface TransactionSummary {
  summary: {
    totalIncome: number
    totalExpenses: number
    netCashFlow: number
    savingsRate: number
    topExpenseCategory: string
  }
  comparison?: {
    changes: {
      totalIncome: { percentage: number }
      totalExpenses: { percentage: number }
      netCashFlow: { percentage: number }
    }
  }
}

export interface SpendingAlerts {
  spendingAlerts: Alert[]
  budgetAlerts: Alert[]
}

export interface Alert {
  severity: 'high' | 'medium' | 'low'
  message: string
  date: string
  amount: number
}

export interface CategoryAnalysis {
  category: string
  totalSpent: number
  avgPerTransaction: number
  topMerchants: Merchant[]
  recommendations: string[]
}

export interface AnalyticsState {
  loading: boolean
  selectedPeriod: string
  selectedCategory: string | null
  data: AnalyticsData
}

export interface PeriodSelectorProps {
  selectedPeriod: string
  onPeriodChange: (period: string) => void
}

export interface SummaryCardsProps {
  summary: TransactionSummary
  selectedPeriod: string
}

export interface SpendingAlertsProps {
  alerts: SpendingAlerts
}

export interface CategoryTrendsProps {
  trends: SpendingTrends
  onCategorySelect: (category: string) => void
}

export interface TopMerchantsProps {
  merchants: Merchant[]
}

export interface SavingsOpportunitiesProps {
  opportunities: SavingsOpportunity[]
}

export interface CategoryAnalysisModalProps {
  isOpen: boolean
  category: string | null
  analysis: CategoryAnalysis | null
  onClose: () => void
}
