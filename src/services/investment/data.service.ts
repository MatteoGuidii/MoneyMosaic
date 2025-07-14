import { plaidClient } from '../../plaidClient';
import { database } from '../../database';
import { logger } from '../../utils/logger';
import { InvestmentsHoldingsGetRequest, InvestmentsTransactionsGetRequest } from 'plaid';
import { marketDataProvider } from './marketData.service';

export class InvestmentDataService {
  // Fetch and store investment holdings for all accounts
  async fetchInvestmentHoldings(): Promise<void> {
    logger.info('🔄 Starting investment holdings sync...');
    
    try {
      // Get all investment accounts
      const investmentAccounts = await database.all(`
        SELECT a.*, i.access_token
        FROM accounts a
        JOIN institutions i ON a.institution_id = i.id
        WHERE a.type = 'investment' AND i.is_active = 1
      `);

      if (investmentAccounts.length === 0) {
        logger.info('📭 No investment accounts found');
        return;
      }

      for (const account of investmentAccounts) {
        try {
          await this.fetchHoldingsForAccount(account);
        } catch (error) {
          logger.error(`❌ Failed to fetch holdings for account ${account.name}:`, error);
        }
      }

      logger.info('✅ Investment holdings sync completed');
    } catch (error) {
      logger.error('❌ Error during investment holdings sync:', error);
      throw error;
    }
  }

  // Fetch holdings for a specific account
  private async fetchHoldingsForAccount(account: any): Promise<void> {
    const request: InvestmentsHoldingsGetRequest = {
      access_token: account.access_token
    };

    const response = await plaidClient.investmentsHoldingsGet(request);
    const holdings = response.data.holdings;
    const securities = response.data.securities;

    // Create a map of security_id to security details
    const securityMap = new Map();
    securities.forEach(security => {
      securityMap.set(security.security_id, security);
    });

    // Process and store holdings
    for (const holding of holdings) {
      const security = securityMap.get(holding.security_id);
      if (!security) continue;

      // Get current market data
      let marketData = null;
      try {
        if (security.ticker_symbol) {
          marketData = await marketDataProvider.getQuote(security.ticker_symbol);
        }
      } catch (error) {
        logger.warn(`⚠️ Could not fetch market data for ${security.ticker_symbol}:`, error);
      }

      // Update or insert holding
      await database.run(`
        INSERT OR REPLACE INTO investment_holdings (
          account_id,
          security_id,
          institution_price,
          institution_price_as_of,
          institution_value,
          cost_basis,
          quantity,
          iso_currency_code,
          unofficial_currency_code,
          ticker_symbol,
          security_name,
          security_type,
          close_price,
          close_price_as_of,
          current_price,
          current_value,
          day_change,
          day_change_percent,
          total_return,
          total_return_percent,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `, [
        account.id,
        holding.security_id,
        holding.institution_price,
        holding.institution_price_as_of,
        holding.institution_value,
        holding.cost_basis,
        holding.quantity,
        holding.iso_currency_code,
        holding.unofficial_currency_code,
        security.ticker_symbol,
        security.name,
        security.type,
        security.close_price,
        security.close_price_as_of,
        marketData?.price || holding.institution_price,
        marketData ? (marketData.price * holding.quantity) : holding.institution_value,
        marketData?.change || null,
        marketData?.change_percent || null,
        marketData ? ((marketData.price * holding.quantity) - (holding.cost_basis || 0)) : null,
        marketData && holding.cost_basis ? (((marketData.price * holding.quantity) - holding.cost_basis) / holding.cost_basis * 100) : null
      ]);
    }

    logger.info(`📊 Updated ${holdings.length} holdings for account ${account.name}`);
  }

  // Fetch and store investment transactions
  async fetchInvestmentTransactions(): Promise<void> {
    logger.info('🔄 Starting investment transactions sync...');
    
    try {
      // Get all investment accounts
      const investmentAccounts = await database.all(`
        SELECT a.*, i.access_token
        FROM accounts a
        JOIN institutions i ON a.institution_id = i.id
        WHERE a.type = 'investment' AND i.is_active = 1
      `);

      if (investmentAccounts.length === 0) {
        logger.info('📭 No investment accounts found');
        return;
      }

      for (const account of investmentAccounts) {
        try {
          await this.fetchTransactionsForAccount(account);
        } catch (error) {
          logger.error(`❌ Failed to fetch transactions for account ${account.name}:`, error);
        }
      }

      logger.info('✅ Investment transactions sync completed');
    } catch (error) {
      logger.error('❌ Error during investment transactions sync:', error);
      throw error;
    }
  }

  // Fetch transactions for a specific account
  private async fetchTransactionsForAccount(account: any): Promise<void> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    const request: InvestmentsTransactionsGetRequest = {
      access_token: account.access_token,
      start_date: startDate.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    };

