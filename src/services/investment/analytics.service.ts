import { database } from '../../database';
import { logger } from '../../utils/logger';

export class InvestmentAnalyticsService {
  // Get portfolio summary
  async getPortfolioSummary(): Promise<any> {
    try {
      // Get total portfolio value
      const totalValue = await database.get(`
        SELECT SUM(h.value) as total_value
        FROM holdings h
        WHERE h.value IS NOT NULL
      `);

      // Get portfolio by sector
      const sectorBreakdown = await database.all(`
        SELECT 
          COALESCE(md.sector, 'Unknown') as sector,
          SUM(h.value) as total_value,
          COUNT(*) as holding_count
        FROM holdings h
        JOIN securities s ON h.security_id = s.security_id
        LEFT JOIN market_data md ON s.ticker_symbol = md.symbol
        WHERE h.value IS NOT NULL
        GROUP BY md.sector
        ORDER BY total_value DESC
      `);

      // Get top holdings
      const topHoldings = await database.all(`
        SELECT 
          s.name as security_name,
          s.ticker_symbol,
          h.quantity,
          h.value as current_value,
          0 as day_change,
          0 as day_change_percent,
          (h.value - COALESCE(h.cost_basis, h.value)) as total_return,
          CASE 
            WHEN h.cost_basis > 0 THEN ((h.value - h.cost_basis) / h.cost_basis) * 100
            ELSE 0 
          END as total_return_percent
        FROM holdings h
        JOIN securities s ON h.security_id = s.security_id
        WHERE h.value IS NOT NULL
        ORDER BY h.value DESC
        LIMIT 10
      `);

      // Get performance summary
      const performance = await database.get(`
        SELECT 
          SUM(h.value - COALESCE(h.cost_basis, h.value)) as total_return,
          AVG(CASE 
            WHEN h.cost_basis > 0 THEN ((h.value - h.cost_basis) / h.cost_basis) * 100
            ELSE 0 
          END) as avg_return_percent,
          0 as total_day_change,
          0 as avg_day_change_percent
        FROM holdings h
        WHERE h.value IS NOT NULL
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
          s.type as security_type,
          SUM(h.value) as total_value,
          COUNT(*) as holding_count
        FROM holdings h
        JOIN securities s ON h.security_id = s.security_id
        WHERE h.value IS NOT NULL
        GROUP BY s.type
        ORDER BY total_value DESC
      `);

      // Get winners and losers
      const winners = await database.all(`
        SELECT 
          s.name as security_name,
          s.ticker_symbol,
          CASE 
            WHEN h.cost_basis > 0 THEN ((h.value - h.cost_basis) / h.cost_basis) * 100
            ELSE 0 
          END as total_return_percent,
          h.value as current_value
        FROM holdings h
        JOIN securities s ON h.security_id = s.security_id
        WHERE h.value IS NOT NULL AND h.cost_basis > 0
        ORDER BY ((h.value - h.cost_basis) / h.cost_basis) * 100 DESC
        LIMIT 5
      `);

      const losers = await database.all(`
        SELECT 
          s.name as security_name,
          s.ticker_symbol,
          CASE 
            WHEN h.cost_basis > 0 THEN ((h.value - h.cost_basis) / h.cost_basis) * 100
            ELSE 0 
          END as total_return_percent,
          h.value as current_value
        FROM holdings h
        JOIN securities s ON h.security_id = s.security_id
        WHERE h.value IS NOT NULL AND h.cost_basis > 0
        ORDER BY ((h.value - h.cost_basis) / h.cost_basis) * 100 ASC
        LIMIT 5
      `);

      // Get diversification metrics
      const diversification = await database.get(`
        SELECT 
          COUNT(DISTINCT s.ticker_symbol) as unique_holdings,
          COUNT(DISTINCT md.sector) as unique_sectors,
          MAX(h.value) as largest_position,
          MIN(h.value) as smallest_position
        FROM holdings h
        JOIN securities s ON h.security_id = s.security_id
        LEFT JOIN market_data md ON s.ticker_symbol = md.symbol
        WHERE h.value IS NOT NULL
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
          it.date,
          it.type,
          it.subtype,
          it.amount,
          s.ticker_symbol,
          s.name as security_name
        FROM investment_transactions it
        LEFT JOIN securities s ON it.security_id = s.security_id
        WHERE it.date >= ?
        ORDER BY it.date DESC
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
