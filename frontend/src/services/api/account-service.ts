import { httpClient } from './http-client'
import { Account, NetWorthData } from '../types'

export class AccountService {
  async fetchAccounts(): Promise<Account[]> {
    return httpClient.get<Account[]>('/api/accounts')
  }

  async fetchNetWorthData(dateRange: string): Promise<NetWorthData[]> {
    return httpClient.get<NetWorthData[]>('/api/net-worth', { dateRange })
  }

  async updateAccountNickname(accountId: string, nickname: string): Promise<{ success: boolean }> {
    return httpClient.put(`/api/accounts/${accountId}/nickname`, { nickname })
  }

  async toggleAccountVisibility(accountId: string, isVisible: boolean): Promise<{ success: boolean }> {
    return httpClient.put(`/api/accounts/${accountId}/visibility`, { isVisible })
  }
}

export const accountService = new AccountService()
