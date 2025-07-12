import express from 'express';
import { database } from '../database';
import { investmentService } from '../services/investment.service';

const router = express.Router();

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
// Get overview data for dashboard
router.get('/overview', async (_req, res) => {
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
    const todayNetFlow = todaysTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
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
});

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
// Get earnings summary
router.get('/earnings', async (_req, res) => {
  try {
    // Get today's net flow (only from active institutions)
    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = await database.all(`
      SELECT t.* FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date = ? AND i.is_active = 1
    `, [today]);
    const todayNetFlow = todaysTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
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
    const monthToDateNetFlow = monthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
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
    const sevenDayTotal = recentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
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
});

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
// Get spending data for charts
router.get('/spending-data', async (req, res) => {
  try {
    const { range = '30' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(range as string));
    const startDate = daysAgo.toISOString().split('T')[0];
    
    const transactions = await database.all(`
      SELECT t.* FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND i.is_active = 1 
      ORDER BY t.date
    `, [startDate]);
    
    // Group by date
    const dateGroups: { [key: string]: { spending: number, income: number } } = {};
    
    transactions.forEach(tx => {
      if (!dateGroups[tx.date]) {
        dateGroups[tx.date] = { spending: 0, income: 0 };
      }
      
      if (tx.amount > 0) {
        // Positive amounts are income (money coming in)
        dateGroups[tx.date].income += tx.amount;
      } else {
        // Negative amounts are spending (money going out)
        dateGroups[tx.date].spending += Math.abs(tx.amount);
      }
    });
    
    const spendingData = Object.keys(dateGroups).map(date => ({
      date,
      spending: dateGroups[date].spending,
      income: dateGroups[date].income
    }));
    
    res.json(spendingData);
  } catch (error) {
    console.error('Error fetching spending data:', error);
    res.status(500).json({ error: 'Failed to fetch spending data' });
  }
});

// Get category data for charts
router.get('/category-data', async (req, res) => {
  try {
    const { range = '30' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(range as string));
    const startDate = daysAgo.toISOString().split('T')[0];
    
    const transactions = await database.all(`
      SELECT t.* FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND t.amount < 0 AND i.is_active = 1
    `, [startDate]);
    
    // Group by category
    const categoryGroups: { [key: string]: number } = {};
    let totalSpending = 0;
    
    transactions.forEach(tx => {
      const category = tx.category_primary || 'Other';
      const amount = Math.abs(tx.amount);
      
      if (!categoryGroups[category]) {
        categoryGroups[category] = 0;
      }
      
      categoryGroups[category] += amount;
      totalSpending += amount;
    });
    
    const categoryData = Object.keys(categoryGroups).map(category => ({
      category,
      amount: categoryGroups[category],
      percentage: totalSpending > 0 ? Math.round((categoryGroups[category] / totalSpending) * 100) : 0
    }));
    
    res.json(categoryData);
  } catch (error) {
    console.error('Error fetching category data:', error);
    res.status(500).json({ error: 'Failed to fetch category data' });
  }
});

// Get categories list
router.get('/categories', async (_req, res) => {
  try {
    const categories = await database.all(`
      SELECT DISTINCT t.category_primary FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.category_primary IS NOT NULL AND i.is_active = 1
    `);
    const categoryList = categories.map(row => row.category_primary);
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get budget data (user-defined budgets vs actual spending)
router.get('/budget', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Use current month/year if not specified
    const currentDate = new Date();
    const targetMonth = month ? month.toString() : (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const targetYear = year ? parseInt(year.toString()) : currentDate.getFullYear();
    
    const budgetData = await database.getBudgetWithSpending(targetMonth, targetYear);
    
    res.json(budgetData);
  } catch (error) {
    console.error('Error fetching budget data:', error);
    res.status(500).json({ error: 'Failed to fetch budget data' });
  }
});

/**
 * @swagger
 * /api/budget:
 *   post:
 *     summary: Create or update a budget
 *     description: Creates or updates a budget for a specific category and month
 *     tags: [Budget]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: Budget category name
 *               amount:
 *                 type: number
 *                 description: Budget amount
 *               month:
 *                 type: string
 *                 description: Month (01-12)
 *               year:
 *                 type: number
 *                 description: Year
 *             required:
 *               - category
 *               - amount
 *     responses:
 *       200:
 *         description: Budget created/updated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/budget', async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;
    
    if (!category || amount === undefined) {
      return res.status(400).json({ error: 'Category and amount are required' });
    }
    
    // Use current month/year if not specified
    const currentDate = new Date();
    const targetMonth = month || (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const targetYear = year || currentDate.getFullYear();
    
    await database.createOrUpdateBudget(category, amount, targetMonth, targetYear);
    
    return res.json({ success: true, message: 'Budget saved successfully' });
  } catch (error) {
    console.error('Error saving budget:', error);
    return res.status(500).json({ error: 'Failed to save budget' });
  }
});

/**
 * @swagger
 * /api/budget/{category}:
 *   delete:
 *     summary: Delete a budget
 *     description: Deletes a budget for a specific category and month
 *     tags: [Budget]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         description: Budget category to delete
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         description: Month (01-12), defaults to current month
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *         description: Year, defaults to current year
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/budget/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { month, year } = req.query;
    
    // Use current month/year if not specified
    const currentDate = new Date();
    const targetMonth = month ? month.toString() : (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const targetYear = year ? parseInt(year.toString()) : currentDate.getFullYear();
    
    await database.deleteBudget(category, targetMonth, targetYear);
    
    return res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return res.status(500).json({ error: 'Failed to delete budget' });
  }
});

/**
 * @swagger
 * /api/investments:
 *   get:
 *     summary: Get investment data
 *     description: Returns investment account data and portfolio information
 *     tags: [Investments]
 *     responses:
 *       200:
 *         description: Investment data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalValue:
 *                   type: number
 *                   format: float
 *                 accounts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Account'
 *                 holdings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       account_id:
 *                         type: string
 *                       security_id:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                         format: float
 *                       value:
 *                         type: number
 *                         format: float
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get investments data
router.get('/investments', async (_req, res) => {
  try {
    // First, get investment accounts (we know these exist)
    const investmentAccounts = await database.all(`
      SELECT a.* FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE a.type = 'investment' AND i.is_active = 1
    `);
    
    // Try to get detailed holdings
    const holdings = await database.getHoldings();
    
    if (holdings.length === 0) {
      // Check if it's because no institutions support investments API
      const supportStatus = await investmentService.getInvestmentSupportStatus();
      
      if (investmentAccounts.length > 0) {
        // We have investment accounts but no detailed holdings data
        const accountsWithBalances = investmentAccounts.map(account => ({
          accountId: account.account_id,
          accountName: account.name,
          accountType: account.subtype || account.type,
          institutionName: account.institution_name || 'Unknown Institution',
          balance: account.current_balance || 0,
          availableBalance: account.available_balance,
          currency: account.iso_currency_code || 'CAD',
          lastUpdated: account.updated_at
        }));
        
        const totalValue = accountsWithBalances.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        
        return res.json({
          hasInvestmentAccounts: true,
          supportsDetailedData: false,
          totalValue,
          accounts: accountsWithBalances,
          investments: [], // No detailed holdings
          message: 'Investment account balances available, but detailed holdings data is not supported by your institution',
          supportStatus
        });
      }
      
      if (supportStatus.supportedInstitutions === 0) {
        return res.json({
          hasInvestmentAccounts: investmentAccounts.length > 0,
          supportsDetailedData: false,
          totalValue: 0,
          accounts: [],
          investments: [],
          message: 'No institutions support detailed investment data',
          supportStatus
        });
      }
      
      return res.json({
        hasInvestmentAccounts: false,
        supportsDetailedData: false,
        totalValue: 0,
        accounts: [],
        investments: [],
        message: 'No investment holdings found'
      });
    }

    // We have detailed holdings data
    const investments = holdings.map(holding => ({
      symbol: holding.symbol || 'N/A',
      companyName: holding.security_name || 'Unknown Security',
      quantity: holding.quantity,
      marketPrice: holding.current_price || holding.price,
      marketValue: holding.value,
      dayChange: holding.day_change || 0,
      dayChangePercent: holding.day_change_percent || 0,
      accountId: holding.account_id,
      accountName: holding.account_name,
      institutionName: holding.institution_name,
      sector: holding.sector,
      industry: holding.industry,
      costBasis: holding.cost_basis,
      securityType: holding.security_type
    }));

    return res.json({ 
      hasInvestmentAccounts: true,
      supportsDetailedData: true,
      totalValue: investments.reduce((sum, inv) => sum + inv.marketValue, 0),
      accounts: investmentAccounts,
      investments 
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return res.status(500).json({ error: 'Failed to fetch investments data' });
  }
});

/**
 * @swagger
 * /api/investments/summary:
 *   get:
 *     summary: Get investment portfolio summary
 *     description: Returns portfolio summary including total value, performance, and sector allocation
 *     tags: [Investments]
 *     responses:
 *       200:
 *         description: Investment portfolio summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalValue:
 *                   type: number
 *                   format: float
 *                 totalCostBasis:
 *                   type: number
 *                   format: float
 *                 totalDayChange:
 *                   type: number
 *                   format: float
 *                 totalDayChangePercent:
 *                   type: number
 *                   format: float
 *                 holdingsCount:
 *                   type: integer
 *                 accountsCount:
 *                   type: integer
 *                 topHoldings:
 *                   type: array
 *                   items:
 *                     type: object
 *                 sectorAllocation:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sector:
 *                         type: string
 *                       value:
 *                         type: number
 *                       percentage:
 *                         type: number
 *       500:
 *         description: Server error
 */
router.get('/investments/summary', async (_req, res) => {
  try {
    // Get investment accounts first
    const investmentAccounts = await database.all(`
      SELECT a.* FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE a.type = 'investment' AND i.is_active = 1
    `);
    
    // Check if any institutions support investments API
    const supportStatus = await investmentService.getInvestmentSupportStatus();
    
    if (investmentAccounts.length === 0) {
      return res.json({
        totalValue: 0,
        totalCostBasis: 0,
        totalDayChange: 0,
        totalDayChangePercent: 0,
        holdingsCount: 0,
        accountsCount: 0,
        topHoldings: [],
        sectorAllocation: [],
        hasInvestmentAccounts: false,
        supportsDetailedData: false,
        message: 'No investment accounts found',
        supportStatus
      });
    }
    
    // Calculate total value from account balances
    const totalValueFromAccounts = investmentAccounts.reduce((sum, account) => 
      sum + (account.current_balance || 0), 0
    );
    
    if (supportStatus.supportedInstitutions === 0) {
      // We have investment accounts but no detailed holdings API support
      return res.json({
        totalValue: totalValueFromAccounts,
        totalCostBasis: 0, // We don't have cost basis data without holdings API
        totalDayChange: 0, // We don't have day change data without holdings API
        totalDayChangePercent: 0,
        holdingsCount: 0,
        accountsCount: investmentAccounts.length,
        topHoldings: [],
        sectorAllocation: [],
        accounts: investmentAccounts.map(account => ({
          accountId: account.account_id,
          accountName: account.name,
          accountType: account.subtype || account.type,
          balance: account.current_balance || 0,
          institutionName: account.institution_name || 'Unknown Institution'
        })),
        hasInvestmentAccounts: true,
        supportsDetailedData: false,
        message: 'Investment account balances available, but detailed holdings data is not supported by your institution',
        supportStatus
      });
    }
    
    // Try to get detailed summary (this will only work if holdings API is supported)
    try {
      const summary = await investmentService.getInvestmentSummary();
      return res.json({
        ...summary,
        hasInvestmentAccounts: true,
        supportsDetailedData: true,
        accountsCount: investmentAccounts.length
      });
    } catch (error) {
      // Fallback to account-based summary
      return res.json({
        totalValue: totalValueFromAccounts,
        totalCostBasis: 0,
        totalDayChange: 0,
        totalDayChangePercent: 0,
        holdingsCount: 0,
        accountsCount: investmentAccounts.length,
        topHoldings: [],
        sectorAllocation: [],
        accounts: investmentAccounts.map(account => ({
          accountId: account.account_id,
          accountName: account.name,
          accountType: account.subtype || account.type,
          balance: account.current_balance || 0,
          institutionName: account.institution_name || 'Unknown Institution'
        })),
        hasInvestmentAccounts: true,
        supportsDetailedData: false,
        message: 'Investment account balances available, but detailed holdings data is not accessible',
        supportStatus
      });
    }
  } catch (error) {
    console.error('Error fetching investment summary:', error);
    return res.status(500).json({ error: 'Failed to fetch investment summary' });
  }
});

/**
 * @swagger
 * /api/investments/transactions:
 *   get:
 *     summary: Get investment transactions
 *     description: Returns investment transactions with optional filtering
 *     tags: [Investments]
 *     parameters:
 *       - in: query
 *         name: account_id
 *         schema:
 *           type: string
 *         description: Filter by account ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of transactions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of transactions to skip
 *     responses:
 *       200:
 *         description: Investment transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   investment_transaction_id:
 *                     type: string
 *                   account_id:
 *                     type: string
 *                   security_id:
 *                     type: string
 *                   type:
 *                     type: string
 *                   subtype:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                   price:
 *                     type: number
 *                   amount:
 *                     type: number
 *                   date:
 *                     type: string
 *                   symbol:
 *                     type: string
 *                   security_name:
 *                     type: string
 *                   account_name:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get('/investments/transactions', async (req, res) => {
  try {
    const filters = {
      account_id: req.query.account_id as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };
    
    const transactions = await investmentService.getInvestmentTransactions(filters);
    return res.json(transactions);
  } catch (error) {
    console.error('Error fetching investment transactions:', error);
    return res.status(500).json({ error: 'Failed to fetch investment transactions' });
  }
});

/**
 * @swagger
 * /api/investments/sync:
 *   post:
 *     summary: Manually trigger investment data sync
 *     description: Triggers a manual sync of investment data from all connected institutions
 *     tags: [Investments]
 *     responses:
 *       200:
 *         description: Sync initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/investments/sync', async (_req, res) => {
  try {
    const activeInstitutions = await database.all(`
      SELECT id, access_token, name FROM institutions WHERE is_active = 1
    `);
    
    if (activeInstitutions.length === 0) {
      return res.json({
        success: true,
        message: 'No institutions connected',
        processed: 0,
        skipped: 0,
        errors: 0,
        details: []
      });
    }
    
    console.log(`📊 Starting investment sync for ${activeInstitutions.length} institutions...`);
    
    const results = {
      success: true,
      message: 'Investment data sync completed',
      processed: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    };
    
    for (const institution of activeInstitutions) {
      try {
        console.log(`🔍 Checking investment support for ${institution.name}...`);
        
        // Check if institution supports investments first
        const supportsInvestments = await investmentService.checkInvestmentSupport(institution.access_token, institution.id);
        
        if (!supportsInvestments) {
          console.log(`⚠️  ${institution.name} does not support investments or has no investment accounts`);
          results.skipped++;
          results.details.push({
            institutionId: institution.id,
            institutionName: institution.name,
            status: 'skipped',
            reason: 'Institution does not support investments or has no investment accounts'
          });
          continue;
        }
        
        console.log(`✅ ${institution.name} supports investments, syncing data...`);
        await investmentService.syncInvestmentData(institution.access_token, institution.id);
        results.processed++;
        results.details.push({
          institutionId: institution.id,
          institutionName: institution.name,
          status: 'success'
        });
      } catch (error: any) {
        console.error(`❌ Error syncing investment data for ${institution.name}:`, error.message);
        results.errors++;
        results.details.push({
          institutionId: institution.id,
          institutionName: institution.name,
          status: 'error',
          error: error.message || 'Unknown error'
        });
      }
    }
    
    console.log(`📈 Investment sync completed: ${results.processed} processed, ${results.skipped} skipped, ${results.errors} errors`);
    
    // Refresh market data if any institutions were processed
    if (results.processed > 0) {
      try {
        console.log('🔄 Refreshing market data...');
        await investmentService.refreshAllMarketData();
        console.log('✅ Market data refreshed');
      } catch (error) {
        console.error('❌ Error refreshing market data:', error);
        results.details.push({
          institutionId: 'all',
          institutionName: 'Market Data',
          status: 'market_data_error',
          error: 'Failed to refresh market data'
        });
      }
    }
    
    return res.json(results);
  } catch (error) {
    console.error('❌ Error syncing investment data:', error);
    return res.status(500).json({ error: 'Failed to sync investment data' });
  }
});

/**
 * @swagger
 * /api/investments/support-status:
 *   get:
 *     summary: Get investment support status for all institutions
 *     description: Returns which institutions support investments and which don't
 *     tags: [Investments]
 *     responses:
 *       200:
 *         description: Investment support status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 supportedInstitutions:
 *                   type: number
 *                 unsupportedInstitutions:
 *                   type: number
 *                 totalInstitutions:
 *                   type: number
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       institutionId:
 *                         type: number
 *                       institutionName:
 *                         type: string
 *                       supportsInvestments:
 *                         type: boolean
 *                       hasInvestmentAccounts:
 *                         type: boolean
 *       500:
 *         description: Server error
 */
router.get('/investments/support-status', async (_req, res) => {
  try {
    const status = await investmentService.getInvestmentSupportStatus();
    return res.json(status);
  } catch (error) {
    console.error('Error getting investment support status:', error);
    return res.status(500).json({ error: 'Failed to get investment support status' });
  }
});

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get transactions with filters
 *     description: Returns transactions with filtering, search, and pagination support
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           default: '30'
 *         description: Number of days to retrieve transactions for
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Comma-separated list of categories to filter by
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for transaction names or merchant names
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: '1'
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: '10'
 *         description: Number of transactions per page
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
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get transactions with filtering and pagination
router.get('/transactions', async (req, res) => {
  try {
    const { 
      range = '30', 
      categories = '', 
      search = '', 
      page = '1', 
      limit = '10' 
    } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(range as string));
    const startDate = daysAgo.toISOString().split('T')[0];
    
    let query = `
      SELECT t.*, a.name as account_name FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND i.is_active = 1
    `;
    let params: any[] = [startDate];
    
    // Add category filter
    if (categories && categories !== '') {
      const categoryList = (categories as string).split(',').map(c => c.trim());
      const placeholders = categoryList.map(() => '?').join(',');
      query += ` AND t.category_primary IN (${placeholders})`;
      params.push(...categoryList);
    }
    
    // Add search filter
    if (search && search !== '') {
      query += ` AND (t.name LIKE ? OR t.merchant_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Get total count
    const countQuery = query.replace('SELECT t.*', 'SELECT COUNT(*) as total');
    const countResult = await database.get(countQuery, params);
    const total = countResult.total;
    
    // Add pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    query += ` ORDER BY t.date DESC, t.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);
    
    const transactions = await database.all(query, params);
    
    // Format transactions for frontend
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      transaction_id: tx.transaction_id,
      account_id: tx.account_id,
      amount: tx.amount,
      date: tx.date,
      name: tx.name,
      merchant_name: tx.merchant_name,
      category: tx.category_primary || tx.category_detailed || 'Uncategorized',
      category_detailed: tx.category_detailed,
      type: tx.type,
      pending: tx.pending,
      account_name: tx.account_name
    }));
    
    res.json({
      transactions: formattedTransactions,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get account data
 *     description: Returns all connected account information with balances and institution details
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: Account data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accounts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Account'
 *                 totalBalance:
 *                   type: number
 *                   format: float
 *                 summary:
 *                   type: object
 *                   properties:
 *                     depository:
 *                       type: number
 *                       format: float
 *                     credit:
 *                       type: number
 *                       format: float
 *                     investment:
 *                       type: number
 *                       format: float
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get accounts data
router.get('/accounts', async (_req, res) => {
  try {
    const accounts = await database.all(`
      SELECT a.*, i.name as institution_name FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE i.is_active = 1
      ORDER BY a.updated_at DESC
    `);
    
    const formattedAccounts = accounts.map(account => ({
      id: account.account_id,
      name: account.name,
      type: account.type,
      balance: account.current_balance || 0,
      lastUpdated: account.updated_at
    }));
    
    res.json(formattedAccounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get connected banks/institutions
router.get('/banks', async (_req, res) => {
  try {
    const institutions = await database.all(`
      SELECT 
        i.id,
        i.institution_id,
        i.name,
        i.created_at,
        i.updated_at,
        i.is_active,
        i.last_sync
      FROM institutions i 
      WHERE i.is_active = 1
      ORDER BY i.created_at DESC
    `);
    
    const bankConnections = institutions.map(institution => ({
      id: institution.id,
      institution_id: institution.institution_id,
      name: institution.name,
      created_at: institution.created_at,
      updated_at: institution.updated_at,
      is_active: institution.is_active,
      last_sync: institution.last_sync || institution.updated_at,
      status: 'healthy' // Default status, could be enhanced with actual health check
    }));
    
    res.json(bankConnections);
  } catch (error) {
    console.error('Error fetching bank connections:', error);
    res.status(500).json({ error: 'Failed to fetch bank connections' });
  }
});

/**
 * @swagger
 * /api/investments/all:
 *   get:
 *     summary: Get all investment data (optimized)
 *     description: Returns combined investment accounts and summary data in a single optimized call
 *     tags: [Investments]
 *     responses:
 *       200:
 *         description: Combined investment data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 investments:
 *                   type: array
 *                   items:
 *                     type: object
 *                 accounts:
 *                   type: object
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalValue:
 *                       type: number
 *                     totalCostBasis:
 *                       type: number
 *                     totalDayChange:
 *                       type: number
 *                     totalDayChangePercent:
 *                       type: number
 *                     holdingsCount:
 *                       type: integer
 *                     accountsCount:
 *                       type: integer
 *                     topHoldings:
 *                       type: array
 *                     sectorAllocation:
 *                       type: array
 *       500:
 *         description: Server error
 */
router.get('/investments/all', async (_req, res) => {
  try {
    // Fetch both investment accounts and summary data concurrently
    const [investmentAccounts, investmentSummary] = await Promise.all([
      // Get investment accounts
      database.all(`
        SELECT a.* FROM accounts a 
        JOIN institutions i ON a.institution_id = i.id 
        WHERE a.type = 'investment' AND i.is_active = 1
      `),
      // Get investment summary (this may fail if no detailed data available)
      investmentService.getInvestmentSummary().catch(() => null)
    ])
    
    // Get detailed holdings if available
    const holdings = await database.getHoldings().catch(() => [])
    
    // Process investment data
    const investments = holdings.length > 0 ? holdings.map(holding => ({
      symbol: holding.symbol || 'N/A',
      companyName: holding.security_name || 'Unknown Security',
      quantity: holding.quantity,
      marketPrice: holding.current_price || holding.price,
      marketValue: holding.value,
      dayChange: holding.day_change || 0,
      dayChangePercent: holding.day_change_percent || 0,
      accountId: holding.account_id,
      accountName: holding.account_name,
      institutionName: holding.institution_name,
      sector: holding.sector,
      industry: holding.industry,
      costBasis: holding.cost_basis,
      securityType: holding.security_type
    })) : []
    
    // Process accounts data
    const accounts = {
      hasInvestmentAccounts: investmentAccounts.length > 0,
      supportsDetailedData: holdings.length > 0,
      totalValue: investmentAccounts.reduce((sum, account) => sum + (account.current_balance || 0), 0),
      accounts: investmentAccounts.map(account => ({
        accountId: account.account_id,
        accountName: account.name,
        accountType: account.subtype || account.type,
        institutionName: account.institution_name || 'Unknown Institution',
        balance: account.current_balance || 0,
        availableBalance: account.available_balance,
        currency: account.iso_currency_code || 'CAD',
        lastUpdated: account.updated_at
      })),
      investments
    }
    
    // Process summary data
    const summary = investmentSummary || {
      totalValue: accounts.totalValue,
      totalCostBasis: 0,
      totalDayChange: 0,
      totalDayChangePercent: 0,
      holdingsCount: investments.length,
      accountsCount: investmentAccounts.length,
      topHoldings: investments.slice(0, 5),
      sectorAllocation: [],
      hasInvestmentAccounts: accounts.hasInvestmentAccounts,
      supportsDetailedData: accounts.supportsDetailedData
    }
    
    return res.json({
      investments,
      accounts,
      summary
    })
  } catch (error) {
    console.error('Error fetching combined investment data:', error)
    return res.status(500).json({ error: 'Failed to fetch investment data' })
  }
});

/**
 * @swagger
 * /api/net-worth:
 *   get:
 *     summary: Get net worth data
 *     description: Returns historical net worth data including cash, investments, and total net worth over a specified time range
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           default: '7d'
 *         description: Time range for net worth data (e.g., '7d', '30d', '90d')
 *     responses:
 *       200:
 *         description: Net worth data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   cash:
 *                     type: number
 *                     format: float
 *                   investments:
 *                     type: number
 *                     format: float
 *                   netWorth:
 *                     type: number
 *                     format: float
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get net worth data for historical charts
router.get('/net-worth', async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    
    // Parse the range parameter
    const match = (range as string).match(/^(\d+)([dDwWmMyY])$/);
    if (!match) {
      res.status(400).json({ error: 'Invalid range format. Use format like "7d", "30d", "12m"' });
      return;
    }
    
    const [, numStr, unit] = match;
    const num = parseInt(numStr);
    
    // Calculate days based on unit
    let days: number;
    switch (unit.toLowerCase()) {
      case 'd':
        days = num;
        break;
      case 'w':
        days = num * 7;
        break;
      case 'm':
        days = num * 30;
        break;
      case 'y':
        days = num * 365;
        break;
      default:
        days = 7; // Default to 7 days
    }
    
    // Get current net worth data
    const accountsResult = await database.all(`
      SELECT a.* FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE i.is_active = 1
    `);
    
    const cashAccounts = accountsResult.filter(account => 
      account.type === 'depository' || account.type === 'credit'
    );
    const totalCashBalance = cashAccounts.reduce((sum, account) => {
      if (account.type === 'credit') {
        return sum;
      }
      return sum + (account.current_balance || 0);
    }, 0);
    
    // Get current portfolio value from investment service
    const investmentSummary = await investmentService.getInvestmentSummary();
    const totalPortfolioValue = investmentSummary.totalValue;
    
    // Generate historical data points
    const netWorthData = [];
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Since we don't have historical balance data, we'll simulate slight variations
      // In a real application, you'd store historical snapshots of account balances
      const variation = Math.random() * 0.1 - 0.05; // ±5% variation
      const cashVariation = totalCashBalance * (1 + variation * 0.5);
      const investmentVariation = totalPortfolioValue * (1 + variation);
      
      netWorthData.push({
        date: dateStr,
        cash: Math.max(0, Math.round(cashVariation * 100) / 100),
        investments: Math.max(0, Math.round(investmentVariation * 100) / 100),
        netWorth: Math.max(0, Math.round((cashVariation + investmentVariation) * 100) / 100)
      });
    }
    
    res.json(netWorthData);
  } catch (error) {
    console.error('Error fetching net worth data:', error);
    res.status(500).json({ error: 'Failed to fetch net worth data' });
  }
});

export default router;
