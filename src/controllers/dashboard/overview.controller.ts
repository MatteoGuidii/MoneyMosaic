import { Request, Response } from 'express';
import { database } from '../../database';

/**
 * @swagger
 * /api/overview:
 *   get:
 *     summary: Get dashboard overview
 *     description: Returns comprehensive dashboard overview including balances, portfolio value, and account statistics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard overview data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardOverview'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getOverview = async (_req: Request, res: Response) => {
  try {
    // Get all accounts from active institutions
    const accountsResult = await database.all(`
      SELECT a.* FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE i.is_active = 1
    `);
    
    // Separate accounts by type
    const cashAccounts = accountsResult.filter(account => 
      account.type === 'depository' || account.type === 'credit'
    );
    const investmentAccounts = accountsResult.filter(account => 
      account.type === 'investment'
    );
    
    // Calculate total cash balance (only depository accounts, exclude credit)
    const totalCashBalance = cashAccounts.reduce((sum, account) => {
      if (account.type === 'credit') {
        // Credit accounts represent debt, so we don't include them in cash balance
        return sum;
      }
      return sum + (account.current_balance || 0);
    }, 0);
    
    // Calculate total portfolio value from investment accounts
    const totalPortfolioValue = investmentAccounts.reduce((sum, account) => 
      sum + (account.current_balance || 0), 0
    );
    
    // Get today's transactions for net flow (only from active institutions)
    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = await database.all(`
      SELECT t.* FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date = ? AND i.is_active = 1
    `, [today]);
    const todayNetFlow = todaysTransactions.reduce((sum, tx) => sum + (-tx.amount), 0);
    
    res.json({
      totalCashBalance,
      totalPortfolioValue,
      netWorth: totalCashBalance + totalPortfolioValue,
      todayNetFlow
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview data' });
  }
};

/**
 * @swagger
 * /api/earnings:
 *   get:
 *     summary: Get earnings data
 *     description: Returns earnings data including today's net flow, month-to-date flow, and 7-day average
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Earnings data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todayNetFlow:
 *                   type: number
 *                   format: float
 *                 monthToDateNetFlow:
 *                   type: number
 *                   format: float
 *                 sevenDayAverage:
 *                   type: number
 *                   format: float
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getEarnings = async (_req: Request, res: Response) => {
  try {
    // Get today's net flow (only from active institutions)
    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = await database.all(`
      SELECT t.* FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date = ? AND i.is_active = 1
    `, [today]);
    const todayNetFlow = todaysTransactions.reduce((sum, tx) => sum + (-tx.amount), 0);
    
    // Get month-to-date (only from active institutions)
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    
    const monthTransactions = await database.all(`
      SELECT t.* FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND i.is_active = 1
    `, [monthStartStr]);
    const monthToDateNetFlow = monthTransactions.reduce((sum, tx) => sum + (-tx.amount), 0);
    
    // Get 7-day average (only from active institutions)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    const recentTransactions = await database.all(`
      SELECT t.* FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND i.is_active = 1
    `, [sevenDaysAgoStr]);
    const sevenDayTotal = recentTransactions.reduce((sum, tx) => sum + (-tx.amount), 0);
    const sevenDayAverage = sevenDayTotal / 7;
    
    res.json({
      todayNetFlow,
      monthToDateNetFlow,
      sevenDayAverage
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: 'Failed to fetch earnings data' });
  }
};
