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
  // Note: Default changed from 30 to 730 days (major version change)
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

      // Return the transactions that were just processed instead of
      // querying the database again. This avoids an extra DB round trip
      // and guarantees the response contains exactly the newly fetched
      // records.
      return allTransactions;
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
            // Use minimal delay in production, keep some delay for development
            const delay = process.env.NODE_ENV === 'production' ? 50 : 100;
            await new Promise(resolve => setTimeout(resolve, delay));
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

  // Advanced transaction filtering for financial analysis
  async getFilteredTransactions(filters: {
    days?: number;
    institution_id?: number;
    account_id?: string;
    category?: string;
    merchant?: string;
    min_amount?: number;
    max_amount?: number;
    transaction_type?: 'expense' | 'income';
    pending?: boolean;
    search_term?: string;
  }): Promise<{
    transactions: any[];
    summary: {
      totalAmount: number;
      averageAmount: number;
      transactionCount: number;
      categoryBreakdown: { [key: string]: number };
      merchantBreakdown: { [key: string]: number };
      dailySpending: { [key: string]: number };
    };
  }> {
    try {
      console.log(`🔍 Filtering transactions with criteria:`, filters);

      const endDate = formatISO(new Date(), { representation: 'date' });
      const startDate = formatISO(subDays(new Date(), filters.days || 30), { representation: 'date' });
      
      // Get all transactions first, then filter in memory
      let transactions = await this.database.getTransactions({
        institution_id: filters.institution_id,
        account_id: filters.account_id,
        start_date: startDate,
        end_date: endDate
      });

      // Apply additional filters in memory
      if (filters.category) {
        transactions = transactions.filter((tx: any) => 
          tx.category_primary?.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }

      if (filters.merchant) {
        transactions = transactions.filter((tx: any) => 
          tx.merchant_name?.toLowerCase().includes(filters.merchant!.toLowerCase())
        );
      }

      if (filters.min_amount !== undefined) {
        transactions = transactions.filter((tx: any) => Math.abs(tx.amount) >= filters.min_amount!);
      }

      if (filters.max_amount !== undefined) {
        transactions = transactions.filter((tx: any) => Math.abs(tx.amount) <= filters.max_amount!);
      }

      if (filters.transaction_type) {
        transactions = transactions.filter((tx: any) => tx.type === filters.transaction_type);
      }

      if (filters.pending !== undefined) {
        transactions = transactions.filter((tx: any) => tx.pending === filters.pending);
      }

      if (filters.search_term) {
        const searchTerm = filters.search_term.toLowerCase();
        transactions = transactions.filter((tx: any) => 
          tx.name?.toLowerCase().includes(searchTerm) ||
          tx.merchant_name?.toLowerCase().includes(searchTerm)
        );
      }

      // Calculate summary statistics
      const totalAmount = transactions.reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0);
      const averageAmount = transactions.length > 0 ? totalAmount / transactions.length : 0;
      
      const categoryBreakdown: { [key: string]: number } = {};
      const merchantBreakdown: { [key: string]: number } = {};
      const dailySpending: { [key: string]: number } = {};

      transactions.forEach((tx: any) => {
        // Category breakdown
        if (tx.category_primary) {
          categoryBreakdown[tx.category_primary] = (categoryBreakdown[tx.category_primary] || 0) + Math.abs(tx.amount);
        }
        
        // Merchant breakdown
        if (tx.merchant_name) {
          merchantBreakdown[tx.merchant_name] = (merchantBreakdown[tx.merchant_name] || 0) + Math.abs(tx.amount);
        }
        
        // Daily spending
        const date = tx.date;
        if (tx.type === 'expense') {
          dailySpending[date] = (dailySpending[date] || 0) + Math.abs(tx.amount);
        }
      });

      return {
        transactions,
        summary: {
          totalAmount,
          averageAmount,
          transactionCount: transactions.length,
          categoryBreakdown,
          merchantBreakdown,
          dailySpending
        }
      };
    } catch (error) {
      console.error('Error filtering transactions:', error);
      throw error;
    }
  }

  // Get spending trends over time
  async getSpendingTrends(days: number = 90): Promise<{
    weeklyTrends: { week: string; amount: number }[];
    monthlyTrends: { month: string; amount: number }[];
    categoryTrends: { category: string; trend: 'increasing' | 'decreasing' | 'stable'; changePercent: number }[];
    topMerchants: { name: string; amount: number; frequency: number }[];
  }> {
    try {
      console.log(`📈 Analyzing spending trends over ${days} days...`);

      const endDate = formatISO(new Date(), { representation: 'date' });
      const startDate = formatISO(subDays(new Date(), days), { representation: 'date' });
      
      const allTransactions = await this.database.getTransactions({
        start_date: startDate,
        end_date: endDate
      });

      // Filter to only expense transactions (positive amounts)
      const transactions = allTransactions.filter(tx => tx.amount > 0);

      // Weekly trends
      const weeklyTrends = this.calculateWeeklyTrends(transactions);
      
      // Monthly trends
      const monthlyTrends = this.calculateMonthlyTrends(transactions);
      
      // Category trends
      const categoryTrends = this.calculateCategoryTrends(transactions);
      
      // Top merchants
      const topMerchants = this.calculateTopMerchants(transactions);

      return {
        weeklyTrends,
        monthlyTrends,
        categoryTrends,
        topMerchants
      };
    } catch (error) {
      console.error('Error analyzing spending trends:', error);
      throw error;
    }
  }

  // Helper methods for trend analysis
  private calculateWeeklyTrends(transactions: any[]): { week: string; amount: number }[] {
    const weeklyData: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
      const weekKey = formatISO(weekStart, { representation: 'date' });
      
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + Math.abs(tx.amount);
    });

    return Object.entries(weeklyData)
      .map(([week, amount]) => ({ week, amount }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  private calculateMonthlyTrends(transactions: any[]): { month: string; amount: number }[] {
    const monthlyData: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Math.abs(tx.amount);
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateCategoryTrends(transactions: any[]): { category: string; trend: 'increasing' | 'decreasing' | 'stable'; changePercent: number }[] {
    // Split transactions into two halves to compare trends
    const midPoint = Math.floor(transactions.length / 2);
    const firstHalf = transactions.slice(0, midPoint);
    const secondHalf = transactions.slice(midPoint);

    const firstHalfCategories: { [key: string]: number } = {};
    const secondHalfCategories: { [key: string]: number } = {};

    firstHalf.forEach(tx => {
      if (tx.category_primary) {
        firstHalfCategories[tx.category_primary] = (firstHalfCategories[tx.category_primary] || 0) + Math.abs(tx.amount);
      }
    });

    secondHalf.forEach(tx => {
      if (tx.category_primary) {
        secondHalfCategories[tx.category_primary] = (secondHalfCategories[tx.category_primary] || 0) + Math.abs(tx.amount);
      }
    });

    const categories = new Set([...Object.keys(firstHalfCategories), ...Object.keys(secondHalfCategories)]);
    
    return Array.from(categories).map(category => {
      const firstAmount = firstHalfCategories[category] || 0;
      const secondAmount = secondHalfCategories[category] || 0;
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      let changePercent = 0;

      if (firstAmount > 0) {
        changePercent = ((secondAmount - firstAmount) / firstAmount) * 100;
        if (changePercent > 10) trend = 'increasing';
        else if (changePercent < -10) trend = 'decreasing';
      } else if (secondAmount > 0) {
        trend = 'increasing';
        changePercent = 100;
      }

      return { category, trend, changePercent };
    });
  }

  private calculateTopMerchants(transactions: any[]): { name: string; amount: number; frequency: number }[] {
    const merchantData: { [key: string]: { amount: number; frequency: number } } = {};
    
    transactions.forEach(tx => {
      if (tx.merchant_name) {
        if (!merchantData[tx.merchant_name]) {
          merchantData[tx.merchant_name] = { amount: 0, frequency: 0 };
        }
        merchantData[tx.merchant_name].amount += Math.abs(tx.amount);
        merchantData[tx.merchant_name].frequency += 1;
      }
    });

    return Object.entries(merchantData)
      .map(([name, data]) => ({ name, amount: data.amount, frequency: data.frequency }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10 merchants
  }

  // Get budget insights and recommendations
  async getBudgetInsights(): Promise<{
    categorySpending: { category: string; spent: number; avgMonthly: number; recommendation: string }[];
    unusualSpending: { merchant: string; amount: number; date: string; reason: string }[];
    savingsOpportunities: { category: string; potentialSavings: number; suggestion: string }[];
  }> {
    try {
      console.log(`💡 Analyzing budget insights...`);

      const last30Days = formatISO(subDays(new Date(), 30), { representation: 'date' });
      const last90Days = formatISO(subDays(new Date(), 90), { representation: 'date' });
      const today = formatISO(new Date(), { representation: 'date' });

      // Get recent transactions
      const allRecentTransactions = await this.database.getTransactions({
        start_date: last30Days,
        end_date: today
      });

      // Get longer period for averages
      const allLongerPeriodTransactions = await this.database.getTransactions({
        start_date: last90Days,
        end_date: today
      });

      // Filter to only expense transactions (positive amounts)
      const recentTransactions = allRecentTransactions.filter(tx => tx.amount > 0);
      const longerPeriodTransactions = allLongerPeriodTransactions.filter(tx => tx.amount > 0);

      // Category spending analysis
      const categorySpending = this.analyzeCategorySpending(recentTransactions, longerPeriodTransactions);
      
      // Unusual spending detection
      const unusualSpending = this.detectUnusualSpending(recentTransactions, longerPeriodTransactions);
      
      // Savings opportunities
      const savingsOpportunities = this.identifySavingsOpportunities(recentTransactions);

      return {
        categorySpending,
        unusualSpending,
        savingsOpportunities
      };
    } catch (error) {
      console.error('Error analyzing budget insights:', error);
      throw error;
    }
  }

  private analyzeCategorySpending(recent: any[], longer: any[]): { category: string; spent: number; avgMonthly: number; recommendation: string }[] {
    const recentByCategory: { [key: string]: number } = {};
    const longerByCategory: { [key: string]: number } = {};

    recent.forEach(tx => {
      if (tx.category_primary) {
        recentByCategory[tx.category_primary] = (recentByCategory[tx.category_primary] || 0) + Math.abs(tx.amount);
      }
    });

    longer.forEach(tx => {
      if (tx.category_primary) {
        longerByCategory[tx.category_primary] = (longerByCategory[tx.category_primary] || 0) + Math.abs(tx.amount);
      }
    });

    const categories = new Set([...Object.keys(recentByCategory), ...Object.keys(longerByCategory)]);
    
    return Array.from(categories).map(category => {
      const spent = recentByCategory[category] || 0;
      const avgMonthly = (longerByCategory[category] || 0) / 3; // 3 months average
      
      let recommendation = '';
      if (spent > avgMonthly * 1.5) {
        recommendation = `Spending is 50% higher than usual. Consider reviewing ${category} expenses.`;
      } else if (spent < avgMonthly * 0.7) {
        recommendation = `Great job! Spending is lower than usual in ${category}.`;
      } else {
        recommendation = `Spending is consistent with your usual pattern.`;
      }

      return { category, spent, avgMonthly, recommendation };
    });
  }

  private detectUnusualSpending(recent: any[], longer: any[]): { merchant: string; amount: number; date: string; reason: string }[] {
    const merchantAverages: { [key: string]: number } = {};
    const merchantCounts: { [key: string]: number } = {};

    longer.forEach(tx => {
      if (tx.merchant_name) {
        merchantAverages[tx.merchant_name] = (merchantAverages[tx.merchant_name] || 0) + Math.abs(tx.amount);
        merchantCounts[tx.merchant_name] = (merchantCounts[tx.merchant_name] || 0) + 1;
      }
    });

    // Calculate averages
    Object.keys(merchantAverages).forEach(merchant => {
      merchantAverages[merchant] = merchantAverages[merchant] / merchantCounts[merchant];
    });

    // Find unusual spending in recent transactions
    const unusual: { merchant: string; amount: number; date: string; reason: string }[] = [];

    recent.forEach(tx => {
      if (tx.merchant_name && merchantAverages[tx.merchant_name]) {
        const avgAmount = merchantAverages[tx.merchant_name];
        const currentAmount = Math.abs(tx.amount);
        
        if (currentAmount > avgAmount * 3) {
          unusual.push({
            merchant: tx.merchant_name,
            amount: currentAmount,
            date: tx.date,
            reason: `Amount is ${Math.round((currentAmount / avgAmount) * 100)}% of your usual spending at this merchant`
          });
        }
      }
    });

    return unusual.sort((a, b) => b.amount - a.amount).slice(0, 5);
  }

  private identifySavingsOpportunities(transactions: any[]): { category: string; potentialSavings: number; suggestion: string }[] {
    const categoryData: { [key: string]: { total: number; count: number; merchants: Set<string> } } = {};

    transactions.forEach(tx => {
      if (tx.category_primary) {
        if (!categoryData[tx.category_primary]) {
          categoryData[tx.category_primary] = { total: 0, count: 0, merchants: new Set() };
        }
        categoryData[tx.category_primary].total += Math.abs(tx.amount);
        categoryData[tx.category_primary].count += 1;
        if (tx.merchant_name) {
          categoryData[tx.category_primary].merchants.add(tx.merchant_name);
        }
      }
    });

    return Object.entries(categoryData)
      .map(([category, data]) => {
        let potentialSavings = 0;
        let suggestion = '';

        // Different suggestions based on category
        if (category === 'FOOD_AND_DRINK') {
          potentialSavings = data.total * 0.2; // 20% potential savings
          suggestion = 'Consider cooking at home more often or setting a dining out budget';
        } else if (category === 'TRANSPORTATION') {
          potentialSavings = data.total * 0.15;
          suggestion = 'Look into public transportation or carpooling options';
        } else if (category === 'ENTERTAINMENT') {
          potentialSavings = data.total * 0.25;
          suggestion = 'Consider free entertainment options or subscription audits';
        } else if (data.merchants.size > 5) {
          potentialSavings = data.total * 0.1;
          suggestion = 'You shop at many different places. Consider consolidating purchases for better deals';
        }

        return { category, potentialSavings, suggestion };
      })
      .filter(item => item.potentialSavings > 0)
      .sort((a, b) => b.potentialSavings - a.potentialSavings)
      .slice(0, 5);
  }

  // Get advanced transaction summary with metrics
  async getAdvancedTransactionSummary(period: string = 'month', compareWithPrevious: boolean = false): Promise<{
    summary: {
      totalIncome: number;
      totalExpenses: number;
      netCashFlow: number;
      transactionCount: number;
      avgTransactionAmount: number;
      topExpenseCategory: string;
      savingsRate: number;
    };
    categoryBreakdown: { category: string; amount: number; percentage: number; transactionCount: number }[];
    comparison?: {
      previousPeriod: any;
      changes: any;
    };
  }> {
    try {
      console.log(`📊 Generating advanced transaction summary for ${period}...`);

      // Calculate date ranges based on period
      const { startDate, endDate, prevStartDate, prevEndDate } = this.calculatePeriodDates(period);

      // Get current period transactions
      const currentTransactions = await this.database.getTransactions({
        start_date: startDate,
        end_date: endDate
      });

      // Calculate summary metrics
      const summary = this.calculateSummaryMetrics(currentTransactions);
      
      // Calculate category breakdown
      const categoryBreakdown = this.calculateCategoryBreakdown(currentTransactions);

      let comparison;
      if (compareWithPrevious) {
        const previousTransactions = await this.database.getTransactions({
          start_date: prevStartDate,
          end_date: prevEndDate
        });
        comparison = this.calculatePeriodComparison(currentTransactions, previousTransactions);
      }

      return {
        summary,
        categoryBreakdown,
        comparison
      };
    } catch (error) {
      console.error('Error generating advanced transaction summary:', error);
      throw error;
    }
  }

  // Get detailed category analysis
  async getCategoryAnalysis(category: string, days: number = 90): Promise<{
    category: string;
    totalSpent: number;
    transactionCount: number;
    avgPerTransaction: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    topMerchants: { name: string; amount: number; frequency: number }[];
    monthlyBreakdown: { month: string; amount: number }[];
    recommendations: string[];
  }> {
    try {
      console.log(`🔍 Analyzing category: ${category} over ${days} days...`);

      const endDate = formatISO(new Date(), { representation: 'date' });
      const startDate = formatISO(subDays(new Date(), days), { representation: 'date' });

      const allTransactions = await this.database.getTransactions({
        start_date: startDate,
        end_date: endDate
      });

      // Filter transactions for this category and expenses only
      const categoryTransactions = allTransactions.filter(tx => 
        tx.category_primary === category && tx.amount > 0
      );

      if (categoryTransactions.length === 0) {
        return {
          category,
          totalSpent: 0,
          transactionCount: 0,
          avgPerTransaction: 0,
          trend: 'stable',
          topMerchants: [],
          monthlyBreakdown: [],
          recommendations: [`No transactions found for ${category} in the last ${days} days.`]
        };
      }

      // Calculate metrics
      const totalSpent = categoryTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const transactionCount = categoryTransactions.length;
      const avgPerTransaction = totalSpent / transactionCount;

      // Calculate trend
      const trend = this.calculateCategoryTrend(categoryTransactions);

      // Get top merchants
      const topMerchants = this.calculateTopMerchants(categoryTransactions).slice(0, 5);

      // Monthly breakdown
      const monthlyBreakdown = this.calculateMonthlyBreakdown(categoryTransactions);

      // Generate recommendations
      const recommendations = this.generateCategoryRecommendations(category, {
        totalSpent,
        transactionCount,
        avgPerTransaction,
        trend,
        topMerchants,
        days
      });

      return {
        category,
        totalSpent,
        transactionCount,
        avgPerTransaction,
        trend,
        topMerchants,
        monthlyBreakdown,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing category:', error);
      throw error;
    }
  }

  // Get spending alerts and notifications
  async getSpendingAlerts(): Promise<{
    budgetAlerts: { category: string; budgetAmount: number; currentSpending: number; percentageUsed: number; severity: string; message: string }[];
    spendingAlerts: { type: string; message: string; amount: number; date: string; severity: string }[];
    recurringPayments: { merchant: string; amount: number; frequency: string; nextExpectedDate: string }[];
  }> {
    try {
      console.log(`🚨 Generating spending alerts...`);

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Get current month transactions
      const monthStart = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      const today = formatISO(new Date(), { representation: 'date' });

      const monthTransactions = await this.database.getTransactions({
        start_date: monthStart,
        end_date: today
      });

      // Budget alerts (you'll need to implement budget storage)
      const budgetAlerts = await this.generateBudgetAlerts(monthTransactions);

      // Spending alerts
      const spendingAlerts = await this.generateSpendingAlerts(monthTransactions);

      // Recurring payments detection
      const recurringPayments = await this.detectRecurringPayments();

      return {
        budgetAlerts,
        spendingAlerts,
        recurringPayments
      };
    } catch (error) {
      console.error('Error generating spending alerts:', error);
      throw error;
    }
  }

  // Helper methods for advanced analytics
  private calculatePeriodDates(period: string): {
    startDate: string;
    endDate: string;
    prevStartDate: string;
    prevEndDate: string;
  } {
    const now = new Date();
    const endDate = formatISO(now, { representation: 'date' });
    
    let startDate: string;
    let prevStartDate: string;
    let prevEndDate: string;

    switch (period) {
      case 'week':
        const weekStart = subDays(now, 7);
        startDate = formatISO(weekStart, { representation: 'date' });
        prevEndDate = formatISO(subDays(weekStart, 1), { representation: 'date' });
        prevStartDate = formatISO(subDays(weekStart, 7), { representation: 'date' });
        break;
      case 'quarter':
        const quarterStart = subDays(now, 90);
        startDate = formatISO(quarterStart, { representation: 'date' });
        prevEndDate = formatISO(subDays(quarterStart, 1), { representation: 'date' });
        prevStartDate = formatISO(subDays(quarterStart, 90), { representation: 'date' });
        break;
      case 'year':
        const yearStart = subDays(now, 365);
        startDate = formatISO(yearStart, { representation: 'date' });
        prevEndDate = formatISO(subDays(yearStart, 1), { representation: 'date' });
        prevStartDate = formatISO(subDays(yearStart, 365), { representation: 'date' });
        break;
      default: // month
        const monthStart = subDays(now, 30);
        startDate = formatISO(monthStart, { representation: 'date' });
        prevEndDate = formatISO(subDays(monthStart, 1), { representation: 'date' });
        prevStartDate = formatISO(subDays(monthStart, 30), { representation: 'date' });
        break;
    }

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  private calculateSummaryMetrics(transactions: any[]): {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    transactionCount: number;
    avgTransactionAmount: number;
    topExpenseCategory: string;
    savingsRate: number;
  } {
    const expenses = transactions.filter(tx => tx.amount > 0);
    const income = transactions.filter(tx => tx.amount < 0);

    const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncome = Math.abs(income.reduce((sum, tx) => sum + tx.amount, 0));
    const netCashFlow = totalIncome - totalExpenses;

    // Find top expense category
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(tx => {
      if (tx.category_primary) {
        categoryTotals[tx.category_primary] = (categoryTotals[tx.category_primary] || 0) + tx.amount;
      }
    });

    const topExpenseCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

    const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
      transactionCount: transactions.length,
      avgTransactionAmount: transactions.length > 0 ? (totalExpenses + totalIncome) / transactions.length : 0,
      topExpenseCategory,
      savingsRate
    };
  }

  private calculateCategoryBreakdown(transactions: any[]): { category: string; amount: number; percentage: number; transactionCount: number }[] {
    const expenses = transactions.filter(tx => tx.amount > 0);
    const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);

    const categoryData: { [key: string]: { amount: number; count: number } } = {};
    
    expenses.forEach(tx => {
      const category = tx.category_primary || 'Uncategorized';
      if (!categoryData[category]) {
        categoryData[category] = { amount: 0, count: 0 };
      }
      categoryData[category].amount += tx.amount;
      categoryData[category].count += 1;
    });

    return Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        transactionCount: data.count
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private calculatePeriodComparison(current: any[], previous: any[]): {
    previousPeriod: any;
    changes: any;
  } {
    const currentMetrics = this.calculateSummaryMetrics(current);
    const previousMetrics = this.calculateSummaryMetrics(previous);

    const changes = {
      totalIncome: {
        amount: currentMetrics.totalIncome - previousMetrics.totalIncome,
        percentage: previousMetrics.totalIncome > 0 ? 
          ((currentMetrics.totalIncome - previousMetrics.totalIncome) / previousMetrics.totalIncome) * 100 : 0
      },
      totalExpenses: {
        amount: currentMetrics.totalExpenses - previousMetrics.totalExpenses,
        percentage: previousMetrics.totalExpenses > 0 ? 
          ((currentMetrics.totalExpenses - previousMetrics.totalExpenses) / previousMetrics.totalExpenses) * 100 : 0
      },
      netCashFlow: {
        amount: currentMetrics.netCashFlow - previousMetrics.netCashFlow,
        percentage: previousMetrics.netCashFlow !== 0 ? 
          ((currentMetrics.netCashFlow - previousMetrics.netCashFlow) / Math.abs(previousMetrics.netCashFlow)) * 100 : 0
      },
      transactionCount: {
        amount: currentMetrics.transactionCount - previousMetrics.transactionCount,
        percentage: previousMetrics.transactionCount > 0 ? 
          ((currentMetrics.transactionCount - previousMetrics.transactionCount) / previousMetrics.transactionCount) * 100 : 0
      }
    };

    return {
      previousPeriod: previousMetrics,
      changes
    };
  }

  private calculateCategoryTrend(transactions: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (transactions.length < 4) return 'stable';

    // Split into first and second half
    const midPoint = Math.floor(transactions.length / 2);
    const firstHalf = transactions.slice(0, midPoint);
    const secondHalf = transactions.slice(midPoint);

    const firstHalfTotal = firstHalf.reduce((sum, tx) => sum + tx.amount, 0);
    const secondHalfTotal = secondHalf.reduce((sum, tx) => sum + tx.amount, 0);

    if (firstHalfTotal === 0) return secondHalfTotal > 0 ? 'increasing' : 'stable';

    const changePercent = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;

    if (changePercent > 15) return 'increasing';
    if (changePercent < -15) return 'decreasing';
    return 'stable';
  }

  private calculateMonthlyBreakdown(transactions: any[]): { month: string; amount: number }[] {
    const monthlyData: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + tx.amount;
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private generateCategoryRecommendations(category: string, metrics: any): string[] {
    const recommendations: string[] = [];
    const { totalSpent, transactionCount, avgPerTransaction, trend, topMerchants, days } = metrics;

    // Spending amount recommendations
    if (totalSpent > 1000) {
      recommendations.push(`Your ${category} spending of $${totalSpent.toFixed(2)} over ${days} days is significant. Consider setting a monthly budget.`);
    }

    // Frequency recommendations
    if (transactionCount > 20) {
      recommendations.push(`You made ${transactionCount} transactions in ${category}. Consider consolidating purchases to reduce fees.`);
    }

    // Trend recommendations
    if (trend === 'increasing') {
      recommendations.push(`Your ${category} spending is increasing. Review recent purchases and consider if this trend aligns with your goals.`);
    } else if (trend === 'decreasing') {
      recommendations.push(`Great job! Your ${category} spending is decreasing. Keep up the good work!`);
    }

    // Category-specific recommendations
    switch (category) {
      case 'FOOD_AND_DRINK':
        if (avgPerTransaction > 50) {
          recommendations.push('Consider cooking at home more often to reduce dining costs.');
        }
        break;
      case 'TRANSPORTATION':
        if (topMerchants.length > 3) {
          recommendations.push('Consider using a single fuel rewards program to maximize savings.');
        }
        break;
      case 'ENTERTAINMENT':
        if (transactionCount > 10) {
          recommendations.push('Look for free entertainment options or consider bundling subscriptions.');
        }
        break;
      case 'GENERAL_MERCHANDISE':
        recommendations.push('Consider using cashback credit cards or shopping apps for better deals.');
        break;
    }

    return recommendations.length > 0 ? recommendations : ['Your spending in this category appears to be under control.'];
  }

  private async generateBudgetAlerts(_transactions: any[]): Promise<{ category: string; budgetAmount: number; currentSpending: number; percentageUsed: number; severity: string; message: string }[]> {
    // This would integrate with your budget system
    // For now, returning empty array as budgets aren't implemented yet
    return [];
  }

  private async generateSpendingAlerts(transactions: any[]): Promise<{ type: string; message: string; amount: number; date: string; severity: string }[]> {
    const alerts: { type: string; message: string; amount: number; date: string; severity: string }[] = [];
    
    // Find unusually large transactions
    const expenseTransactions = transactions.filter(tx => tx.amount > 0);
    const avgAmount = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0) / expenseTransactions.length;

    expenseTransactions.forEach(tx => {
      if (tx.amount > avgAmount * 3) {
        alerts.push({
          type: 'large_transaction',
          message: `Unusually large transaction of $${tx.amount.toFixed(2)} at ${tx.merchant_name || tx.name}`,
          amount: tx.amount,
          date: tx.date,
          severity: tx.amount > avgAmount * 5 ? 'high' : 'medium'
        });
      }
    });

    return alerts.slice(0, 5); // Return top 5 alerts
  }

  private async detectRecurringPayments(): Promise<{ merchant: string; amount: number; frequency: string; nextExpectedDate: string }[]> {
    // This would analyze transaction patterns to detect recurring payments
    // For now, returning empty array as this requires more complex analysis
    return [];
  }

  // ...existing code...
}

export const bankService = new BankService();
