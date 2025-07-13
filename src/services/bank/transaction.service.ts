import { database, Database } from '../../database';
import { plaidClient } from '../../plaidClient';
import { subDays, formatISO } from 'date-fns';

export class TransactionService {
  private database: Database;

  constructor(db?: Database) {
    this.database = db || database;
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
      
      // Process each institution
      for (const institution of institutions) {
        try {
          const transactions = await this.fetchTransactionsForInstitution(
            institution.access_token,
            institution.id,
            days
          );
          allTransactions.push(...transactions);
        } catch (error) {
          console.error(`Error fetching transactions for institution ${institution.id}:`, error);
          // Continue with other institutions
        }
      }

      // Calculate summary
      const summary = this.calculateTransactionSummary(allTransactions);

      return {
        transactions: allTransactions,
        summary
      };
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error;
    }
  }

  // Fetch transactions for a specific institution using sync endpoint
  private async fetchTransactionsForInstitution(
    access_token: string,
    institution_id: number,
    days: number
  ): Promise<any[]> {
    try {
      console.log(`🔄 Fetching transactions for institution ${institution_id} for ${days} days...`);

      const allTransactions: any[] = [];
      let cursor: string | null = null;
      let hasMore = true;

      while (hasMore) {
        const syncRequest: any = {
          access_token,
          count: 500
        };

        if (cursor) {
          syncRequest.cursor = cursor;
        }

        const { data } = await plaidClient.transactionsSync(syncRequest);
        const { added, modified, removed, next_cursor, has_more } = data;

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

  // Calculate transaction summary
  private calculateTransactionSummary(transactions: any[]): any {
    const summary = {
      totalExpenses: 0,
      totalIncome: 0,
      netCashFlow: 0,
      transactionCount: transactions.length
    };

    transactions.forEach(tx => {
      if (tx.amount > 0) {
        summary.totalExpenses += tx.amount;
      } else {
        summary.totalIncome += Math.abs(tx.amount);
      }
    });

    summary.netCashFlow = summary.totalIncome - summary.totalExpenses;

    return summary;
  }

  // Get filtered transactions with advanced filtering
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
          tx.name.toLowerCase().includes(searchTerm) ||
          tx.merchant_name?.toLowerCase().includes(searchTerm) ||
          tx.category_primary?.toLowerCase().includes(searchTerm)
        );
      }

      // Calculate summary
      const summary = this.calculateFilteredSummary(transactions);

      return {
        transactions,
        summary
      };
    } catch (error) {
      console.error('Error filtering transactions:', error);
      throw error;
    }
  }

  private calculateFilteredSummary(transactions: any[]): any {
    const summary = {
      totalAmount: 0,
      averageAmount: 0,
      transactionCount: transactions.length,
      categoryBreakdown: {} as { [key: string]: number },
      merchantBreakdown: {} as { [key: string]: number },
      dailySpending: {} as { [key: string]: number }
    };

    transactions.forEach(tx => {
      const amount = Math.abs(tx.amount);
      summary.totalAmount += amount;

      // Category breakdown
      if (tx.category_primary) {
        summary.categoryBreakdown[tx.category_primary] = 
          (summary.categoryBreakdown[tx.category_primary] || 0) + amount;
      }

      // Merchant breakdown
      if (tx.merchant_name) {
        summary.merchantBreakdown[tx.merchant_name] = 
          (summary.merchantBreakdown[tx.merchant_name] || 0) + amount;
      }

      // Daily spending
      if (tx.date) {
        summary.dailySpending[tx.date] = 
          (summary.dailySpending[tx.date] || 0) + amount;
      }
    });

    summary.averageAmount = summary.transactionCount > 0 ? summary.totalAmount / summary.transactionCount : 0;

    return summary;
  }

  // Get transactions for a specific date range
  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<any[]> {
    try {
      return await this.database.transactions.getTransactionsByDateRange(startDate, endDate);
    } catch (error) {
      console.error('Error getting transactions by date range:', error);
      throw error;
    }
  }

  // Get today's transactions
  async getTodaysTransactions(): Promise<any[]> {
    try {
      return await this.database.transactions.getTodaysTransactions();
    } catch (error) {
      console.error('Error getting today\'s transactions:', error);
      throw error;
    }
  }
}
