import { Request, Response } from 'express';
import { database } from '../../database';

/**
 * @swagger
 * /api/spending-data:
 *   get:
 *     summary: Get spending data
 *     description: Returns spending data for charts over a specified time range
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           default: '30'
 *         description: Number of days to retrieve spending data for
 *     responses:
 *       200:
 *         description: Spending data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dailySpending:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       amount:
 *                         type: number
 *                         format: float
 *                 totalSpending:
 *                   type: number
 *                   format: float
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getSpendingData = async (req: Request, res: Response) => {
  try {
    const range = parseInt(req.query.range as string) || 30;
    
    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Get spending transactions (positive amounts) within the range
    const transactions = await database.all(`
      SELECT t.date, t.amount FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND t.amount > 0 AND i.is_active = 1
      ORDER BY t.date
    `, [startDateStr]);
    
    // Group by date and sum amounts
    const dailySpending: { [key: string]: number } = {};
    let totalSpending = 0;
    
    transactions.forEach(tx => {
      const date = tx.date;
      dailySpending[date] = (dailySpending[date] || 0) + tx.amount;
      totalSpending += tx.amount;
    });
    
    // Convert to array format for charts
    const dailySpendingArray = Object.entries(dailySpending).map(([date, amount]) => ({
      date,
      amount
    }));
    
    res.json({
      dailySpending: dailySpendingArray,
      totalSpending
    });
  } catch (error) {
    console.error('Error fetching spending data:', error);
    res.status(500).json({ error: 'Failed to fetch spending data' });
  }
};

/**
 * @swagger
 * /api/spending-by-category:
 *   get:
 *     summary: Get spending by category
 *     description: Returns spending breakdown by category for a specified time range
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           default: '30'
 *         description: Number of days to retrieve spending data for
 *     responses:
 *       200:
 *         description: Category spending data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categorySpending:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       amount:
 *                         type: number
 *                         format: float
 *                       percentage:
 *                         type: number
 *                         format: float
 *                 totalSpending:
 *                   type: number
 *                   format: float
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getSpendingByCategory = async (req: Request, res: Response) => {
  try {
    const range = parseInt(req.query.range as string) || 30;
    
    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Get spending transactions by category
    const transactions = await database.all(`
      SELECT t.category_primary, SUM(t.amount) as amount FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND t.amount > 0 AND i.is_active = 1
      GROUP BY t.category_primary
      ORDER BY amount DESC
    `, [startDateStr]);
    
    // Calculate total spending
    const totalSpending = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Calculate percentages
    const categorySpending = transactions.map(tx => ({
      category: tx.category_primary || 'Uncategorized',
      amount: tx.amount,
      percentage: totalSpending > 0 ? (tx.amount / totalSpending) * 100 : 0
    }));
    
    res.json({
      categorySpending,
      totalSpending
    });
  } catch (error) {
    console.error('Error fetching spending by category:', error);
    res.status(500).json({ error: 'Failed to fetch spending by category' });
  }
};

/**
 * @swagger
 * /api/monthly-spending-comparison:
 *   get:
 *     summary: Get monthly spending comparison
 *     description: Returns spending comparison between current and previous month
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Monthly spending comparison retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentMonth:
 *                   type: number
 *                   format: float
 *                 previousMonth:
 *                   type: number
 *                   format: float
 *                 percentageChange:
 *                   type: number
 *                   format: float
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getMonthlySpendingComparison = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    
    // Current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthStartStr = currentMonthStart.toISOString().split('T')[0];
    
    // Previous month
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const previousMonthStartStr = previousMonthStart.toISOString().split('T')[0];
    const previousMonthEndStr = previousMonthEnd.toISOString().split('T')[0];
    
    // Get current month spending
    const currentMonthTransactions = await database.all(`
      SELECT SUM(t.amount) as total FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND t.amount > 0 AND i.is_active = 1
    `, [currentMonthStartStr]);
    
    // Get previous month spending
    const previousMonthTransactions = await database.all(`
      SELECT SUM(t.amount) as total FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND t.date <= ? AND t.amount > 0 AND i.is_active = 1
    `, [previousMonthStartStr, previousMonthEndStr]);
    
    const currentMonth = currentMonthTransactions[0]?.total || 0;
    const previousMonth = previousMonthTransactions[0]?.total || 0;
    
    // Calculate percentage change
    const percentageChange = previousMonth > 0 ? 
      ((currentMonth - previousMonth) / previousMonth) * 100 : 0;
    
    res.json({
      currentMonth,
      previousMonth,
      percentageChange
    });
  } catch (error) {
    console.error('Error fetching monthly spending comparison:', error);
    res.status(500).json({ error: 'Failed to fetch monthly spending comparison' });
  }
};

/**
 * @swagger
 * /api/top-merchants:
 *   get:
 *     summary: Get top merchants
 *     description: Returns top merchants by spending amount for a specified time range
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           default: '30'
 *         description: Number of days to retrieve merchant data for
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: '10'
 *         description: Number of top merchants to return
 *     responses:
 *       200:
 *         description: Top merchants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 merchants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       merchant:
 *                         type: string
 *                       amount:
 *                         type: number
 *                         format: float
 *                       transactionCount:
 *                         type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getTopMerchants = async (req: Request, res: Response) => {
  try {
    const range = parseInt(req.query.range as string) || 30;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Get top merchants by spending
    const merchants = await database.all(`
      SELECT 
        t.merchant_name as merchant,
        SUM(t.amount) as amount,
        COUNT(*) as transactionCount
      FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND t.amount > 0 AND t.merchant_name IS NOT NULL AND i.is_active = 1
      GROUP BY t.merchant_name
      ORDER BY amount DESC
      LIMIT ?
    `, [startDateStr, limit]);
    
    res.json({
      merchants: merchants.map(m => ({
        merchant: m.merchant,
        amount: m.amount,
        transactionCount: m.transactionCount
      }))
    });
  } catch (error) {
    console.error('Error fetching top merchants:', error);
    res.status(500).json({ error: 'Failed to fetch top merchants' });
  }
};
