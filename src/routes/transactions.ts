import { Router } from 'express';
import { bankService } from '../services/bank.service';
import { schedulerService } from '../services/scheduler.service';
import { database } from '../database';

const router = Router();

/**
 * @swagger
 * /api/transactions/fetch:
 *   post:
 *     summary: Fetch transactions for all connected banks
 *     description: Fetches transactions from all connected banks for the specified number of days
 *     tags: [Transactions]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 default: 30
 *                 description: Number of days to fetch transactions for
 *     responses:
 *       200:
 *         description: Transactions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 transactionCount:
 *                   type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Fetch transactions for all connected banks
router.post('/fetch', async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const result = await bankService.fetchAllTransactions(days);
    res.json(result);
  } catch (err) {
    console.error('fetchTransactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * @swagger
 * /api/transactions/connected_banks:
 *   get:
 *     summary: Get all connected banks
 *     description: Returns a list of all connected bank institutions
 *     tags: [Bank Management]
 *     responses:
 *       200:
 *         description: Connected banks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 banks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Institution'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get all connected banks
router.get('/connected_banks', async (_req, res) => {
  try {
    const banks = await bankService.getConnectedBanks();
    res.json({ banks });
  } catch (err) {
    console.error('getConnectedBanks error:', err);
    res.status(500).json({ error: 'Failed to fetch connected banks' });
  }
});

/**
 * @swagger
 * /api/transactions/banks/{institutionId}:
 *   delete:
 *     summary: Remove bank connection
 *     description: Removes a bank connection and all associated data
 *     tags: [Bank Management]
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         description: Institution ID to remove
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bank connection removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Remove a bank connection
router.delete('/banks/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    await bankService.removeBankConnection(parseInt(institutionId));
    res.json({ success: true });
  } catch (err) {
    console.error('removeBankConnection error:', err);
    res.status(500).json({ error: 'Failed to remove bank connection' });
  }
});

/**
 * @swagger
 * /api/transactions/health_check:
 *   get:
 *     summary: Check connection health
 *     description: Checks the health status of all connected bank institutions
 *     tags: [Bank Management]
 *     responses:
 *       200:
 *         description: Connection health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overallHealth:
 *                   type: string
 *                   enum: [healthy, warning, error]
 *                 institutions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       lastSync:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Check connection health
router.get('/health_check', async (_req, res) => {
  try {
    const health = await bankService.checkConnectionHealth();
    res.json(health);
  } catch (err) {
    console.error('healthCheck error:', err);
    res.status(500).json({ error: 'Failed to check connection health' });
  }
});

/**
 * @swagger
 * /api/transactions/sync:
 *   post:
 *     summary: Manual sync trigger
 *     description: Triggers a manual synchronization of all connected bank transactions
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Sync completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Manual sync trigger
router.post('/sync', async (_req, res) => {
  try {
    await schedulerService.triggerTransactionSync();
    res.json({ success: true, message: 'Sync completed' });
  } catch (err) {
    console.error('manualSync error:', err);
    res.status(500).json({ error: 'Failed to sync transactions' });
  }
});

// Get scheduler status
router.get('/scheduler_status', (_req, res) => {
  try {
    const status = schedulerService.getJobStatus();
    res.json(status);
  } catch (err) {
    console.error('schedulerStatus error:', err);
    res.status(500).json({ error: 'Failed to get scheduler status' });
  }
});

/**
 * @swagger
 * /api/transactions/fetch-historical:
 *   post:
 *     summary: Fetch historical transactions from a specific start date
 *     description: Fetches historical transactions using the legacy Plaid endpoint to get older data
 *     tags: [Transactions]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 default: '2024-01-01'
 *                 description: Start date for historical transaction fetch (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Historical transactions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 transactionCount:
 *                   type: integer
 *       500:
 *         description: Server error
 */
