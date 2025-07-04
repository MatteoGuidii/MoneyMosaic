import { database, Database } from '../database';
import { plaidClient } from '../plaidClient';
import { subDays, formatISO } from 'date-fns';

export class BankService {
  private database: Database;

  constructor(db?: Database) {
    this.database = db || database;
  }
  // Store a new bank connection
  async addBankConnection(data: {
    public_token: string;
    institution: any;
  }): Promise<{ access_token: string; item_id: string }> {
    try {
      // Exchange public token for access token
      const { data: tokenData } = await plaidClient.itemPublicTokenExchange({
        public_token: data.public_token
      });

      // Save institution to database
      await this.database.saveInstitution({
        institution_id: data.institution.institution_id,
        name: data.institution.name,
        access_token: tokenData.access_token,
        item_id: tokenData.item_id
      });

      // Fetch and save accounts
      await this.fetchAndSaveAccounts(tokenData.access_token);

      return {
        access_token: tokenData.access_token,
        item_id: tokenData.item_id
      };
    } catch (error) {
      console.error('Error adding bank connection:', error);
      throw error; // Preserve original error instead of wrapping it
    }
  }

  // Fetch accounts for a given access token
  private async fetchAndSaveAccounts(access_token: string): Promise<void> {
    try {
      const { data: { accounts } } = await plaidClient.accountsGet({ access_token });
      const institution = await this.database.getInstitutionByAccessToken(access_token);

      for (const account of accounts) {
        await this.database.saveAccount({
          account_id: account.account_id,
          institution_id: institution.id,
          name: account.name,
          official_name: account.official_name || undefined,
          type: account.type,
          subtype: account.subtype || undefined,
          mask: account.mask || undefined,
          current_balance: account.balances.current || undefined,
          available_balance: account.balances.available || undefined
        });
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  // Fetch transactions for all connected banks
  async fetchAllTransactions(days: number = 30): Promise<{
    transactions: any[];
    summary: any;
  }> {
    try {
      const institutions = await this.database.getInstitutions();
      
      // If no institutions are connected, return empty results
      if (institutions.length === 0) {
        console.log('📭 No banks connected. Returning empty transaction data.');
        return {
          transactions: [],
          summary: {
            totalExpenses: 0,
            totalIncome: 0,
            netCashFlow: 0,
            transactionCount: 0
          }
        };
      }

      const allTransactions: any[] = [];

      console.log(`🏦 Fetching transactions from ${institutions.length} connected bank(s)...`);

      // Fetch transactions from each institution
      for (const institution of institutions) {
        try {
          // Validate access token format before making API call
          if (!this.isValidAccessToken(institution.access_token)) {
            console.error(`❌ Invalid access token format for ${institution.name} (ID: ${institution.id}). Skipping...`);
            console.error(`   Expected format: access-<environment>-<identifier>`);
            console.error(`   Actual token: ${institution.access_token}`);
            continue;
          }

          const bankTransactions = await this.fetchTransactionsForBank(
            institution.access_token,
            institution.id,
            days
          );
          allTransactions.push(...bankTransactions);
        } catch (error: any) {
          console.error(`Error fetching transactions for institution ${institution.id}:`, error);
          
          // Provide more detailed error information
          if (error.response?.data?.error_code === 'INVALID_ACCESS_TOKEN') {
            console.error(`❌ Invalid access token for ${institution.name}. This institution may need to be reconnected.`);
          } else if (error.response?.data?.error_code) {
            console.error(`❌ Plaid API error for ${institution.name}: ${error.response.data.error_code} - ${error.response.data.error_message}`);
          }
          
          // Continue with other banks even if one fails
        }
      }

      // Get summary from database
      const endDate = formatISO(new Date(), { representation: 'date' });
      const startDate = formatISO(subDays(new Date(), days), { representation: 'date' });
      
      const summary = await this.database.getTransactionSummary({
        start_date: startDate,
        end_date: endDate
      });

      return {
        transactions: allTransactions,
        summary
      };
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error; // Preserve original error
    }
  }

  // Fetch transactions for a specific bank
  private async fetchTransactionsForBank(
    access_token: string,
    institution_id: number,
    days: number
  ): Promise<any[]> {
    const endDate = formatISO(new Date(), { representation: 'date' });
    const startDate = formatISO(subDays(new Date(), days), { representation: 'date' });

    try {
      const { data: { transactions: txns } } = await plaidClient.transactionsGet({
        access_token,
        start_date: startDate,
        end_date: endDate,
        options: { count: 500, offset: 0 }
      });

      // Save transactions to database
      for (const tx of txns) {
        const type = tx.amount > 0 ? 'expense' : 'income';
        
        let category: string;
        const pfc = tx.personal_finance_category;
        if (Array.isArray(pfc) && pfc.length > 0) {
          category = pfc[0];
        } else if (typeof pfc === 'string') {
          category = pfc;
        } else {
          category = 'Uncategorized';
        }

        await this.database.saveTransaction({
          transaction_id: tx.transaction_id,
          account_id: tx.account_id,
          institution_id,
          amount: tx.amount,
          date: tx.date,
          name: tx.name,
          merchant_name: tx.merchant_name || undefined,
          category_primary: category,
          category_detailed: Array.isArray(pfc) && pfc.length > 1 ? pfc[1] : null,
          type,
          pending: tx.pending
        });
      }

      // Return transactions from database (includes institution/account names)
      return this.database.getTransactions({
        institution_id,
        start_date: startDate,
        end_date: endDate
      });
    } catch (error) {
      console.error(`Error fetching transactions for institution ${institution_id}:`, error);
      throw error;
    }
  }

  // Get all connected banks
  async getConnectedBanks(): Promise<any[]> {
    return this.database.getInstitutions();
  }

  // Remove a bank connection
  async removeBankConnection(institution_id: number): Promise<void> {
    try {
      // Start a transaction to ensure all deletions happen atomically
      await this.database.run('BEGIN TRANSACTION');
      
      // First, get all accounts for this institution
      const accounts = await this.database.all(
        'SELECT account_id FROM accounts WHERE institution_id = ?',
        [institution_id]
      );
      
      // Delete all transactions for accounts belonging to this institution
      for (const account of accounts) {
        await this.database.run(
          'DELETE FROM transactions WHERE account_id = ?',
          [account.account_id]
        );
      }
      
      // Delete all accounts for this institution
      await this.database.run(
        'DELETE FROM accounts WHERE institution_id = ?',
        [institution_id]
      );
      
      // Finally, delete the institution itself
      await this.database.run(
        'DELETE FROM institutions WHERE id = ?',
        [institution_id]
      );
      
      // Commit the transaction
      await this.database.run('COMMIT');
      
      console.log(`✅ Successfully removed bank connection and all associated data for institution ${institution_id}`);
    } catch (error) {
      // Rollback on error
      await this.database.run('ROLLBACK');
      console.error('Error removing bank connection:', error);
      throw error;
    }
  }

  // Health check for all connections
  async checkConnectionHealth(): Promise<{
    healthy: string[];
    unhealthy: { name: string; error: string }[];
  }> {
    const institutions = await this.database.getInstitutions();
    const healthy: string[] = [];
    const unhealthy: { name: string; error: string }[] = [];

    for (const institution of institutions) {
      try {
        await plaidClient.accountsGet({ access_token: institution.access_token });
        healthy.push(institution.name);
      } catch (error: any) {
        unhealthy.push({
          name: institution.name,
          error: error.error_code || 'Unknown error'
        });
      }
    }

    return { healthy, unhealthy };
  }

  // Validate access token format
  private isValidAccessToken(token: string): boolean {
    return token.startsWith('access-sandbox-') || 
           token.startsWith('access-development-') || 
           token.startsWith('access-production-');
  }
}

export const bankService = new BankService();
