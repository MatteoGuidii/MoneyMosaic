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

export default router;
