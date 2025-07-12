import { plaidClient } from '../plaidClient';
import { database } from '../database';
import { logger } from '../utils/logger';
import { InvestmentsHoldingsGetRequest, InvestmentsTransactionsGetRequest } from 'plaid';

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<{
    symbol: string;
    price: number;
    change?: number;
    change_percent?: number;
    volume?: number;
    market_cap?: number;
    pe_ratio?: number;
    dividend_yield?: number;
    fifty_two_week_high?: number;
    fifty_two_week_low?: number;
    sector?: string;
    industry?: string;
  }>;
  
  getMultipleQuotes(symbols: string[]): Promise<Array<{
    symbol: string;
    price: number;
    change?: number;
    change_percent?: number;
    volume?: number;
    market_cap?: number;
    pe_ratio?: number;
    dividend_yield?: number;
    fifty_two_week_high?: number;
    fifty_two_week_low?: number;
    sector?: string;
    industry?: string;
  }>>;
}

// Mock market data provider - replace with real API like Alpha Vantage, Yahoo Finance, etc.
class MockMarketDataProvider implements MarketDataProvider {
  private mockData: { [symbol: string]: any } = {
    'AAPL': { symbol: 'AAPL', price: 185.25, change: 2.34, change_percent: 1.28, volume: 45678901, market_cap: 2890000000000, pe_ratio: 28.5, dividend_yield: 0.52, fifty_two_week_high: 199.62, fifty_two_week_low: 164.08, sector: 'Technology', industry: 'Consumer Electronics' },
    'GOOGL': { symbol: 'GOOGL', price: 2745.50, change: -15.75, change_percent: -0.57, volume: 1234567, market_cap: 1750000000000, pe_ratio: 24.2, dividend_yield: 0.00, fifty_two_week_high: 2925.07, fifty_two_week_low: 2193.62, sector: 'Technology', industry: 'Internet Content & Information' },
    'MSFT': { symbol: 'MSFT', price: 375.80, change: 4.25, change_percent: 1.14, volume: 23456789, market_cap: 2790000000000, pe_ratio: 32.1, dividend_yield: 0.75, fifty_two_week_high: 384.52, fifty_two_week_low: 309.45, sector: 'Technology', industry: 'Software—Infrastructure' },
    'TSLA': { symbol: 'TSLA', price: 248.75, change: -8.50, change_percent: -3.30, volume: 87654321, market_cap: 790000000000, pe_ratio: 65.8, dividend_yield: 0.00, fifty_two_week_high: 299.29, fifty_two_week_low: 138.80, sector: 'Consumer Cyclical', industry: 'Auto Manufacturers' },
    'AMZN': { symbol: 'AMZN', price: 3285.04, change: 12.85, change_percent: 0.39, volume: 3456789, market_cap: 1680000000000, pe_ratio: 58.3, dividend_yield: 0.00, fifty_two_week_high: 3552.25, fifty_two_week_low: 2671.45, sector: 'Consumer Cyclical', industry: 'Internet Retail' },
    'META': { symbol: 'META', price: 325.16, change: -2.84, change_percent: -0.87, volume: 19876543, market_cap: 820000000000, pe_ratio: 23.7, dividend_yield: 0.00, fifty_two_week_high: 384.33, fifty_two_week_low: 274.38, sector: 'Technology', industry: 'Internet Content & Information' },
    'NFLX': { symbol: 'NFLX', price: 485.50, change: 7.25, change_percent: 1.52, volume: 5432109, market_cap: 215000000000, pe_ratio: 41.2, dividend_yield: 0.00, fifty_two_week_high: 541.15, fifty_two_week_low: 344.73, sector: 'Communication Services', industry: 'Entertainment' },
    'NVDA': { symbol: 'NVDA', price: 875.20, change: 15.60, change_percent: 1.81, volume: 45678901, market_cap: 2150000000000, pe_ratio: 62.4, dividend_yield: 0.12, fifty_two_week_high: 974.00, fifty_two_week_low: 395.75, sector: 'Technology', industry: 'Semiconductors' }
  };

  async getQuote(symbol: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const baseData = this.mockData[symbol];
    if (!baseData) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }
    
    // Add some random variation to simulate real-time data
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const price = baseData.price * (1 + variation);
    const change = price - baseData.price;
    const change_percent = (change / baseData.price) * 100;
    
    return {
      ...baseData,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      change_percent: Math.round(change_percent * 100) / 100
    };
  }

  async getMultipleQuotes(symbols: string[]): Promise<any[]> {
    const quotes = await Promise.all(symbols.map(symbol => this.getQuote(symbol)));
    return quotes.filter(quote => quote !== null);
  }
}