// Fetch historical transactions from a specific start date
router.post('/fetch-historical', async (req, res) => {
  try {
    const { startDate = '2024-01-01' } = req.body;
    console.log(`🔄 Starting historical transaction fetch from ${startDate}...`);
    
    // Get all active institutions
    const institutions = await database.getInstitutions();
    
    if (institutions.length === 0) {
      return res.json({
        success: true,
        message: 'No institutions connected',
        transactionCount: 0
      });
    }

    let totalTransactions = 0;
    
    for (const institution of institutions) {
      try {
        const transactions = await bankService.fetchHistoricalTransactions(
          institution.access_token,
          institution.id,
          startDate
        );
        totalTransactions += transactions.length;
        console.log(`✅ Fetched ${transactions.length} historical transactions for ${institution.name}`);
      } catch (error) {
        console.error(`❌ Error fetching historical transactions for ${institution.name}:`, error);
      }
    }

    return res.json({
      success: true,
      message: `Historical transaction fetch completed. Fetched ${totalTransactions} transactions from ${startDate}`,
      transactionCount: totalTransactions
    });
  } catch (error) {
    console.error('Error fetching historical transactions:', error);
    return res.status(500).json({ error: 'Failed to fetch historical transactions' });
  }
});

/**
 * @swagger
 * /api/transactions/date-range:
 *   get:
 *     summary: Check available transaction date ranges
 *     description: Checks the available transaction date ranges for all connected bank institutions
 *     tags: [Bank Management]
 *     responses:
 *       200:
 *         description: Available transaction date ranges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 institutions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       institutionId:
 *                         type: integer
 *                       institutionName:
 *                         type: string
 *                       earliestDate:
 *                         type: string
 *                         format: date
 *                       latestDate:
 *                         type: string
 *                         format: date
 *                       availableTransactionCount:
 *                         type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Check available transaction date range for all institutions
router.get('/date-range', async (_req, res) => {
  try {
    const institutions = await database.getInstitutions();
    
    if (institutions.length === 0) {
      return res.json({
        success: true,
        message: 'No institutions connected',
        institutions: []
      });
    }

    const results = [];
    
    for (const institution of institutions) {
      try {
        const dateRange = await bankService.checkTransactionDateRange(
          institution.access_token,
          institution.id
        );
        
        results.push({
          institutionId: institution.id,
          institutionName: institution.name,
          ...dateRange
        });
      } catch (error) {
        console.error(`Error checking date range for ${institution.name}:`, error);
        results.push({
          institutionId: institution.id,
          institutionName: institution.name,
          earliestDate: null,
          latestDate: null,
          availableTransactionCount: 0,
          error: 'Failed to check date range'
        });
      }
    }

    return res.json({
      success: true,
      institutions: results
    });
  } catch (error) {
    console.error('Error checking transaction date ranges:', error);
    return res.status(500).json({ error: 'Failed to check transaction date ranges' });
  }
});

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions with optional filtering
 *     description: Retrieve transactions with advanced filtering capabilities including date range, category, merchant, amount, and search term
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: merchant
 *         schema:
 *           type: string
 *         description: Filter by merchant name
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Minimum amount filter
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Maximum amount filter
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filter by transaction type
 *       - in: query
 *         name: includePending
 *         schema:
 *           type: boolean
 *         description: Include pending transactions
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or merchant
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of transactions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of transactions to skip
 *     responses:
 *       200:
 *         description: Filtered transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 total:
 *                   type: integer
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalExpenses:
 *                       type: number
 *                     totalIncome:
 *                       type: number
 *                     netCashFlow:
 *                       type: number
 *                     transactionCount:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      category: req.query.category as string,
      merchant: req.query.merchant as string,
      minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
      maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
      type: req.query.type as 'income' | 'expense' | undefined,
      includePending: req.query.includePending === 'true',
      search: req.query.search as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };

    const result = await bankService.getFilteredTransactions(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching filtered transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * @swagger
 * /api/transactions/trends:
 *   get:
 *     summary: Get spending trends and analysis
 *     description: Retrieve comprehensive spending trend analysis including weekly, monthly, category, and merchant trends
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Number of days to analyze
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Specific categories to analyze
 *     responses:
 *       200:
 *         description: Trend analysis retrieved successfully
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
 *                 monthlyTrends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       amount:
 *                         type: number
 *                 categoryTrends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       trend:
 *                         type: string
 *                         enum: [increasing, decreasing, stable]
 *                       changePercent:
 *                         type: number
 *                 topMerchants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       frequency:
 *                         type: integer
 *       500:
 *         description: Server error
 */
router.get('/trends', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 90;

    const trends = await bankService.getSpendingTrends(days);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching spending trends:', error);
    res.status(500).json({ error: 'Failed to fetch spending trends' });
  }
});

