import { httpClient } from './http-client'
import { Account, NetWorthData } from '../types'

export class AccountService {
  async fetchAccounts(): Promise<Account[]> {
    return httpClient.get<Account[]>('/api/accounts')
  }

  async fetchNetWorthData(_dateRange: string): Promise<NetWorthData[]> {
    // Net worth data would be calculated from account balances over time
    // For now, this endpoint doesn't exist, so we'll return empty array
    return Promise.resolve([])
    // return httpClient.get<NetWorthData[]>('/api/accounts/net-worth', { dateRange })
  }

  async updateAccountNickname(accountId: string, nickname: string): Promise<{ success: boolean }> {
    return httpClient.put(`/api/accounts/${accountId}/nickname`, { nickname })
  }

  async toggleAccountVisibility(accountId: string, isVisible: boolean): Promise<{ success: boolean }> {
    return httpClient.put(`/api/accounts/${accountId}/visibility`, { isVisible })
  }

  async deleteAccount(accountId: string): Promise<{ success: boolean }> {
    return httpClient.delete(`/api/accounts/${accountId}`)
  }
}

export const accountService = new AccountService()
