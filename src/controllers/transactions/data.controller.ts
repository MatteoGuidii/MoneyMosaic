import { Request, Response } from 'express';
import { database } from '../../database';
import { logger } from '../../utils/logger';

/**
 * @swagger
 * /api/transactions/date-range:
 *   get:
 *     summary: Get transaction date range
 *     description: Returns the date range of available transactions
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Date range retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 earliestDate:
 *                   type: string
 *                   format: date
 *                 latestDate:
 *                   type: string
 *                   format: date
 *                 totalTransactions:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export const getDateRange = async (_req: Request, res: Response) => {
  try {
    const result = await database.get(`
      SELECT 
        MIN(date) as earliestDate,
        MAX(date) as latestDate,
        COUNT(*) as totalTransactions
      FROM transactions
      WHERE date IS NOT NULL
    `);
    
    res.json({
      earliestDate: result.earliestDate,
      latestDate: result.latestDate,
      totalTransactions: result.totalTransactions
    });
  } catch (error) {
    logger.error('Error getting date range:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get transactions
 *     description: Returns transactions with filtering and pagination
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of transactions per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Server error
 */
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      startDate,
      endDate,
      search,
      accounts,
      minAmount,
      maxAmount,
      sortField = 'date',
      sortDirection = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (category) {
      whereClause += ' AND t.category_primary = ?';
      params.push(category);
    }

    if (startDate) {
      whereClause += ' AND t.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND t.date <= ?';
      params.push(endDate);
    }

    if (search) {
      whereClause += ' AND (LOWER(t.name) LIKE ? OR LOWER(t.merchant_name) LIKE ? OR LOWER(t.category_primary) LIKE ?)';
      const term = `%${(search as string).toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (accounts) {
      const accountList = (accounts as string)
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
      if (accountList.length > 0) {
        const placeholders = accountList.map(() => '?').join(',');
        whereClause += ` AND a.name IN (${placeholders})`;
        params.push(...accountList);
      }
    }

    if (minAmount) {
      whereClause += ' AND ABS(t.amount) >= ?';
      params.push(parseFloat(minAmount as string));
    }

    if (maxAmount) {
      whereClause += ' AND ABS(t.amount) <= ?';
      params.push(parseFloat(maxAmount as string));
    }


    // Shared FROM/JOIN for both queries
    const fromJoin = `FROM transactions t
      JOIN accounts a ON t.account_id = a.account_id
      JOIN institutions i ON a.institution_id = i.id`;

    // Get total count (use same FROM/JOIN/aliases as data query)
    const countResult = await database.get(`
      SELECT COUNT(*) as total
      ${fromJoin}
      ${whereClause}
    `, params);

    // Get transactions
    const transactions = await database.all(`
      SELECT 
        t.*,
        t.category_primary as category,
        a.name as account_name,
        a.type as account_type,
        i.name as institution_name
      ${fromJoin}
      ${whereClause}
      ORDER BY ${
        sortField === 'name'
          ? 't.name'
          : sortField === 'amount'
          ? 't.amount'
          : sortField === 'category'
          ? 't.category_primary'
          : 't.date'
      } ${sortDirection === 'asc' ? 'ASC' : 'DESC'}
      LIMIT ? OFFSET ?
    `, [...params, limitNum, offset]);

    const total = countResult.total;
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    logger.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/transactions/summary:
 *   get:
 *     summary: Get transaction summary
 *     description: Returns summary statistics for transactions
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to calculate summary for
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalExpenses:
 *                   type: number
 *                 totalIncome:
 *                   type: number
 *                 netCashFlow:
 *                   type: number
 *                 transactionCount:
 *                   type: integer
 *                 averageDaily:
 *                   type: number
 *                 topCategories:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
export const getTransactionSummary = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days as string, 10);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    
    // Get basic summary
    const summary = await database.get(`
      SELECT 
        SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as totalExpenses,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as totalIncome,
        SUM(amount) as netCashFlow,
        COUNT(*) as transactionCount,
        AVG(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as averageExpense
      FROM transactions
      WHERE date >= ?
    `, [startDate.toISOString().split('T')[0]]);
    
    // Get top categories
    const topCategories = await database.all(`
      SELECT 
        category_primary as category,
        SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as totalSpent,
        COUNT(*) as transactionCount
      FROM transactions
      WHERE date >= ? AND amount < 0
      GROUP BY category_primary
      ORDER BY totalSpent DESC
      LIMIT 10
    `, [startDate.toISOString().split('T')[0]]);
    
    const averageDaily = summary.totalExpenses / daysNum;
    
    res.json({
      totalExpenses: summary.totalExpenses || 0,
      totalIncome: summary.totalIncome || 0,
      netCashFlow: summary.netCashFlow || 0,
      transactionCount: summary.transactionCount || 0,
      averageDaily: averageDaily || 0,
      topCategories: topCategories || [],
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        days: daysNum
      }
    });
  } catch (error) {
    logger.error('Error getting transaction summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
