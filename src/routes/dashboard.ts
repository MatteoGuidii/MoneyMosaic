import express from 'express';
import { database } from '../database';

const router = express.Router();

// Get overview data for dashboard
router.get('/overview', async (req, res) => {
  try {
    // Get total cash balance from accounts belonging to active institutions only
    const accountsResult = await database.all(`
      SELECT a.* FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE i.is_active = 1
    `);
    const totalCashBalance = accountsResult.reduce((sum, account) => sum + (account.current_balance || 0), 0);
    
    // Get today's transactions for net flow (only from active institutions)
    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = await database.all(`
      SELECT t.* FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date = ? AND i.is_active = 1
    `, [today]);
    const todayNetFlow = todaysTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Portfolio value should be 0 since we don't have investment data from Plaid
    const totalPortfolioValue = 0;
    
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

// Get earnings summary
router.get('/earnings', async (req, res) => {
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
router.get('/categories', async (req, res) => {
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

// Get investments data
router.get('/investments', async (req, res) => {
  try {
    // Check if there are any active banks connected
    const activeAccounts = await database.all(`
      SELECT a.* FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE i.is_active = 1
    `);
    
    // If no banks are connected, return empty investments
    if (activeAccounts.length === 0) {
      return res.json([]);
    }
    
    // For now, return empty array since we don't have investment data from Plaid
    // In a real implementation, you would integrate with a trading API
    res.json([]);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments data' });
  }
});

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

// Get accounts data
router.get('/accounts', async (req, res) => {
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

export default router;
