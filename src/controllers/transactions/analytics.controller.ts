import { Request, Response } from 'express';
import { bankService } from '../../services/bank.service';
import { database } from '../../database';
import { logger } from '../../utils/logger';

/**
 * @swagger
 * /api/transactions/trends:
 *   get:
 *     summary: Get spending trends
 *     description: Returns spending trends over time
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Number of days to analyze trends for
 *     responses:
 *       200:
 *         description: Trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dailyTrends:
 *                   type: array
 *                   items:
 *                     type: object
 *                 categoryTrends:
 *                   type: array
 *                   items:
 *                     type: object
 *                 summary:
 *                   type: object
 *       500:
 *         description: Server error
 */
export const getTrends = async (req: Request, res: Response) => {
  try {
    const { days = 90 } = req.query;
    const daysNum = parseInt(days as string, 10);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    
    // Get daily spending trends
    const dailyTrends = await database.all(`
      SELECT 
        date,
        SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as dailySpending,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as dailyIncome,
        COUNT(*) as transactionCount
      FROM transactions
      WHERE date >= ?
      GROUP BY date
      ORDER BY date ASC
    `, [startDate.toISOString().split('T')[0]]);
    
    // Get category trends
    const categoryTrends = await database.all(`
      SELECT 
        category_primary as category,
        SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as totalSpent,
        COUNT(*) as transactionCount,
        AVG(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as averageAmount
      FROM transactions
      WHERE date >= ? AND amount < 0
      GROUP BY category_primary
      ORDER BY totalSpent DESC
    `, [startDate.toISOString().split('T')[0]]);
    
    // Calculate summary statistics
    const totalSpending = dailyTrends.reduce((sum, day) => sum + day.dailySpending, 0);
    const totalIncome = dailyTrends.reduce((sum, day) => sum + day.dailyIncome, 0);
    const averageDaily = totalSpending / daysNum;
    
    res.json({
      dailyTrends,
      categoryTrends,
      summary: {
        totalSpending,
        totalIncome,
        netCashFlow: totalIncome - totalSpending,
        averageDaily,
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          days: daysNum
        }
      }
    });
  } catch (error) {
    logger.error('Error getting trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/transactions/insights:
 *   get:
 *     summary: Get transaction insights
 *     description: Returns insights and analysis of spending patterns
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Insights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 spendingInsights:
 *                   type: object
 *                 categoryInsights:
 *                   type: array
 *                   items:
 *                     type: object
 *                 timeInsights:
 *                   type: object
 *       500:
 *         description: Server error
 */
export const getInsights = async (_req: Request, res: Response) => {
  try {
    const result = await bankService.getBudgetInsights();
    res.json(result);
  } catch (error) {
    logger.error('Error getting insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/transactions/categories/{category}/analysis:
 *   get:
 *     summary: Get category analysis
 *     description: Returns detailed analysis for a specific category
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category to analyze
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Number of days to analyze
 *     responses:
 *       200:
 *         description: Category analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: string
 *                 totalSpent:
 *                   type: number
 *                 transactionCount:
 *                   type: integer
 *                 averageAmount:
 *                   type: number
 *                 trends:
 *                   type: array
 *                   items:
 *                     type: object
 *                 topMerchants:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
export const getCategoryAnalysis = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { days = 90 } = req.query;
    const daysNum = parseInt(days as string, 10);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    
    // Get category summary
    const summary = await database.get(`
      SELECT 
        category_primary as category,
        SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as totalSpent,
        COUNT(*) as transactionCount,
        AVG(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as averageAmount,
        MIN(date) as firstTransaction,
        MAX(date) as lastTransaction
      FROM transactions
      WHERE category_primary = ? AND date >= ? AND amount < 0
      GROUP BY category_primary
    `, [category, startDate.toISOString().split('T')[0]]);
    
    if (!summary) {
      return res.status(404).json({ error: 'Category not found or no transactions' });
    }
    
    // Get daily trends for this category
    const trends = await database.all(`
      SELECT 
        date,
        SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as dailySpent,
        COUNT(*) as transactionCount
      FROM transactions
      WHERE category_primary = ? AND date >= ?
      GROUP BY date
      ORDER BY date ASC
    `, [category, startDate.toISOString().split('T')[0]]);
    
    // Get top merchants for this category
    const topMerchants = await database.all(`
      SELECT 
        merchant_name,
        SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as totalSpent,
        COUNT(*) as transactionCount,
        AVG(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as averageAmount
      FROM transactions
      WHERE category_primary = ? AND date >= ? AND amount < 0
      GROUP BY merchant_name
      ORDER BY totalSpent DESC
      LIMIT 10
    `, [category, startDate.toISOString().split('T')[0]]);
    
    return res.json({
      category,
      totalSpent: summary.totalSpent || 0,
      transactionCount: summary.transactionCount || 0,
      averageAmount: summary.averageAmount || 0,
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        days: daysNum,
        firstTransaction: summary.firstTransaction,
        lastTransaction: summary.lastTransaction
      },
      trends: trends || [],
      topMerchants: topMerchants || []
    });
  } catch (error) {
    logger.error('Error getting category analysis:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/transactions/alerts:
 *   get:
 *     summary: Get transaction alerts
 *     description: Returns alerts for unusual spending patterns
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                 summary:
 *                   type: object
 *       500:
 *         description: Server error
 */
export const getAlerts = async (_req: Request, res: Response) => {
  try {
    const alerts: any[] = [];
    
    // Check for unusual spending patterns
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    // Check for high spending today
    const todaySpending = await database.get(`
      SELECT SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as totalSpent
      FROM transactions
      WHERE date = ?
    `, [today.toISOString().split('T')[0]]);
    
    // Check average spending over last week
    const weeklyAverage = await database.get(`
      SELECT AVG(daily_spending) as averageDaily
      FROM (
        SELECT 
          date,
          SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as daily_spending
        FROM transactions
        WHERE date >= ? AND date < ?
        GROUP BY date
      )
    `, [weekAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]]);
    
    if (todaySpending.totalSpent > (weeklyAverage.averageDaily * 2)) {
      alerts.push({
        type: 'high_spending',
        severity: 'warning',
        message: 'Today\'s spending is significantly higher than your weekly average',
        details: {
          todaySpending: todaySpending.totalSpent,
          weeklyAverage: weeklyAverage.averageDaily
        }
      });
    }
    
    // Check for duplicate transactions
    const duplicates = await database.all(`
      SELECT 
        merchant_name,
        amount,
        date,
        COUNT(*) as count
      FROM transactions
      WHERE date >= ?
      GROUP BY merchant_name, amount, date
      HAVING COUNT(*) > 1
    `, [weekAgo.toISOString().split('T')[0]]);
    
    if (duplicates.length > 0) {
      alerts.push({
        type: 'duplicate_transactions',
        severity: 'info',
        message: 'Potential duplicate transactions detected',
        details: {
          duplicateCount: duplicates.length,
          duplicates: duplicates.slice(0, 5) // Show first 5
        }
      });
    }
    
    res.json({
      alerts,
      summary: {
        totalAlerts: alerts.length,
        highSeverity: alerts.filter(a => a.severity === 'error').length,
        mediumSeverity: alerts.filter(a => a.severity === 'warning').length,
        lowSeverity: alerts.filter(a => a.severity === 'info').length
      }
    });
  } catch (error) {
    logger.error('Error getting alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