/**
 * @swagger
 * /api/transactions/insights:
 *   get:
 *     summary: Get budget insights and recommendations
 *     description: Retrieve personalized budget insights including category spending analysis, unusual spending detection, and savings opportunities
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Specific categories to analyze
 *     responses:
 *       200:
 *         description: Budget insights retrieved successfully
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
 *                       spent:
 *                         type: number
 *                       avgMonthly:
 *                         type: number
 *                       recommendation:
 *                         type: string
 *                 unusualSpending:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       merchant:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       date:
 *                         type: string
 *                       reason:
 *                         type: string
 *                 savingsOpportunities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       potentialSavings:
 *                         type: number
 *                       suggestion:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/insights', async (_req, res) => {
  try {
    const insights = await bankService.getBudgetInsights();
    res.json(insights);
  } catch (error) {
    console.error('Error fetching budget insights:', error);
    res.status(500).json({ error: 'Failed to fetch budget insights' });
  }
});

/**
 * @swagger
 * /api/transactions/summary:
 *   get:
 *     summary: Get transaction summary with advanced metrics
 *     description: Retrieve comprehensive transaction summary including spending patterns, category breakdowns, and financial health metrics
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: Time period for summary
 *       - in: query
 *         name: compareWithPrevious
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include comparison with previous period
 *     responses:
 *       200:
 *         description: Transaction summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                     totalExpenses:
 *                       type: number
 *                     netCashFlow:
 *                       type: number
 *                     transactionCount:
 *                       type: integer
 *                     avgTransactionAmount:
 *                       type: number
 *                     topExpenseCategory:
 *                       type: string
 *                     savingsRate:
 *                       type: number
 *                 categoryBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       percentage:
 *                         type: number
 *                       transactionCount:
 *                         type: integer
 *                 comparison:
 *                   type: object
 *                   properties:
 *                     previousPeriod:
 *                       type: object
 *                     changes:
 *                       type: object
 *       500:
 *         description: Server error
 */
router.get('/summary', async (req, res) => {
  try {
    const period = req.query.period as string || 'month';
    const compareWithPrevious = req.query.compareWithPrevious === 'true';

    const summary = await bankService.getAdvancedTransactionSummary(period, compareWithPrevious);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    res.status(500).json({ error: 'Failed to fetch transaction summary' });
  }
});

/**
 * @swagger
 * /api/transactions/categories/{category}/analysis:
 *   get:
 *     summary: Get detailed analysis for a specific category
 *     description: Retrieve detailed spending analysis for a specific category including trends, merchants, and patterns
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         description: Category to analyze
 *         schema:
 *           type: string
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
 *                 avgPerTransaction:
 *                   type: number
 *                 trend:
 *                   type: string
 *                   enum: [increasing, decreasing, stable]
 *                 topMerchants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       frequency:
 *                         type: integer
 *                 monthlyBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       amount:
 *                         type: number
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get('/categories/:category/analysis', async (req, res) => {
  try {
    const { category } = req.params;
    const days = req.query.days ? parseInt(req.query.days as string) : 90;

    const analysis = await bankService.getCategoryAnalysis(category, days);
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching category analysis:', error);
    res.status(500).json({ error: 'Failed to fetch category analysis' });
  }
});

/**
 * @swagger
 * /api/transactions/alerts:
 *   get:
 *     summary: Get spending alerts and notifications
 *     description: Retrieve personalized spending alerts including budget overruns, unusual spending patterns, and bill reminders
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Spending alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 budgetAlerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       budgetAmount:
 *                         type: number
 *                       currentSpending:
 *                         type: number
 *                       percentageUsed:
 *                         type: number
 *                       severity:
 *                         type: string
 *                         enum: [low, medium, high]
 *                       message:
 *                         type: string
 *                 spendingAlerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       message:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       date:
 *                         type: string
 *                       severity:
 *                         type: string
 *                 recurringPayments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       merchant:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       frequency:
 *                         type: string
 *                       nextExpectedDate:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/alerts', async (_req, res) => {
  try {
    const alerts = await bankService.getSpendingAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching spending alerts:', error);
    res.status(500).json({ error: 'Failed to fetch spending alerts' });
  }
});

export default router;
