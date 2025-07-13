import { SpendingData, CategoryData } from '../../../services/apiService'

export interface ChartsSectionProps {
  spendingData: SpendingData[]
  categoryData: CategoryData[]
  onCategorySelect: (category: string) => void
  onCategoryPeriodChange?: (period: string) => void
}

export interface SpendingChartProps {
  spendingData: SpendingData[]
}

export interface CategoryChartProps {
  categoryData: CategoryData[]
  onCategorySelect: (category: string) => void
  onCategoryPeriodChange?: (period: string) => void
}

export interface CategoryOption {
  value: string
  label: string
}

export interface CategoryListProps {
  categoryData: CategoryData[]
  selectedCategory: string
  onCategorySelect: (category: string) => void
  colors: string[]
}

export interface ChartContainerProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  children: React.ReactNode
  actions?: React.ReactNode
}
