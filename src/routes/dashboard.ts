import express from 'express';
import { database } from '../database';

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
    
    // Calculate total cash balance (depository accounts plus credit balances)
    const totalCashBalance = cashAccounts.reduce((sum, account) => {
      if (account.type === 'credit') {
        // For credit accounts, balance is negative (debt), so we add it as-is
        // This effectively subtracts the debt from the total
        return sum + (account.current_balance || 0);
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
      
      if (tx.amount < 0) {
        dateGroups[tx.date].spending += Math.abs(tx.amount);
      } else {
        dateGroups[tx.date].income += tx.amount;
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

// Get budget data (generated from spending patterns)
router.get('/budget', async (_req, res) => {
  try {
    // Get current month's spending by category
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];
    
    // Get this month's spending (negative amounts only - expenses)
    const monthlySpending = await database.all(`
      SELECT 
        t.category_primary as category,
        SUM(ABS(t.amount)) as spent
      FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND t.date <= ? 
        AND t.amount < 0 
        AND t.category_primary IS NOT NULL 
        AND i.is_active = 1
      GROUP BY t.category_primary
      ORDER BY spent DESC
    `, [monthStartStr, monthEndStr]);
    
    // Get previous month's spending for budget calculation
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const prevMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    const prevMonthStartStr = prevMonth.toISOString().split('T')[0];
    const prevMonthEndStr = prevMonthEnd.toISOString().split('T')[0];
    
    const prevMonthSpending = await database.all(`
      SELECT 
        t.category_primary as category,
        SUM(ABS(t.amount)) as spent
      FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND t.date <= ? 
        AND t.amount < 0 
        AND t.category_primary IS NOT NULL 
        AND i.is_active = 1
      GROUP BY t.category_primary
    `, [prevMonthStartStr, prevMonthEndStr]);
    
    // Create budget data (using previous month as budget baseline)
    const budgetData = monthlySpending.map(current => {
      const prevData = prevMonthSpending.find(prev => prev.category === current.category);
      const budgeted = prevData ? prevData.spent * 1.1 : current.spent * 1.2; // 10% increase from last month or 20% if no prev data
      const spent = current.spent;
      const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
      
      return {
        category: current.category,
        budgeted: Math.round(budgeted * 100) / 100,
        spent: Math.round(spent * 100) / 100,
        percentage: Math.round(percentage * 100) / 100
      };
    });
    
    // Add categories that had previous spending but no current spending
    prevMonthSpending.forEach(prev => {
      if (!budgetData.find(b => b.category === prev.category)) {
        budgetData.push({
          category: prev.category,
          budgeted: Math.round(prev.spent * 1.1 * 100) / 100,
          spent: 0,
          percentage: 0
        });
      }
    });
    
    res.json(budgetData);
  } catch (error) {
    console.error('Error fetching budget data:', error);
    res.status(500).json({ error: 'Failed to fetch budget data' });
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
    // Get all investment accounts from active institutions
    const activeAccounts = await database.all(`
      SELECT a.*, i.access_token, i.name as institution_name FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE i.is_active = 1 AND a.type = 'investment'
    `);
    
    if (activeAccounts.length === 0) {
      return res.json([]);
    }

    // For now, we'll return mock data based on the investment accounts
    // In a real implementation, you would use Plaid's investments API
    const investments = activeAccounts.map((account, index) => {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NFLX', 'NVDA'];
      const names = [
        'Apple Inc.',
        'Alphabet Inc.',
        'Microsoft Corporation',
        'Tesla Inc.',
        'Amazon.com Inc.',
        'Meta Platforms Inc.',
        'Netflix Inc.',
        'NVIDIA Corporation'
      ];
      
      const symbol = symbols[index % symbols.length];
      const name = names[index % names.length];
      const quantity = Math.floor(Math.random() * 100) + 1;
      const marketPrice = Math.random() * 300 + 50;
      const marketValue = quantity * marketPrice;
      const dayChange = (Math.random() - 0.5) * 20;
      const dayChangePercent = (dayChange / marketPrice) * 100;
      
      return {
        symbol,
        companyName: name,
        quantity,
        marketPrice: Math.round(marketPrice * 100) / 100,
        marketValue: Math.round(marketValue * 100) / 100,
        dayChange: Math.round(dayChange * 100) / 100,
        dayChangePercent: Math.round(dayChangePercent * 100) / 100,
        accountId: account.account_id,
        accountName: account.name
      };
    });

    return res.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    return res.status(500).json({ error: 'Failed to fetch investments data' });
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
      category: tx.category_primary || 'Other',
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

export default router;
