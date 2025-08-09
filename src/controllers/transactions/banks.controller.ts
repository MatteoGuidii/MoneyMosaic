import { Request, Response } from 'express';
import { schedulerService } from '../../services/scheduler.service';
import { database } from '../../database';
import { logger } from '../../utils/logger';

/**
 * @swagger
 * /api/transactions/connected_banks:
 *   get:
 *     summary: Get connected banks
 *     description: Returns all connected banks with their status
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Connected banks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connectedBanks:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
export const getConnectedBanks = async (_req: Request, res: Response) => {
  try {
    const institutions = await database.all(`
      SELECT 
        id,
        name,
        is_active,
        created_at,
        updated_at
      FROM institutions 
      WHERE is_active = 1
      ORDER BY created_at DESC
    `);
    
    // Get account count for each institution
    const connectedBanks = await Promise.all(
      institutions.map(async (institution) => {
        const accountCount = await database.get(
          'SELECT COUNT(*) as count FROM accounts WHERE institution_id = ?',
          [institution.id]
        );
        
        return {
          ...institution,
          accountCount: accountCount.count,
          last_sync: institution.updated_at
        };
      })
    );
    
    res.json({ banks: connectedBanks });
  } catch (error) {
    logger.error('Error fetching connected banks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/transactions/banks/{institutionId}:
 *   delete:
 *     summary: Delete a bank connection
 *     description: Removes a bank connection and all associated data
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The institution ID to delete
 *     responses:
 *       200:
 *         description: Bank connection deleted successfully
 *       500:
 *         description: Server error
 */
export const deleteBankConnection = async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.params;
    
    // Start transaction
    await database.run('BEGIN TRANSACTION');
    
    try {
      // Delete transactions first (foreign key constraint)
      await database.run(`
        DELETE FROM transactions 
        WHERE account_id IN (
          SELECT id FROM accounts WHERE institution_id = ?
        )
      `, [institutionId]);
      
      // Delete accounts
      await database.run(`
        DELETE FROM accounts WHERE institution_id = ?
      `, [institutionId]);
      
      // Delete institution
      await database.run(`
        DELETE FROM institutions WHERE id = ?
      `, [institutionId]);
      
      // Commit transaction
      await database.run('COMMIT');
      
      res.json({ success: true, message: 'Bank connection deleted successfully' });
    } catch (error) {
      // Rollback on error
      await database.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    logger.error('Error deleting bank connection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/transactions/health_check:
 *   get:
 *     summary: Check system health
 *     description: Returns health status of the system
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: System health status
 */
export const getHealthCheck = async (_req: Request, res: Response) => {
  try {
    // Check database connectivity
    await database.get('SELECT 1 as test');
    
    // Get all institutions with their health status
    const institutions = await database.all(`
      SELECT 
        id,
        name,
        is_active,
        updated_at,
        created_at
      FROM institutions 
      WHERE is_active = 1
    `);
    
    const healthy: string[] = [];
    const unhealthy: string[] = [];
    
    institutions.forEach(institution => {
      const lastUpdate = new Date(institution.updated_at);
      const now = new Date();
      const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        healthy.push(institution.name);
      } else {
        unhealthy.push(institution.name);
      }
    });
    
    const overallHealth = unhealthy.length === 0 ? 'healthy' : 
                         healthy.length === 0 ? 'error' : 'warning';
    
    res.json({
      overallHealth,
      healthy,
      unhealthy,
      institutions: institutions.map(inst => ({
        id: String(inst.id),
        name: inst.name,
        status: (() => {
          const lastUpdate = new Date(inst.updated_at);
          const now = new Date();
          const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
          return diffInHours < 24 ? 'healthy' : 'unhealthy';
        })(),
        lastSync: inst.updated_at
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy', 
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @swagger
 * /api/transactions/sync:
 *   post:
 *     summary: Sync transactions
 *     description: Manually trigger transaction sync
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Sync initiated successfully
 */
export const syncTransactions = async (_req: Request, res: Response) => {
  try {
    // Fire-and-forget manual sync to avoid blocking the request
    (async () => {
      try {
        await schedulerService.triggerTransactionSync();
      } catch (err) {
        logger.error('Background sync failed:', err);
      }
    })();
    
    res.json({ 
      success: true, 
      message: 'Transaction sync started',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error initiating sync:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/transactions/scheduler_status:
 *   get:
 *     summary: Get scheduler status
 *     description: Returns the current status of the transaction scheduler
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Scheduler status retrieved successfully
 */
export const getSchedulerStatus = (_req: Request, res: Response) => {
  try {
    const status = schedulerService.getJobStatus();
    
    res.json({
      scheduler: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting scheduler status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
