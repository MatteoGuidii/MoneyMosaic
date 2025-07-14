import { Request, Response } from 'express';
import { investmentService } from '../../services/investment.service';
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
    const dashboard = await investmentService.getInvestmentDashboard();
    return res.json({ investments: dashboard.summary?.holdings || [] });
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
    const summary = await investmentService.getPortfolioSummary();
    return res.json(summary);
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
    const dashboard = await investmentService.getInvestmentDashboard();
    return res.json({
      hasInvestmentAccounts: true,
      supportsDetailedData: true,
      accounts: dashboard.summary?.accounts || []
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
export const getInvestmentTransactions = async (_req: Request, res: Response) => {
  try {
    // For now, return empty array since we don't have the backend implementation
    // In a real implementation, you would filter the transactions based on the parameters
    const transactions: any[] = [];
    
    return res.json({
      transactions,
      totalCount: 0,
      hasMore: false
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
    const dashboard = await investmentService.getInvestmentDashboard();
    return res.json(dashboard);
  } catch (error) {
    logger.error('Error fetching investment dashboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
