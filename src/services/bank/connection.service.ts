import { database, Database } from '../../database';
import { plaidClient } from '../../plaidClient';

export class BankConnectionService {
  private database: Database;

  constructor(db?: Database) {
    this.database = db || database;
  }

  /**
   * Add a new bank connection using Plaid
   * 
   * ⚠️  CRITICAL PLAID API CALLS - DO NOT REMOVE:
   * - plaidClient.itemPublicTokenExchange() - Required by Plaid API
   * - plaidClient.accountsGet() - Required for account data
   * These calls implement official Plaid API endpoints and are essential.
   */
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
      throw error;
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

  // Get all connected banks
  async getConnectedBanks(): Promise<any[]> {
    try {
      return await this.database.getInstitutions();
    } catch (error) {
      console.error('Error fetching connected banks:', error);
      throw error;
    }
  }

  // Remove a bank connection
  async removeBankConnection(institutionId: number): Promise<void> {
    try {
      console.log(`🗑️  Removing bank connection for institution ${institutionId}...`);

      // Get institution to validate it exists
      const institution = await this.database.institutions.getInstitutionById(institutionId);
      if (!institution) {
        throw new Error(`Institution with ID ${institutionId} not found`);
      }

      // Remove item from Plaid
      try {
        await plaidClient.itemRemove({
          access_token: institution.access_token
        });
        console.log(`✅ Successfully removed item from Plaid`);
      } catch (plaidError) {
        console.error('Error removing item from Plaid:', plaidError);
        // Continue with database cleanup even if Plaid removal fails
      }

      // Clean up database data
      await this.database.transactions.deleteTransactionsByInstitution(institutionId);
      await this.database.accounts.deleteAccountsByInstitution(institutionId);
      await this.database.investment.deleteInvestmentDataByInstitution(institutionId);
      await this.database.institutions.deleteInstitution(institutionId);

      console.log(`✅ Successfully removed bank connection and all associated data`);
    } catch (error) {
      console.error('Error removing bank connection:', error);
      throw error;
    }
  }

  // Validate access token format
  private isValidAccessToken(token: string): boolean {
    return token.startsWith('access-sandbox-') || 
           token.startsWith('access-development-') || 
           token.startsWith('access-production-');
  }

  // Get institution by access token
  async getInstitutionByAccessToken(access_token: string): Promise<any> {
    if (!this.isValidAccessToken(access_token)) {
      throw new Error('Invalid access token format');
    }
    return await this.database.getInstitutionByAccessToken(access_token);
  }

  // Refresh accounts for an institution
  async refreshAccounts(institutionId: number): Promise<void> {
    try {
      const institution = await this.database.institutions.getInstitutionById(institutionId);
      if (!institution) {
        throw new Error(`Institution with ID ${institutionId} not found`);
      }

      await this.fetchAndSaveAccounts(institution.access_token);
    } catch (error) {
      console.error('Error refreshing accounts:', error);
      throw error;
    }
  }

  // Get accounts for a specific institution
  async getAccountsForInstitution(institutionId: number): Promise<any[]> {
    try {
      return await this.database.accounts.getAccountsByInstitution(institutionId);
    } catch (error) {
      console.error('Error fetching accounts for institution:', error);
      throw error;
    }
  }

  // Sync account balances for all connected institutions
  async syncAccountBalances(): Promise<void> {
    try {
      console.log('🔄 Syncing account balances...');
      
      const institutions = await this.database.getInstitutions();
      
      for (const institution of institutions) {
        try {
          await this.syncAccountBalancesForInstitution(institution.access_token, institution.id);
          console.log(`✅ Synced balances for institution ${institution.id}`);
        } catch (error) {
          console.error(`❌ Failed to sync balances for institution ${institution.id}:`, error);
        }
      }
      
      console.log('✅ Account balance sync completed');
    } catch (error) {
      console.error('Error syncing account balances:', error);
      throw error;
    }
  }

  // Sync account balances for a specific institution
  private async syncAccountBalancesForInstitution(access_token: string, institution_id: number): Promise<void> {
    try {
      const { data: { accounts } } = await plaidClient.accountsGet({ access_token });
      
      for (const account of accounts) {
        // Update account balance and timestamp
        await this.database.run(`
          UPDATE accounts 
          SET current_balance = ?, available_balance = ?, updated_at = CURRENT_TIMESTAMP
          WHERE account_id = ?
        `, [
          account.balances.current || 0,
          account.balances.available || account.balances.current || 0,
          account.account_id
        ]);
      }
      
      // Update institution's last sync time
      await this.database.run(`
        UPDATE institutions 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [institution_id]);
      
    } catch (error) {
      console.error('Error syncing account balances for institution:', error);
      throw error;
    }
  }
}
