import { Database } from '../../database';
import { BankConnectionService } from './connection.service';
import { TransactionService } from './transaction.service';
import { AnalyticsService } from './analytics.service';

export class BankService {
  public connection: BankConnectionService;
  public transaction: TransactionService;
  public analytics: AnalyticsService;

  constructor(db?: Database) {
    this.connection = new BankConnectionService(db);
    this.transaction = new TransactionService(db);
    this.analytics = new AnalyticsService(db);
  }

  // Legacy methods for backward compatibility
  async addBankConnection(data: {
    public_token: string;
    institution: any;
  }): Promise<{ access_token: string; item_id: string }> {
    return this.connection.addBankConnection(data);
  }

  async getConnectedBanks(): Promise<any[]> {
    return this.connection.getConnectedBanks();
  }

  async removeBankConnection(institutionId: number): Promise<void> {
    return this.connection.removeBankConnection(institutionId);
  }

  async fetchAllTransactions(days: number = 730): Promise<{
    transactions: any[];
    summary: any;
  }> {
    return this.transaction.fetchAllTransactions(days);
  }

  async getFilteredTransactions(filters: any): Promise<any> {
    return this.transaction.getFilteredTransactions(filters);
  }

  async getBudgetInsights(): Promise<any> {
    return this.analytics.getBudgetInsights();
  }

  async getAdvancedTransactionSummary(period: string = 'month', compareWithPrevious: boolean = false): Promise<any> {
    return this.analytics.getAdvancedTransactionSummary(period, compareWithPrevious);
  }

  async getSpendingTrends(period: 'week' | 'month' | 'quarter' = 'month'): Promise<any> {
    return this.analytics.getSpendingTrends(period);
  }

  // Direct database access methods for backward compatibility
  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<any[]> {
    return this.transaction.getTransactionsByDateRange(startDate, endDate);
  }

  async getTodaysTransactions(): Promise<any[]> {
    return this.transaction.getTodaysTransactions();
  }

  async getInstitutionByAccessToken(access_token: string): Promise<any> {
    return this.connection.getInstitutionByAccessToken(access_token);
  }

  async refreshAccounts(institutionId: number): Promise<void> {
    return this.connection.refreshAccounts(institutionId);
  }

  async getAccountsForInstitution(institutionId: number): Promise<any[]> {
    return this.connection.getAccountsForInstitution(institutionId);
  }

  async checkConnectionHealth(): Promise<{ healthy: string[], unhealthy: any[] }> {
    try {
      const banks = await this.getConnectedBanks();
      const healthy: string[] = [];
      const unhealthy: any[] = [];
      
      for (const bank of banks) {
        try {
          // Try to refresh accounts to test connection
          await this.refreshAccounts(bank.id);
          healthy.push(bank.name);
        } catch (error) {
          unhealthy.push({
            name: bank.name,
            error: (error as Error).message
          });
        }
      }
      
      return { healthy, unhealthy };
    } catch (error) {
      throw error;
    }
  }

  async syncAccountBalances(): Promise<void> {
    return this.connection.syncAccountBalances();
  }
}

// Export individual services
export * from './connection.service';
export * from './transaction.service';
export * from './analytics.service';

// Export singleton instance
export const bankService = new BankService();