    const response = await plaidClient.investmentsTransactionsGet(request);
    const transactions = response.data.investment_transactions;
    const securities = response.data.securities;

    // Create a map of security_id to security details
    const securityMap = new Map();
    securities.forEach(security => {
      securityMap.set(security.security_id, security);
    });

    // Process and store transactions
    for (const transaction of transactions) {
      const security = securityMap.get(transaction.security_id);
      
      // Check if transaction already exists
      const existingTransaction = await database.get(
        'SELECT id FROM investment_transactions WHERE plaid_transaction_id = ?',
        [transaction.investment_transaction_id]
      );

      if (existingTransaction) {
        continue; // Skip if already exists
      }

      // Insert transaction
      await database.run(`
        INSERT INTO investment_transactions (
          account_id,
          plaid_transaction_id,
          security_id,
          date,
          name,
          quantity,
          amount,
          price,
          fees,
          type,
          subtype,
          ticker_symbol,
          security_name,
          iso_currency_code,
          unofficial_currency_code,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `, [
        account.id,
        transaction.investment_transaction_id,
        transaction.security_id,
        transaction.date,
        transaction.name,
        transaction.quantity,
        transaction.amount,
        transaction.price,
        transaction.fees,
        transaction.type,
        transaction.subtype,
        security?.ticker_symbol || null,
        security?.name || null,
        transaction.iso_currency_code,
        transaction.unofficial_currency_code
      ]);
    }

    logger.info(`📊 Processed ${transactions.length} investment transactions for account ${account.name}`);
  }

  // Get all unique symbols from holdings
  async getAllHoldingSymbols(): Promise<string[]> {
    try {
      const symbols = await database.all(`
        SELECT DISTINCT s.symbol 
        FROM holdings h
        JOIN securities s ON h.security_id = s.security_id
        WHERE s.symbol IS NOT NULL AND s.symbol != ''
      `);
      
      return symbols.map(row => row.symbol);
    } catch (error) {
      logger.error('Error getting holding symbols:', error);
      return [];
    }
  }

  // Fetch investment holdings for specific access token and institution
  async fetchInvestmentHoldingsForInstitution(accessToken: string, institutionId: string): Promise<void> {
    logger.info(`🔄 Fetching investment holdings for institution ${institutionId}...`);
    
    try {
      const request: InvestmentsHoldingsGetRequest = {
        access_token: accessToken
      };

      const response = await plaidClient.investmentsHoldingsGet(request);
      const holdings = response.data.holdings;
      const securities = response.data.securities;

      // Store holdings in database
      for (const holding of holdings) {
        const security = securities.find(s => s.security_id === holding.security_id);
        
        await database.run(`
          INSERT OR REPLACE INTO holdings (
            account_id, security_id, symbol, name, quantity, 
            institution_price, institution_value, market_value, 
            last_updated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          holding.account_id,
          holding.security_id,
          security?.ticker_symbol || '',
          security?.name || '',
          holding.quantity,
          holding.institution_price,
          holding.institution_value,
          holding.institution_value, // Will be updated by market data
          new Date().toISOString()
        ]);
      }

      logger.info(`✅ Stored ${holdings.length} holdings for institution ${institutionId}`);
    } catch (error) {
      logger.error(`❌ Error fetching holdings for institution ${institutionId}:`, error);
      throw error;
    }
  }

  // Fetch investment transactions for specific access token and institution
  async fetchInvestmentTransactionsForInstitution(accessToken: string, institutionId: string): Promise<void> {
    logger.info(`🔄 Fetching investment transactions for institution ${institutionId}...`);
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days

      const request: InvestmentsTransactionsGetRequest = {
        access_token: accessToken,
        start_date: startDate.toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      };

      const response = await plaidClient.investmentsTransactionsGet(request);
      const transactions = response.data.investment_transactions;
      const securities = response.data.securities;

      // Store transactions in database
      for (const transaction of transactions) {
        const security = securities.find(s => s.security_id === transaction.security_id);
        
        await database.run(`
          INSERT OR REPLACE INTO investment_transactions (
            account_id, investment_transaction_id, security_id, symbol, 
            type, quantity, price, amount, date, last_updated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          transaction.account_id,
          transaction.investment_transaction_id,
          transaction.security_id,
          security?.ticker_symbol || '',
          transaction.type,
          transaction.quantity,
          transaction.price,
          transaction.amount,
          transaction.date,
          new Date().toISOString()
        ]);
      }

      logger.info(`✅ Stored ${transactions.length} investment transactions for institution ${institutionId}`);
    } catch (error) {
      logger.error(`❌ Error fetching investment transactions for institution ${institutionId}:`, error);
      throw error;
    }
  }
}
