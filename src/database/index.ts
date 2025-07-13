import { DatabaseConnection } from './connection';
import { InstitutionsModel } from './models/institutions';
import { AccountsModel } from './models/accounts';
import { TransactionsModel } from './models/transactions';
import { BudgetsModel } from './models/budgets';
import { InvestmentModel } from './models/investment';
import { MarketDataModel } from './models/marketData';

export class Database {
  private connection: DatabaseConnection;
  public institutions: InstitutionsModel;
  public accounts: AccountsModel;
  public transactions: TransactionsModel;
  public budgets: BudgetsModel;
  public investment: InvestmentModel;
  public marketData: MarketDataModel;

  constructor(dbPath?: string) {
    this.connection = new DatabaseConnection(dbPath);
    this.institutions = new InstitutionsModel(this.connection);
    this.accounts = new AccountsModel(this.connection);
    this.transactions = new TransactionsModel(this.connection);
    this.budgets = new BudgetsModel(this.connection);
    this.investment = new InvestmentModel(this.connection);
    this.marketData = new MarketDataModel(this.connection);
  }

  // Expose connection methods for backward compatibility
  async run(sql: string, params: any[] = []): Promise<void> {
    return this.connection.run(sql, params);
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return this.connection.get(sql, params);
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    return this.connection.all(sql, params);
  }

  async close(): Promise<void> {
    return this.connection.close();
  }

  async cleanAllData(): Promise<void> {
    return this.connection.cleanAllData();
  }

  // Legacy methods for backward compatibility
  async saveInstitution(data: any): Promise<void> {
    return this.institutions.saveInstitution(data);
  }

  async getInstitutions(): Promise<any[]> {
    return this.institutions.getInstitutions();
  }

  async getInstitutionByAccessToken(access_token: string): Promise<any> {
    return this.institutions.getInstitutionByAccessToken(access_token);
  }

  async saveAccount(data: any): Promise<void> {
    return this.accounts.saveAccount(data);
  }

  async getAccountsByInstitution(institution_id: number): Promise<any[]> {
    return this.accounts.getAccountsByInstitution(institution_id);
  }

  async saveTransaction(data: any): Promise<void> {
    return this.transactions.saveTransaction(data);
  }

  async updateTransaction(transaction_id: string, data: any): Promise<void> {
    return this.transactions.updateTransaction(transaction_id, data);
  }

  async deleteTransaction(transaction_id: string): Promise<void> {
    return this.transactions.deleteTransaction(transaction_id);
  }

  async getTransactions(filters: any = {}): Promise<any[]> {
    return this.transactions.getTransactions(filters);
  }

  async getTransactionSummary(filters: any = {}): Promise<any> {
    return this.transactions.getTransactionSummary(filters);
  }

  async createOrUpdateBudget(category: string, amount: number, month: string, year: number): Promise<void> {
    return this.budgets.createOrUpdateBudget(category, amount, month, year);
  }

  async getBudgets(month: string, year: number): Promise<any[]> {
    return this.budgets.getBudgets(month, year);
  }

  async deleteBudget(category: string, month: string, year: number): Promise<void> {
    return this.budgets.deleteBudget(category, month, year);
  }

  async getBudgetWithSpending(month: string, year: number): Promise<any[]> {
    return this.budgets.getBudgetWithSpending(month, year);
  }

  async upsertSecurity(security: any): Promise<void> {
    return this.investment.upsertSecurity(security);
  }

  async upsertHolding(holding: any): Promise<void> {
    return this.investment.upsertHolding(holding);
  }

  async insertInvestmentTransaction(transaction: any): Promise<void> {
    return this.investment.insertInvestmentTransaction(transaction);
  }

  async getHoldings(accountId?: string): Promise<any[]> {
    return this.investment.getHoldings(accountId);
  }

  async getInvestmentTransactions(filters: any = {}): Promise<any[]> {
    return this.investment.getInvestmentTransactions(filters);
  }

  async getPortfolioSummary(): Promise<any> {
    return this.investment.getPortfolioSummary();
  }

  async upsertMarketData(marketData: any): Promise<void> {
    return this.marketData.upsertMarketData(marketData);
  }

  async getMarketData(symbol?: string, date?: string): Promise<any[]> {
    return this.marketData.getMarketData(symbol, date);
  }
}

// Export singleton instance
export const database = new Database();
export * from './models/institutions';
export * from './models/accounts';
export * from './models/transactions';
export * from './models/budgets';
export * from './models/investment';
export * from './models/marketData';
export * from './connection';