export class InvestmentService {
  private marketDataProvider: MarketDataProvider;
  private investmentSupportCache = new Map<string, { supported: boolean; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(marketDataProvider?: MarketDataProvider) {
    this.marketDataProvider = marketDataProvider || new MockMarketDataProvider();
  }

  /**
   * Check if a Plaid institution supports investments
   * Note: In sandbox environment, most institutions don't support investments.
   * For testing, use institutions like:
   * - ins_109508 (TD Bank) - supports investments
   * - ins_109509 (Wells Fargo) - supports investments  
   * - ins_109510 (Bank of America) - supports investments
   * Common sandbox institutions like Chase don't support investments.
   */
  async checkInvestmentSupport(accessToken: string, institutionId: number): Promise<boolean> {
    try {
      // Check cache first
      const cacheKey = `${institutionId}`;
      const cached = this.investmentSupportCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        logger.info(`Cache hit for investment support check on institution ${institutionId}`);
        return cached.supported;
      }

      // Try to get investment accounts first with retry logic
      const accountsResponse = await this.callPlaidWithRetry(
        () => plaidClient.accountsGet({ access_token: accessToken }),
        `accounts check for institution ${institutionId}`
      );
      
      const investmentAccounts = accountsResponse.data.accounts.filter(
        account => account.type === 'investment'
      );
      
      if (investmentAccounts.length === 0) {
        logger.info(`Institution ${institutionId} has no investment accounts`);
        this.investmentSupportCache.set(cacheKey, { supported: false, timestamp: Date.now() });
        return false;
      }

      // Test if we can get holdings - this is the key test for API support
      try {
        await this.callPlaidWithRetry(
          () => plaidClient.investmentsHoldingsGet({ access_token: accessToken }),
          `holdings check for institution ${institutionId}`
        );
        logger.info(`Institution ${institutionId} supports investments API and has holdings`);
        this.investmentSupportCache.set(cacheKey, { supported: true, timestamp: Date.now() });
        return true;
      } catch (error: any) {
        if (error.response?.data?.error_code === 'PRODUCTS_NOT_SUPPORTED') {
          logger.info(`Institution ${institutionId} has investment accounts but does not support investments API`);
          this.investmentSupportCache.set(cacheKey, { supported: false, timestamp: Date.now() });
          return false;
        }
        
        // If it's another error (like no holdings), but we have investment accounts,
        // we should still consider it as supporting investments
        logger.info(`Institution ${institutionId} has investment accounts but investments API returned: ${error.response?.data?.error_code || error.message}`);
        this.investmentSupportCache.set(cacheKey, { supported: true, timestamp: Date.now() });
        return true;
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        logger.warn(`Rate limited when checking investment support for institution ${institutionId}, skipping for now`);
        return false;
      }
      logger.error(`Error checking investment support for institution ${institutionId}:`, error);
      return false;
    }
  }

