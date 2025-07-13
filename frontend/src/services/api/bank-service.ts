import { httpClient } from './http-client'
import { BankConnection } from '../types'

export class BankService {
  async fetchBankConnections(): Promise<BankConnection[]> {
    const response = await httpClient.get<{ banks: BankConnection[] }>('/api/transactions/connected_banks')
    return response.banks || []
  }

  async checkBankHealth(): Promise<{
    healthy: string[]
    unhealthy: Array<{ name: string; error: string }>
  }> {
    return httpClient.get('/api/transactions/health_check')
  }

  async removeBankConnection(bankId: number): Promise<{ success: boolean }> {
    return httpClient.delete(`/api/transactions/banks/${bankId}`)
  }

  async createLinkToken(): Promise<{ link_token: string }> {
    return httpClient.post('/api/link/token/create')
  }

  async exchangePublicToken(publicToken: string, institution: any): Promise<{ success: boolean; access_token?: string }> {
    return httpClient.post('/api/token/exchange', {
      public_token: publicToken,
      institution
    })
  }

  async syncAllBanks(): Promise<{ success: boolean }> {
    return httpClient.post('/api/transactions/sync')
  }
}

export const bankService = new BankService()
