import { database, Database } from '../database';
import { plaidClient } from '../plaidClient';
import { subDays, formatISO } from 'date-fns';
import { UnhealthyConnection } from '../types';

export class BankService {
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
  async fetchAllTransactions(days: number = 730): Promise<{
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

  // Fetch transactions for a specific bank using modern /transactions/sync endpoint
  private async fetchTransactionsForBank(
    access_token: string,
    institution_id: number,
    days: number
  ): Promise<any[]> {
    try {
      // Use transactions/sync for modern API approach
      let cursor: string | undefined;
      let hasMore = true;
      let allTransactions: any[] = [];

      console.log(`📋 Fetching transactions for institution ${institution_id} using /transactions/sync...`);

      while (hasMore) {
        const request: any = {
          access_token,
        };

        if (cursor) {
          request.cursor = cursor;
        }

        const response = await plaidClient.transactionsSync(request);
        const { added, modified, removed, next_cursor, has_more } = response.data;

        // Process added transactions
        for (const tx of added) {
          try {
            const type = tx.amount > 0 ? 'expense' : 'income';
            
            let category: string;
            const pfc = tx.personal_finance_category;
            if (pfc?.primary) {
              category = pfc.primary;
            } else if (Array.isArray(pfc) && pfc.length > 0) {
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
              category_detailed: pfc?.detailed || undefined,
              type,
              pending: tx.pending || false
            });

            allTransactions.push(tx);
          } catch (error) {
            console.error(`Error saving transaction ${tx.transaction_id}:`, error);
            // Continue processing other transactions
          }
        }

        // Process modified transactions
        for (const tx of modified) {
          try {
            const type = tx.amount > 0 ? 'expense' : 'income';
            
            let category: string;
            const pfc = tx.personal_finance_category;
            if (pfc?.primary) {
              category = pfc.primary;
            } else if (Array.isArray(pfc) && pfc.length > 0) {
              category = pfc[0];
            } else if (typeof pfc === 'string') {
              category = pfc;
            } else {
              category = 'Uncategorized';
            }

            await this.database.updateTransaction(tx.transaction_id, {
              amount: tx.amount,
              date: tx.date,
              name: tx.name,
              merchant_name: tx.merchant_name || undefined,
              category_primary: category,
              category_detailed: pfc?.detailed || undefined,
              type,
              pending: tx.pending || false
            });
          } catch (error) {
            console.error(`Error updating transaction ${tx.transaction_id}:`, error);
            // Continue processing other transactions
          }
        }

        // Process removed transactions
        for (const removedTx of removed) {
          try {
            await this.database.deleteTransaction(removedTx.transaction_id);
          } catch (error) {
            console.error(`Error removing transaction ${removedTx.transaction_id}:`, error);
            // Continue processing other transactions
          }
        }

        cursor = next_cursor;
        hasMore = has_more;

        console.log(`📥 Processed ${added.length} added, ${modified.length} modified, ${removed.length} removed transactions. Has more: ${hasMore}`);
      }

      console.log(`✅ Total transactions processed: ${allTransactions.length}`);

      // Return transactions from database within the requested date range
      const endDate = formatISO(new Date(), { representation: 'date' });
      const startDate = formatISO(subDays(new Date(), days), { representation: 'date' });
      
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

  // Fetch historical transactions using legacy /transactions/get endpoint
  async fetchHistoricalTransactions(
    access_token: string,
    institution_id: number,
    startDate: string = '2024-01-01' // Default to start of 2024
  ): Promise<any[]> {
    try {
      console.log(`📅 Fetching historical transactions for institution ${institution_id} from ${startDate}...`);

      const endDate = formatISO(new Date(), { representation: 'date' });
      
      let allTransactions: any[] = [];
      let offset = 0;
      const count = 500; // Maximum allowed per request
      let hasMore = true;

      while (hasMore) {
        try {
          const request = {
            access_token,
            start_date: startDate,
            end_date: endDate,
            count,
            offset
          };

          const response = await plaidClient.transactionsGet(request);
          const { transactions, total_transactions } = response.data;

          console.log(`📥 Fetched ${transactions.length} transactions (offset: ${offset}, total: ${total_transactions})`);

          // Save transactions to database
          for (const tx of transactions) {
            try {
              const type = tx.amount > 0 ? 'expense' : 'income';
              
              let category: string;
              const pfc = tx.personal_finance_category;
              if (pfc?.primary) {
                category = pfc.primary;
              } else if (Array.isArray(pfc) && pfc.length > 0) {
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
                category_detailed: tx.category ? tx.category.join(', ') : undefined,
                type,
                pending: tx.pending || false
              });

              allTransactions.push(tx);
            } catch (dbError) {
              console.error(`Error saving transaction ${tx.transaction_id}:`, dbError);
              // Continue processing other transactions
            }
          }

          offset += transactions.length;
          hasMore = offset < total_transactions;
          
          // Add a small delay to avoid rate limits
          if (hasMore) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error: any) {
          console.error(`Error fetching transactions at offset ${offset}:`, error);
          // If we get an error, stop fetching more
          hasMore = false;
        }
      }

      console.log(`✅ Historical fetch completed: ${allTransactions.length} transactions from ${startDate}`);
      return allTransactions;
    } catch (error) {
      console.error(`Error fetching historical transactions for institution ${institution_id}:`, error);
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
    unhealthy: UnhealthyConnection[];
  }> {
    const institutions = await this.database.getInstitutions();
    const healthy: string[] = [];
    const unhealthy: UnhealthyConnection[] = [];

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

  /**
   * Sync bank data for all connected institutions
   * 
   * ⚠️  CRITICAL PLAID API CALLS - DO NOT REMOVE:
   * - plaidClient.accountsGet() - Required for account sync
   * - plaidClient.transactionsGet() - Required for transaction sync
   * These implement official Plaid API endpoints for data synchronization.
   */
  async syncBankData(): Promise<void> {
    const institutions = await this.database.getInstitutions();

    for (const institution of institutions) {
      try {
        // Fetch and save accounts
        await this.fetchAndSaveAccounts(institution.access_token);

        // Fetch and save transactions (last 30 days)
        await this.fetchTransactionsForBank(institution.access_token, institution.id, 30);
      } catch (error) {
        console.error(`Error syncing data for institution ${institution.id}:`, error);
        // Handle or log error as needed, but don't stop the sync process
      }
    }
  }

  // Check available transaction date range for an institution
  async checkTransactionDateRange(access_token: string, institution_id: number): Promise<{
    earliestDate: string | null;
    latestDate: string | null;
    availableTransactionCount: number;
  }> {
    try {
      console.log(`📅 Checking transaction date range for institution ${institution_id}...`);

      // Try to get a small sample of transactions with a wide date range
      const twoYearsAgo = formatISO(subDays(new Date(), 730), { representation: 'date' });
      const today = formatISO(new Date(), { representation: 'date' });
      
      const request = {
        access_token,
        start_date: twoYearsAgo,
        end_date: today
      };

      const response = await plaidClient.transactionsGet(request);
      const { transactions, total_transactions } = response.data;

      if (transactions.length === 0) {
        return {
          earliestDate: null,
          latestDate: null,
          availableTransactionCount: 0
        };
      }

      // Find the earliest and latest dates
      const dates = transactions.map(tx => tx.date).sort();
      const earliestDate = dates[0];
      const latestDate = dates[dates.length - 1];

      console.log(`📊 Institution ${institution_id} has ${total_transactions} transactions available from ${earliestDate} to ${latestDate}`);

      return {
        earliestDate,
        latestDate,
        availableTransactionCount: total_transactions
      };
    } catch (error) {
      console.error(`Error checking transaction date range for institution ${institution_id}:`, error);
      return {
        earliestDate: null,
        latestDate: null,
        availableTransactionCount: 0
      };
    }
  }

  // Validate access token format
  private isValidAccessToken(token: string): boolean {
    return token.startsWith('access-sandbox-') || 
           token.startsWith('access-development-') || 
           token.startsWith('access-production-');
  }
}

export const bankService = new BankService();
