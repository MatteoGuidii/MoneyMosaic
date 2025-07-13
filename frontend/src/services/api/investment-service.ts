import { httpClient } from './http-client'
import { Investment, InvestmentSummary, InvestmentTransaction } from '../types'

export class InvestmentService {
  async fetchInvestments(): Promise<Investment[]> {
    const response = await httpClient.get<{ investments: Investment[] }>('/api/investments')
    return response.investments || []
  }

  async fetchInvestmentAccounts(): Promise<any> {
    return httpClient.get('/api/investments/accounts')
  }

  async fetchInvestmentSummary(): Promise<InvestmentSummary> {
    return httpClient.get<InvestmentSummary>('/api/investments/summary')
  }

  async fetchInvestmentTransactions(filters: {
    startDate?: string
    endDate?: string
    accountId?: string
    securityId?: string
    limit?: number
    offset?: number
  }): Promise<{
    transactions: InvestmentTransaction[]
    totalCount: number
    hasMore: boolean
  }> {
    return httpClient.get('/api/investments/transactions', filters)
  }

  async fetchInvestmentData(): Promise<{
    investments: Investment[]
    accounts: any
    summary: InvestmentSummary
  }> {
    try {
      const [investments, accounts, summary] = await Promise.all([
        this.fetchInvestments(),
        this.fetchInvestmentAccounts(),
        this.fetchInvestmentSummary()
      ])
      return { investments, accounts, summary }
    } catch (error) {
      console.error('Error fetching investment data:', error)
      return {
        investments: [],
        accounts: { hasInvestmentAccounts: false, supportsDetailedData: false },
        summary: {
          totalValue: 0,
          totalCostBasis: 0,
          totalDayChange: 0,
          totalDayChangePercent: 0,
          holdingsCount: 0,
          accountsCount: 0,
          topHoldings: [],
          sectorAllocation: []
        }
      }
    }
  }

  async syncInvestments(): Promise<{ success: boolean; message?: string }> {
    return httpClient.post('/api/investments/sync')
  }
}

export const investmentService = new InvestmentService()