  async syncInvestmentData(accessToken: string, institutionId: number): Promise<void> {
    try {
      logger.info(`Starting investment sync for institution ${institutionId}`);
      
      // Get investment accounts
      const accountsResponse = await plaidClient.accountsGet({
        access_token: accessToken,
      });
      
      const investmentAccounts = accountsResponse.data.accounts.filter(
        account => account.type === 'investment'
      );
      
      if (investmentAccounts.length === 0) {
        logger.info('No investment accounts found');
        return;
      }

      // Get holdings for all investment accounts
      const holdingsRequest: InvestmentsHoldingsGetRequest = {
        access_token: accessToken,
      };

      let holdingsResponse;
      try {
        holdingsResponse = await plaidClient.investmentsHoldingsGet(holdingsRequest);
      } catch (holdingsError: any) {
        // Handle specific Plaid errors
        if (holdingsError.response?.data?.error_code === 'PRODUCTS_NOT_SUPPORTED') {
          logger.warn(`Institution ${institutionId} does not support investments product: ${holdingsError.response.data.error_message}`);
          return;
        }
        if (holdingsError.response?.data?.error_code === 'ITEM_LOGIN_REQUIRED') {
          logger.warn(`Institution ${institutionId} requires re-authentication for investments`);
          throw new Error('Investment account requires re-authentication');
        }
        throw holdingsError;
      }
      const { holdings, securities } = holdingsResponse.data;

      // Store securities information
      for (const security of securities) {
        await database.upsertSecurity({
          security_id: security.security_id,
          isin: security.isin || undefined,
          cusip: security.cusip || undefined,
          symbol: security.ticker_symbol || undefined,
          name: security.name || undefined,
          type: security.type || undefined,
          market_identifier_code: security.market_identifier_code || undefined,
          sector: security.sector || undefined,
          industry: security.industry || undefined,
        });
      }

      // Store holdings information
      for (const holding of holdings) {
        await database.upsertHolding({
          account_id: holding.account_id,
          security_id: holding.security_id,
          institution_id: institutionId,
          quantity: holding.quantity,
          price: holding.institution_price || holding.institution_value / holding.quantity,
          value: holding.institution_value,
          cost_basis: holding.cost_basis || undefined,
        });
      }

      // Get investment transactions
      const transactionsRequest: InvestmentsTransactionsGetRequest = {
        access_token: accessToken,
        start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 90 days
        end_date: new Date().toISOString().split('T')[0],
      };

      let transactionsResponse;
      try {
        transactionsResponse = await plaidClient.investmentsTransactionsGet(transactionsRequest);
      } catch (transactionsError: any) {
        // Handle specific Plaid errors
        if (transactionsError.response?.data?.error_code === 'PRODUCTS_NOT_SUPPORTED') {
          logger.warn(`Institution ${institutionId} does not support investment transactions: ${transactionsError.response.data.error_message}`);
          
          // Update market data for securities with symbols even if transactions aren't supported
          const symbolsToUpdate = securities
            .filter(security => security.ticker_symbol)
            .map(security => security.ticker_symbol!);

          if (symbolsToUpdate.length > 0) {
            await this.updateMarketData(symbolsToUpdate);
          }
          
          // Continue with holdings data only
          logger.info(`Investment sync completed for institution ${institutionId}. Updated ${holdings.length} holdings (transactions not supported)`);
          return;
        }
        if (transactionsError.response?.data?.error_code === 'ITEM_LOGIN_REQUIRED') {
          logger.warn(`Institution ${institutionId} requires re-authentication for investment transactions`);
          throw new Error('Investment account requires re-authentication');
        }
        throw transactionsError;
      }
      const { investment_transactions } = transactionsResponse.data;

      // Store investment transactions
      for (const transaction of investment_transactions) {
        await database.insertInvestmentTransaction({
          investment_transaction_id: transaction.investment_transaction_id,
          account_id: transaction.account_id,
          security_id: transaction.security_id || undefined,
          institution_id: institutionId,
          type: transaction.type,
          subtype: transaction.subtype || undefined,
          quantity: transaction.quantity || undefined,
          price: transaction.price || undefined,
          fees: transaction.fees || undefined,
          amount: transaction.amount,
          date: transaction.date,
          name: transaction.name || undefined,
        });
      }

      // Update market data for all securities with symbols
      const symbolsToUpdate = securities
        .filter(security => security.ticker_symbol)
        .map(security => security.ticker_symbol!);

      if (symbolsToUpdate.length > 0) {
        await this.updateMarketData(symbolsToUpdate);
      }

      logger.info(`Investment sync completed for institution ${institutionId}. Updated ${holdings.length} holdings and ${investment_transactions.length} transactions`);
    } catch (error: any) {
      // Handle specific Plaid errors with more detail
      if (error.response?.data?.error_code) {
        const errorCode = error.response.data.error_code;
        const errorMessage = error.response.data.error_message || 'Unknown error';
        
        switch (errorCode) {
          case 'PRODUCTS_NOT_SUPPORTED':
            logger.warn(`Institution ${institutionId} does not support investments: ${errorMessage}`);
            return; // Don't throw, just return as this is expected for some institutions
          case 'ITEM_LOGIN_REQUIRED':
            logger.error(`Institution ${institutionId} requires re-authentication: ${errorMessage}`);
            throw new Error('Investment account requires re-authentication');
          case 'INVALID_ACCESS_TOKEN':
            logger.error(`Invalid access token for institution ${institutionId}: ${errorMessage}`);
            throw new Error('Invalid access token');
          case 'ITEM_NOT_FOUND':
            logger.error(`Item not found for institution ${institutionId}: ${errorMessage}`);
            throw new Error('Item not found');
          default:
            logger.error(`Plaid API error for institution ${institutionId}: ${errorCode} - ${errorMessage}`);
            throw new Error(`Plaid API error: ${errorCode}`);
        }
      }
      
      logger.error('Error syncing investment data:', error);
      throw error;
    }
  }

  async updateMarketData(symbols: string[]): Promise<void> {
    try {
      logger.info(`Updating market data for ${symbols.length} symbols`);
      
      const quotes = await this.marketDataProvider.getMultipleQuotes(symbols);
      const today = new Date().toISOString().split('T')[0];
      
      for (const quote of quotes) {
        await database.upsertMarketData({
          symbol: quote.symbol,
          price: quote.price,
          change: quote.change,
          change_percent: quote.change_percent,
          volume: quote.volume,
          market_cap: quote.market_cap,
          pe_ratio: quote.pe_ratio,
          dividend_yield: quote.dividend_yield,
          fifty_two_week_high: quote.fifty_two_week_high,
          fifty_two_week_low: quote.fifty_two_week_low,
          sector: quote.sector,
          industry: quote.industry,
          date: today,
        });
      }
      
      logger.info(`Market data updated for ${quotes.length} symbols`);
    } catch (error) {
      logger.error('Error updating market data:', error);
      throw error;
    }
  }

