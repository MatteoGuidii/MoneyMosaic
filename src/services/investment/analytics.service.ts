import { database } from '../../database';
import { logger } from '../../utils/logger';

export class InvestmentAnalyticsService {
  // Get portfolio summary
  async getPortfolioSummary(): Promise<any> {
    try {
      // Get total portfolio value
      const totalValue = await database.get(`
        SELECT SUM(current_value) as total_value
        FROM investment_holdings
        WHERE current_value IS NOT NULL
      `);

      // Get portfolio by sector
      const sectorBreakdown = await database.all(`
        SELECT 
          md.sector,
          SUM(ih.current_value) as total_value,
          COUNT(*) as holding_count
        FROM investment_holdings ih
        JOIN market_data md ON ih.ticker_symbol = md.symbol
        WHERE ih.current_value IS NOT NULL
        GROUP BY md.sector
        ORDER BY total_value DESC
      `);

      // Get top holdings
      const topHoldings = await database.all(`
        SELECT 
          security_name,
          ticker_symbol,
          quantity,
          current_value,
          day_change,
          day_change_percent,
          total_return,
          total_return_percent
        FROM investment_holdings
        WHERE current_value IS NOT NULL
        ORDER BY current_value DESC
        LIMIT 10
      `);

      // Get performance summary
      const performance = await database.get(`
        SELECT 
          SUM(total_return) as total_return,
          AVG(total_return_percent) as avg_return_percent,
          SUM(day_change) as total_day_change,
          AVG(day_change_percent) as avg_day_change_percent
        FROM investment_holdings
        WHERE total_return IS NOT NULL
      `);

      return {
        totalValue: totalValue.total_value || 0,
        sectorBreakdown: sectorBreakdown || [],
        topHoldings: topHoldings || [],
        performance: {
          totalReturn: performance.total_return || 0,
          avgReturnPercent: performance.avg_return_percent || 0,
          totalDayChange: performance.total_day_change || 0,
          avgDayChangePercent: performance.avg_day_change_percent || 0
        }
      };
    } catch (error) {
      logger.error('Error getting portfolio summary:', error);
      throw error;
    }
  }

  // Get detailed portfolio analysis
  async getPortfolioAnalysis(): Promise<any> {
    try {
      // Get allocation by security type
      const typeAllocation = await database.all(`
        SELECT 
          security_type,
          SUM(current_value) as total_value,
          COUNT(*) as holding_count
        FROM investment_holdings
        WHERE current_value IS NOT NULL
        GROUP BY security_type
        ORDER BY total_value DESC
      `);

      // Get winners and losers
      const winners = await database.all(`
        SELECT 
          security_name,
          ticker_symbol,
          total_return_percent,
          current_value
        FROM investment_holdings
        WHERE total_return_percent IS NOT NULL
        ORDER BY total_return_percent DESC
        LIMIT 5
      `);

      const losers = await database.all(`
        SELECT 
          security_name,
          ticker_symbol,
          total_return_percent,
          current_value
        FROM investment_holdings
        WHERE total_return_percent IS NOT NULL
        ORDER BY total_return_percent ASC
        LIMIT 5
      `);

      // Get diversification metrics
      const diversification = await database.get(`
        SELECT 
          COUNT(DISTINCT ticker_symbol) as unique_holdings,
          COUNT(DISTINCT md.sector) as unique_sectors,
          MAX(current_value) as largest_position,
          MIN(current_value) as smallest_position
        FROM investment_holdings ih
        LEFT JOIN market_data md ON ih.ticker_symbol = md.symbol
        WHERE ih.current_value IS NOT NULL
      `);

      return {
        typeAllocation: typeAllocation || [],
        winners: winners || [],
        losers: losers || [],
        diversification: {
          uniqueHoldings: diversification.unique_holdings || 0,
          uniqueSectors: diversification.unique_sectors || 0,
          largestPosition: diversification.largest_position || 0,
          smallestPosition: diversification.smallest_position || 0
        }
      };
    } catch (error) {
      logger.error('Error getting portfolio analysis:', error);
      throw error;
    }
  }

  // Get investment performance over time
  async getPerformanceHistory(days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get transaction history for performance calculation
      const transactions = await database.all(`
        SELECT 
          date,
          type,
          subtype,
          amount,
          ticker_symbol,
          security_name
        FROM investment_transactions
        WHERE date >= ?
        ORDER BY date DESC
      `, [startDate.toISOString().split('T')[0]]);

      // Group by date and calculate daily portfolio changes
      const dailyChanges = new Map();
      
      transactions.forEach(transaction => {
        const date = transaction.date;
        if (!dailyChanges.has(date)) {
          dailyChanges.set(date, {
            date,
            buys: 0,
            sells: 0,
            dividends: 0,
            transactionCount: 0
          });
        }
        
        const dayData = dailyChanges.get(date);
        dayData.transactionCount++;
        
        if (transaction.type === 'buy') {
          dayData.buys += Math.abs(transaction.amount);
        } else if (transaction.type === 'sell') {
          dayData.sells += Math.abs(transaction.amount);
        } else if (transaction.type === 'dividend') {
          dayData.dividends += Math.abs(transaction.amount);
        }
      });

      const performanceHistory = Array.from(dailyChanges.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        performanceHistory,
        summary: {
          totalTransactions: transactions.length,
          totalBuys: transactions.filter(t => t.type === 'buy').length,
          totalSells: transactions.filter(t => t.type === 'sell').length,
          totalDividends: transactions.filter(t => t.type === 'dividend').length
        }
      };
    } catch (error) {
      logger.error('Error getting performance history:', error);
      throw error;
    }
  }
}
