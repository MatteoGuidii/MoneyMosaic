export interface BudgetFormData {
  category: string
  amount: number
}

export interface BudgetSummary {
  totalBudgeted: number
  totalSpent: number
  totalRemaining: number
}

export interface BudgetCategory {
  name: string
  suggestedMax: number
}

export interface BudgetActions {
  onSave: (formData: BudgetFormData) => Promise<void>
  onEdit: (category: string) => void
  onDelete: (category: string) => Promise<void>
}

export interface BudgetListProps {
  budgets: import('../../../services/types').BudgetData[]
  onEdit: (budget: import('../../../services/types').BudgetData) => void
  onDelete: (category: string) => Promise<void>
}

export interface BudgetSummaryProps {
  summary: BudgetSummary
}
