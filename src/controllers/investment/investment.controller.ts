import { Request, Response } from 'express';
import { database } from '../../database';
import { logger } from '../../utils/logger';

/**
 * @swagger
 * /api/investments:
 *   get:
 *     summary: Get all investments
 *     description: Retrieve all investment holdings
 *     tags: [Investments]
 *     responses:
 *       200:
 *         description: Investments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 investments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Investment'
 *       500:
 *         description: Server error
 */
export const getInvestments = async (_req: Request, res: Response) => {
  try {
    // For now, return empty investments array since the analytics service needs more work
    const investments = await database.all(`
      SELECT 
        h.id,
        h.account_id,
        h.security_id,
        h.quantity,
        h.price,
        h.value,
        h.cost_basis,
        s.name as security_name,
        s.symbol as ticker_symbol,
        s.type as security_type
      FROM holdings h
      JOIN securities s ON h.security_id = s.security_id
      ORDER BY h.value DESC
    `);
    
    return res.json({ investments });
  } catch (error) {
    logger.error('Error fetching investments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/investments/summary:
 *   get:
 *     summary: Get investment summary
 *     description: Retrieve portfolio summary data
 *     tags: [Investments]
 *     responses:
 *       200:
 *         description: Investment summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvestmentSummary'
 *       500:
 *         description: Server error
 */
export const getInvestmentSummary = async (_req: Request, res: Response) => {
  try {
    // Return a basic summary with totals from the holdings table
    const summary = await database.get(`
      SELECT 
        SUM(h.value) as total_value,
        SUM(h.cost_basis) as total_cost_basis,
        COUNT(*) as holdings_count
      FROM holdings h
    `);
    
    const totalValue = summary.total_value || 0;
    const totalCostBasis = summary.total_cost_basis || 0;
    
    return res.json({
      totalValue,
      totalCostBasis,
      totalDayChange: 0,
      totalDayChangePercent: 0,
      holdingsCount: summary.holdings_count || 0,
      accountsCount: 1,
      topHoldings: [],
      sectorAllocation: []
    });
  } catch (error) {
    logger.error('Error fetching investment summary:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/investments/accounts:
 *   get:
 *     summary: Get investment accounts
 *     description: Retrieve all investment accounts
 *     tags: [Investments]
 *     responses:
 *       200:
 *         description: Investment accounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasInvestmentAccounts:
 *                   type: boolean
 *                 supportsDetailedData:
 *                   type: boolean
 *                 accounts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Account'
 *       500:
 *         description: Server error
 */
export const getInvestmentAccounts = async (_req: Request, res: Response) => {
  try {
    const accounts = await database.all(`
      SELECT a.* FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE a.type = 'investment' AND i.is_active = 1
    `);
    
    return res.json({
      hasInvestmentAccounts: accounts.length > 0,
      supportsDetailedData: true,
      accounts: accounts
    });
  } catch (error) {
    logger.error('Error fetching investment accounts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/investments/transactions:
 *   get:
 *     summary: Get investment transactions
 *     description: Retrieve investment transactions with optional filters
 *     tags: [Investments]
 *     parameters:
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
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Account ID filter
 *       - in: query
 *         name: securityId
 *         schema:
 *           type: string
 *         description: Security ID filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of transactions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of transactions to skip
 *     responses:
 *       200:
 *         description: Investment transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InvestmentTransaction'
 *                 totalCount:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 *       500:
 *         description: Server error
 */
export const getInvestmentTransactions = async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const transactions = await database.all(`
      SELECT 
        it.*,
        s.name as security_name,
        s.symbol as ticker_symbol
      FROM investment_transactions it
      LEFT JOIN securities s ON it.security_id = s.security_id
      ORDER BY it.date DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    const totalCount = await database.get(`
      SELECT COUNT(*) as count FROM investment_transactions
    `);
    
    return res.json({
      transactions,
      totalCount: totalCount.count || 0,
      hasMore: (Number(offset) + Number(limit)) < (totalCount.count || 0)
    });
  } catch (error) {
    logger.error('Error fetching investment transactions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/investments/dashboard:
 *   get:
 *     summary: Get investment dashboard data
 *     description: Retrieve comprehensive investment dashboard data
 *     tags: [Investments]
 *     responses:
 *       200:
 *         description: Investment dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   $ref: '#/components/schemas/InvestmentSummary'
 *                 analysis:
 *                   type: object
 *                 performance:
 *                   type: object
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
export const getInvestmentDashboard = async (_req: Request, res: Response) => {
  try {
    // Return basic dashboard data without using the complex analytics service
    const summary = await database.get(`
      SELECT 
        SUM(h.value) as total_value,
        SUM(h.cost_basis) as total_cost_basis,
        COUNT(*) as holdings_count
      FROM holdings h
    `);
    
    const accounts = await database.all(`
      SELECT a.* FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE a.type = 'investment' AND i.is_active = 1
    `);
    
    return res.json({
      summary: {
        totalValue: summary.total_value || 0,
        totalCostBasis: summary.total_cost_basis || 0,
        totalDayChange: 0,
        totalDayChangePercent: 0,
        holdingsCount: summary.holdings_count || 0,
        accountsCount: accounts.length,
        topHoldings: [],
        sectorAllocation: [],
        holdings: [],
        accounts: accounts
      },
      analysis: {
        typeAllocation: [],
        winners: [],
        losers: [],
        diversification: {}
      },
      performance: {
        performanceHistory: [],
        summary: {}
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching investment dashboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