  async getInvestmentSummary(): Promise<{
    totalValue: number;
    totalCostBasis: number;
    totalDayChange: number;
    totalDayChangePercent: number;
    holdingsCount: number;
    accountsCount: number;
    topHoldings: any[];
    sectorAllocation: any[];
  }> {
    try {
      const portfolioSummary = await database.getPortfolioSummary();
      const holdings = await database.getHoldings();
      
      // Calculate sector allocation
      const sectorMap = new Map<string, number>();
      holdings.forEach(holding => {
        const sector = holding.sector || 'Other';
        sectorMap.set(sector, (sectorMap.get(sector) || 0) + holding.value);
      });
      
      const sectorAllocation = Array.from(sectorMap.entries()).map(([sector, value]) => ({
        sector,
        value,
        percentage: portfolioSummary.totalValue > 0 ? (value / portfolioSummary.totalValue) * 100 : 0
      }));
      
      return {
        ...portfolioSummary,
        topHoldings: holdings.slice(0, 5),
        sectorAllocation
      };
    } catch (error) {
      logger.error('Error getting investment summary:', error);
      throw error;
    }
  }

  async getDetailedHoldings(): Promise<any[]> {
    try {
      return await database.getHoldings();
    } catch (error) {
      logger.error('Error getting detailed holdings:', error);
      throw error;
    }
  }

  async getInvestmentTransactions(filters: {
    account_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      return await database.getInvestmentTransactions(filters);
    } catch (error) {
      logger.error('Error getting investment transactions:', error);
      throw error;
    }
  }

  async refreshAllMarketData(): Promise<void> {
    try {
      const holdings = await database.getHoldings();
      const symbols = [...new Set(holdings.map(holding => holding.symbol).filter(Boolean))];
      
      if (symbols.length > 0) {
        await this.updateMarketData(symbols);
      }
    } catch (error) {
      logger.error('Error refreshing market data:', error);
      throw error;
    }
  }

  async getInvestmentSupportStatus(): Promise<{
    supportedInstitutions: number;
    unsupportedInstitutions: number;
    totalInstitutions: number;
    details: Array<{
      institutionId: number;
      institutionName: string;
      supportsInvestments: boolean;
      hasInvestmentAccounts: boolean;
    }>;
  }> {
    try {
      const activeInstitutions = await database.all(`
        SELECT id, access_token, name FROM institutions WHERE is_active = 1
      `);
      
      const details = [];
      let supportedCount = 0;
      let unsupportedCount = 0;
      
      for (const institution of activeInstitutions) {
        try {
          // Add delay between institutions to avoid rate limiting
          if (details.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
          }

          const supportsInvestments = await this.checkInvestmentSupport(institution.access_token, institution.id);
          
          // Check if it has investment accounts with retry logic
          const accountsResponse = await this.callPlaidWithRetry(
            () => plaidClient.accountsGet({ access_token: institution.access_token }),
            `investment support status for institution ${institution.id}`
          );
          
          const hasInvestmentAccounts = accountsResponse.data.accounts.some(
            account => account.type === 'investment'
          );
          
          if (supportsInvestments) {
            supportedCount++;
          } else {
            unsupportedCount++;
          }
          
          details.push({
            institutionId: institution.id,
            institutionName: institution.name,
            supportsInvestments,
            hasInvestmentAccounts
          });
        } catch (error) {
          logger.error(`Error checking investment support for institution ${institution.id}:`, error);
          unsupportedCount++;
          details.push({
            institutionId: institution.id,
            institutionName: institution.name,
            supportsInvestments: false,
            hasInvestmentAccounts: false
          });
        }
      }
      
      return {
        supportedInstitutions: supportedCount,
        unsupportedInstitutions: unsupportedCount,
        totalInstitutions: activeInstitutions.length,
        details
      };
    } catch (error) {
      logger.error('Error getting investment support status:', error);
      throw error;
    }
  }

  /**
   * Utility function to handle Plaid API calls with rate limiting and retry logic
   */
  private async callPlaidWithRetry<T>(
    apiCall: () => Promise<T>,
    operation: string,
    retries = 3,
    baseDelay = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await apiCall();
      } catch (error: any) {
        const isRateLimit = error.response?.status === 429;
        const isLastAttempt = attempt === retries;

        if (isRateLimit && !isLastAttempt) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          logger.warn(`Rate limited during ${operation}, retrying in ${delay}ms (attempt ${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // If it's not a rate limit error, or we've exhausted retries, throw the error
        throw error;
      }
    }
    
    throw new Error(`Failed after ${retries} attempts`);
  }
}

export const investmentService = new InvestmentService();
