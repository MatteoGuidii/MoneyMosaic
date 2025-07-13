import { httpClient } from './http-client'
import { OverviewData, EarningsData, BudgetData, SavingsGoal, CashFlowForecast, Alert } from '../types'

export class DashboardService {
  async fetchOverviewData(): Promise<OverviewData> {
    return httpClient.get<OverviewData>('/api/overview')
  }

  async fetchEarningsData(): Promise<EarningsData> {
    return httpClient.get<EarningsData>('/api/earnings')
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
    // Note: This endpoint doesn't exist on backend yet, returning empty array
    return Promise.resolve([])
    // return httpClient.get<SavingsGoal[]>('/api/savings-goals')
  }

  async createSavingsGoal(_goal: Omit<SavingsGoal, 'id' | 'isCompleted'>): Promise<{ success: boolean; goal: SavingsGoal }> {
    // Note: This endpoint doesn't exist on backend yet, returning mock response
    return Promise.resolve({ success: false, goal: {} as SavingsGoal })
    // return httpClient.post('/api/savings-goals', goal)
  }

  async updateSavingsGoal(_id: string, _updates: Partial<SavingsGoal>): Promise<{ success: boolean }> {
    // Note: This endpoint doesn't exist on backend yet, returning mock response
    return Promise.resolve({ success: false })
    // return httpClient.put(`/api/savings-goals/${id}`, updates)
  }

  async deleteSavingsGoal(_id: string): Promise<{ success: boolean }> {
    // Note: This endpoint doesn't exist on backend yet, returning mock response
    return Promise.resolve({ success: false })
    // return httpClient.delete(`/api/savings-goals/${id}`)
  }

  async fetchCashFlowForecast(): Promise<CashFlowForecast[]> {
    // Note: This endpoint doesn't exist on backend yet, returning empty array
    return Promise.resolve([])
    // return httpClient.get<CashFlowForecast[]>('/api/cash-flow/forecast')
  }

  async fetchAlerts(): Promise<Alert[]> {
    // Note: This endpoint doesn't exist on backend yet, returning empty array
    return Promise.resolve([])
    // return httpClient.get<Alert[]>('/api/alerts')
  }

  async markAlertAsRead(_alertId: string): Promise<{ success: boolean }> {
    // Note: This endpoint doesn't exist on backend yet, returning mock response
    return Promise.resolve({ success: false })
    // return httpClient.put(`/api/alerts/${alertId}/read`)
  }

  async dismissAlert(_alertId: string): Promise<{ success: boolean }> {
    // Note: This endpoint doesn't exist on backend yet, returning mock response
    return Promise.resolve({ success: false })
    // return httpClient.delete(`/api/alerts/${alertId}`)
  }
}

export const dashboardService = new DashboardService()
