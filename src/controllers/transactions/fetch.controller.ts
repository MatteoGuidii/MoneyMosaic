import { Request, Response } from 'express';
import { bankService } from '../../services/bank.service';
import { database } from '../../database';
import { logger } from '../../utils/logger';

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
 */
export const fetchTransactions = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.body;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all active institutions
    const institutions = await database.all(`
      SELECT * FROM institutions WHERE is_active = 1
    `);
    
    let totalTransactions = 0;
    const results: any[] = [];
    
    for (const institution of institutions) {
      try {
        const accounts = await database.all(`
          SELECT * FROM accounts WHERE institution_id = ?
        `, [institution.id]);
        
        for (const account of accounts) {
          const result = await bankService.fetchAllTransactions(days);
          
          totalTransactions += result.transactions.length;
          results.push({
            institution: institution.name,
            account: account.name,
            transactionCount: result.transactions.length
          });
        }
      } catch (error) {
        logger.error(`Error fetching transactions for ${institution.name}:`, error);
        results.push({
          institution: institution.name,
          error: (error as Error).message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Fetched ${totalTransactions} transactions from ${institutions.length} institutions`,
      transactionCount: totalTransactions,
      results
    });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/transactions/fetch-historical:
 *   post:
 *     summary: Fetch historical transactions
 *     description: Fetches historical transactions for a specific institution and date range
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               institutionId:
 *                 type: string
 *                 description: The institution ID to fetch historical data for
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date for historical data
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date for historical data
 *               count:
 *                 type: integer
 *                 default: 500
 *                 description: Maximum number of transactions to fetch
 *     responses:
 *       200:
 *         description: Historical transactions fetched successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
export const fetchHistoricalTransactions = async (req: Request, res: Response) => {
  try {
    const { institutionId, startDate, endDate, count = 500 } = req.body;
    
    if (!institutionId || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required parameters: institutionId, startDate, endDate' 
      });
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ 
        error: 'Start date must be before end date' 
      });
    }
    
    // Get institution
    const institution = await database.get(`
      SELECT * FROM institutions WHERE id = ? AND is_active = 1
    `, [institutionId]);
    
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found or inactive' });
    }
    
    // Get accounts for this institution
    const accounts = await database.all(`
      SELECT * FROM accounts WHERE institution_id = ?
    `, [institutionId]);
    
    let totalTransactions = 0;
    const results: any[] = [];
    
    for (const account of accounts) {
      try {
        const result = await bankService.fetchAllTransactions(count);
        
        totalTransactions += result.transactions.length;
        results.push({
          accountId: account.id,
          accountName: account.name,
          transactionCount: result.transactions.length
        });
      } catch (error) {
        logger.error(`Error fetching historical transactions for account ${account.name}:`, error);
        results.push({
          accountId: account.id,
          accountName: account.name,
          error: (error as Error).message
        });
      }
    }
    
    return res.json({
      success: true,
      message: `Fetched ${totalTransactions} historical transactions for ${institution.name}`,
      institution: institution.name,
      dateRange: { startDate, endDate },
      transactionCount: totalTransactions,
      results
    });
  } catch (error) {
    logger.error('Error fetching historical transactions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
