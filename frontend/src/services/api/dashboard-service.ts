import { httpClient } from './http-client'
import { OverviewData, EarningsData, BudgetData, SavingsGoal, CashFlowForecast, Alert } from '../types'

export class DashboardService {
  async fetchOverviewData(): Promise<OverviewData> {
    return httpClient.get<OverviewData>('/api/dashboard/overview')
  }

  async fetchEarningsData(): Promise<EarningsData> {
    // Use the earnings endpoint that matches the Expected EarningsData shape
    return httpClient.get<EarningsData>('/api/dashboard/earnings')
  }

  async fetchBudgetData(month?: string, year?: number): Promise<BudgetData[]> {
    const params: any = {}
    if (month) params.month = month
    if (year) params.year = year
    
    try {
      // Note: Backend doesn't have budget endpoint yet, using spending data
      // but we need to return empty array for now to prevent errors
      await httpClient.get<BudgetData[]>('/api/dashboard/spending-data', params)
      // The spending-data endpoint returns a different format, so return empty array
      return []
    } catch (error) {
      console.error('Error fetching budget data:', error)
      return []
    }
  }

  async updateBudget(_budgetData: Array<{ category: string; amount: number }>): Promise<{ success: boolean }> {
    // Note: Backend doesn't have budget update endpoint yet
    return Promise.resolve({ success: false })
    // return httpClient.post('/api/dashboard/budget', { budgets: budgetData })
  }

  async fetchSavingsGoals(): Promise<SavingsGoal[]> {
    // Note: This endpoint doesn't exist on backend yet, returning empty array
    return Promise.resolve([])
    // return httpClient.get<SavingsGoal[]>('/api/dashboard/savings-goals')
  }

  async createSavingsGoal(_goal: Omit<SavingsGoal, 'id' | 'isCompleted'>): Promise<{ success: boolean; goal: SavingsGoal }> {
    // Note: This endpoint doesn't exist on backend yet, returning mock response
    return Promise.resolve({ success: false, goal: {} as SavingsGoal })
    // return httpClient.post('/api/dashboard/savings-goals', goal)
  }

  async updateSavingsGoal(_id: string, _updates: Partial<SavingsGoal>): Promise<{ success: boolean }> {
    // Note: This endpoint doesn't exist on backend yet, returning mock response
    return Promise.resolve({ success: false })
    // return httpClient.put(`/api/dashboard/savings-goals/${id}`, updates)
  }

  async deleteSavingsGoal(_id: string): Promise<{ success: boolean }> {
    // Note: This endpoint doesn't exist on backend yet, returning mock response
    return Promise.resolve({ success: false })
    // return httpClient.delete(`/api/dashboard/savings-goals/${id}`)
  }

  async fetchCashFlowForecast(): Promise<CashFlowForecast[]> {
    return httpClient.get<CashFlowForecast[]>('/api/dashboard/cash-flow-analysis')
  }

  async fetchAlerts(): Promise<Alert[]> {
    return httpClient.get<Alert[]>('/api/transactions/alerts')
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
