import { Request, Response } from 'express';
import { database } from '../../database';
import { logger } from '../../utils/logger';

/**
 * @swagger
 * /api/financial-health:
 *   get:
 *     summary: Get financial health metrics
 *     description: Returns comprehensive financial health indicators
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Financial health metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 savingsRate:
 *                   type: number
 *                   format: float
 *                 debtToIncomeRatio:
 *                   type: number
 *                   format: float
 *                 monthlyIncome:
 *                   type: number
 *                   format: float
 *                 monthlyExpenses:
 *                   type: number
 *                   format: float
 *                 emergencyFundRatio:
 *                   type: number
 *                   format: float
 *                 score:
 *                   type: integer
 *                   description: Overall financial health score (0-100)
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getFinancialHealth = async (_req: Request, res: Response) => {
  try {
    // Get current month transactions
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    
    const monthTransactions = await database.all(`
      SELECT t.* FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND i.is_active = 1
    `, [monthStartStr]);
    
    // Calculate monthly income and expenses
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    
    monthTransactions.forEach(tx => {
      if (tx.amount > 0) {
        monthlyExpenses += tx.amount;
      } else {
        monthlyIncome += Math.abs(tx.amount);
      }
    });
    
    // Get account balances
    const accounts = await database.all(`
      SELECT a.* FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE i.is_active = 1
    `);
    
    // Calculate savings (depository accounts)
    const savingsAccounts = accounts.filter(a => a.type === 'depository');
    const totalSavings = savingsAccounts.reduce((sum, account) => sum + (account.current_balance || 0), 0);
    
    // Calculate debt (credit accounts)
    const debtAccounts = accounts.filter(a => a.type === 'credit');
    const totalDebt = debtAccounts.reduce((sum, account) => sum + Math.abs(account.current_balance || 0), 0);
    
    // Calculate metrics
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const debtToIncomeRatio = monthlyIncome > 0 ? (totalDebt / monthlyIncome) * 100 : 0;
    const emergencyFundRatio = monthlyExpenses > 0 ? totalSavings / monthlyExpenses : 0;
    
    // Calculate overall score (0-100)
    let score = 0;
    
    // Savings rate component (0-40 points)
    if (savingsRate >= 20) score += 40;
    else if (savingsRate >= 10) score += 30;
    else if (savingsRate >= 5) score += 20;
    else if (savingsRate >= 0) score += 10;
    
    // Debt to income component (0-30 points)
    if (debtToIncomeRatio <= 20) score += 30;
    else if (debtToIncomeRatio <= 40) score += 20;
    else if (debtToIncomeRatio <= 60) score += 10;
    
    // Emergency fund component (0-30 points)
    if (emergencyFundRatio >= 6) score += 30;
    else if (emergencyFundRatio >= 3) score += 20;
    else if (emergencyFundRatio >= 1) score += 10;
    
    res.json({
      savingsRate,
      debtToIncomeRatio,
      monthlyIncome,
      monthlyExpenses,
      emergencyFundRatio,
      score
    });
  } catch (error) {
    logger.error('Error fetching financial health:', error);
    res.status(500).json({ error: 'Failed to fetch financial health data' });
  }
};

/**
 * @swagger
 * /api/cash-flow:
 *   get:
 *     summary: Get cash flow analysis
 *     description: Returns cash flow analysis for a specified time period
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: ['week', 'month', 'quarter', 'year']
 *           default: 'month'
 *         description: Time period for cash flow analysis
 *     responses:
 *       200:
 *         description: Cash flow analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalIncome:
 *                   type: number
 *                   format: float
 *                 totalExpenses:
 *                   type: number
 *                   format: float
 *                 netCashFlow:
 *                   type: number
 *                   format: float
 *                 dailyAverage:
 *                   type: number
 *                   format: float
 *                 trend:
 *                   type: string
 *                   enum: ['positive', 'negative', 'neutral']
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getCashFlowAnalysis = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'month';
    
    // Calculate date range based on period
    let startDate: Date;
    let days: number;
    
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        days = 7;
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        days = 90;
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        days = 365;
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        days = 30;
        break;
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Get transactions for the period
    const transactions = await database.all(`
      SELECT t.* FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND i.is_active = 1
    `, [startDateStr]);
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(tx => {
      if (tx.amount > 0) {
        totalExpenses += tx.amount;
      } else {
        totalIncome += Math.abs(tx.amount);
      }
    });
    
    const netCashFlow = totalIncome - totalExpenses;
    const dailyAverage = netCashFlow / days;
    
    // Determine trend
    let trend = 'neutral';
    if (netCashFlow > 0) trend = 'positive';
    else if (netCashFlow < 0) trend = 'negative';
    
    res.json({
      totalIncome,
      totalExpenses,
      netCashFlow,
      dailyAverage,
      trend
    });
  } catch (error) {
    logger.error('Error fetching cash flow analysis:', error);
    res.status(500).json({ error: 'Failed to fetch cash flow analysis' });
  }
};

/**
 * @swagger
 * /api/spending-trends:
 *   get:
 *     summary: Get spending trends
 *     description: Returns spending trends and patterns over time
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           default: '90'
 *         description: Number of days to analyze trends for
 *     responses:
 *       200:
 *         description: Spending trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 weeklyTrends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       week:
 *                         type: string
 *                       amount:
 *                         type: number
 *                         format: float
 *                 averageWeeklySpending:
 *                   type: number
 *                   format: float
 *                 trendDirection:
 *                   type: string
 *                   enum: ['increasing', 'decreasing', 'stable']
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
export const getSpendingTrends = async (req: Request, res: Response) => {
  try {
    const range = parseInt(req.query.range as string) || 90;
    
    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Get spending transactions
    const transactions = await database.all(`
      SELECT t.date, t.amount FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND t.amount > 0 AND i.is_active = 1
      ORDER BY t.date
    `, [startDateStr]);
    
    // Group by week
    const weeklySpending: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const weekStart = new Date(date.getTime() - (date.getDay() * 24 * 60 * 60 * 1000));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      weeklySpending[weekKey] = (weeklySpending[weekKey] || 0) + tx.amount;
    });
    
    // Convert to array and sort
    const weeklyTrends = Object.entries(weeklySpending)
      .map(([week, amount]) => ({ week, amount }))
      .sort((a, b) => a.week.localeCompare(b.week));
    
    // Calculate metrics
    const averageWeeklySpending = weeklyTrends.reduce((sum, week) => sum + week.amount, 0) / weeklyTrends.length;
    
    // Determine trend direction
    let trendDirection = 'stable';
    let percentageChange = 0;
    
    if (weeklyTrends.length >= 2) {
      const firstWeek = weeklyTrends[0].amount;
      const lastWeek = weeklyTrends[weeklyTrends.length - 1].amount;
      
      percentageChange = firstWeek > 0 ? ((lastWeek - firstWeek) / firstWeek) * 100 : 0;
      
      if (percentageChange > 10) trendDirection = 'increasing';
      else if (percentageChange < -10) trendDirection = 'decreasing';
    }
    
    res.json({
      weeklyTrends,
      averageWeeklySpending,
      trendDirection,
      percentageChange
    });
  } catch (error) {
    logger.error('Error fetching spending trends:', error);
    res.status(500).json({ error: 'Failed to fetch spending trends' });
  }
};
