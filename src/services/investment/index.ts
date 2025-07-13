import { InvestmentDataService } from './data.service';
import { InvestmentAnalyticsService } from './analytics.service';
import { marketDataProvider } from './marketData.service';
import { logger } from '../../utils/logger';

export class InvestmentService {
  private dataService: InvestmentDataService;
  private analyticsService: InvestmentAnalyticsService;

  constructor() {
    this.dataService = new InvestmentDataService();
    this.analyticsService = new InvestmentAnalyticsService();
  }

  // Data fetching methods
  async fetchInvestmentHoldings(): Promise<void> {
    return this.dataService.fetchInvestmentHoldings();
  }

  async fetchInvestmentTransactions(): Promise<void> {
    return this.dataService.fetchInvestmentTransactions();
  }

  // Analytics methods
  async getPortfolioSummary(): Promise<any> {
    return this.analyticsService.getPortfolioSummary();
  }

  async getPortfolioAnalysis(): Promise<any> {
    return this.analyticsService.getPortfolioAnalysis();
  }

  async getPerformanceHistory(days: number = 30): Promise<any> {
    return this.analyticsService.getPerformanceHistory(days);
  }

  // Market data methods
  async getMarketQuote(symbol: string): Promise<any> {
    return marketDataProvider.getQuote(symbol);
  }

  async getMultipleQuotes(symbols: string[]): Promise<any[]> {
    return marketDataProvider.getMultipleQuotes(symbols);
  }

  // Refresh market data for all holdings
  async refreshAllMarketData(): Promise<void> {
    try {
      logger.info('🔄 Refreshing market data for all holdings...');
      
      // Get all unique symbols from holdings
      const symbols = await this.dataService.getAllHoldingSymbols();
      
      if (symbols.length > 0) {
        await this.getMultipleQuotes(symbols);
        logger.info(`✅ Market data refreshed for ${symbols.length} symbols`);
      } else {
        logger.info('ℹ️ No holdings found to refresh market data');
      }
    } catch (error) {
      logger.error('❌ Error refreshing market data:', error);
      throw error;
    }
  }

  // Sync investment data for specific institution
  async syncInvestmentData(accessToken: string, institutionId: string): Promise<void> {
    try {
      logger.info(`🔄 Syncing investment data for institution ${institutionId}...`);
      
      // Use the existing data service methods with specific parameters
      await this.dataService.fetchInvestmentHoldingsForInstitution(accessToken, institutionId);
      await this.dataService.fetchInvestmentTransactionsForInstitution(accessToken, institutionId);
      
      logger.info(`✅ Investment data sync completed for institution ${institutionId}`);
    } catch (error) {
      logger.error(`❌ Error syncing investment data for institution ${institutionId}:`, error);
      throw error;
    }
  }

  // Combined operations
  async syncAllInvestmentData(): Promise<void> {
    logger.info('🔄 Starting full investment data sync...');
    
    try {
      // Fetch holdings first
      await this.fetchInvestmentHoldings();
      
      // Then fetch transactions
      await this.fetchInvestmentTransactions();
      
      logger.info('✅ Investment data sync completed successfully');
    } catch (error) {
      logger.error('❌ Error during investment data sync:', error);
      throw error;
    }
  }

  // Get comprehensive investment dashboard data
  async getInvestmentDashboard(): Promise<any> {
    try {
      const [summary, analysis, performance] = await Promise.all([
        this.getPortfolioSummary(),
        this.getPortfolioAnalysis(),
        this.getPerformanceHistory(30)
      ]);

      return {
        summary,
        analysis,
        performance,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting investment dashboard:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const investmentService = new InvestmentService();
