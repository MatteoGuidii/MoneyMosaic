import { httpClient } from './http-client'
import { OverviewData, EarningsData, BudgetData, SavingsGoal, CashFlowForecast, Alert } from '../types'

export class DashboardService {
  async fetchOverviewData(): Promise<OverviewData> {
    return httpClient.get<OverviewData>('/api/dashboard/overview')
  }

  async fetchEarningsData(): Promise<EarningsData> {
    return httpClient.get<EarningsData>('/api/dashboard/earnings')
  }

  async fetchBudgetData(month?: string, year?: number): Promise<BudgetData[]> {
    const params: any = {}
    if (month) params.month = month
    if (year) params.year = year
    return httpClient.get<BudgetData[]>('/api/budget', params)
  }

  async updateBudget(budgetData: Array<{ category: string; amount: number }>): Promise<{ success: boolean }> {
    return httpClient.post('/api/budget', { budgets: budgetData })
  }

  async fetchSavingsGoals(): Promise<SavingsGoal[]> {
    return httpClient.get<SavingsGoal[]>('/api/savings-goals')
  }

  async createSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'isCompleted'>): Promise<{ success: boolean; goal: SavingsGoal }> {
    return httpClient.post('/api/savings-goals', goal)
  }

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<{ success: boolean }> {
    return httpClient.put(`/api/savings-goals/${id}`, updates)
  }

  async deleteSavingsGoal(id: string): Promise<{ success: boolean }> {
    return httpClient.delete(`/api/savings-goals/${id}`)
  }

  async fetchCashFlowForecast(): Promise<CashFlowForecast[]> {
    return httpClient.get<CashFlowForecast[]>('/api/cash-flow/forecast')
  }

  async fetchAlerts(): Promise<Alert[]> {
    return httpClient.get<Alert[]>('/api/alerts')
  }

  async markAlertAsRead(alertId: string): Promise<{ success: boolean }> {
    return httpClient.put(`/api/alerts/${alertId}/read`)
  }

  async dismissAlert(alertId: string): Promise<{ success: boolean }> {
    return httpClient.delete(`/api/alerts/${alertId}`)
  }
}

export const dashboardService = new DashboardService()
