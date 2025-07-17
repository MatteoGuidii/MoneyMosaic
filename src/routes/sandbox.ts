import { Router } from 'express';
import { plaidClient } from '../plaidClient';
import { database } from '../database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/sandbox/public_token/create:
 *   post:
 *     summary: Create sandbox public token
 *     description: Creates a test public token for sandbox environment testing
 *     tags: [Sandbox]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               institution_id:
 *                 type: string
 *                 description: Plaid institution ID for testing
 *               initial_products:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of products to initialize
 *             required:
 *               - institution_id
 *               - initial_products
 *     responses:
 *       200:
 *         description: Sandbox public token created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 public_token:
 *                   type: string
 *                   description: Test public token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * ⚠️  CRITICAL PLAID SANDBOX ENDPOINT - DO NOT REMOVE
 * Implements Plaid's /sandbox/public_token/create API for testing.
 * This endpoint is required for development and testing environments.
 * Removing this will break sandbox testing functionality.
 */
// Sandbox-only: create a test public_token
router.post('/sandbox/public_token/create', async (req, res) => {
  try {
    const { institution_id, initial_products } = req.body;
    const { data } = await plaidClient.sandboxPublicTokenCreate({
      institution_id,
      initial_products,
    });
    res.json({ public_token: data.public_token });
  } catch (err) {
    logger.error('sandboxPublicTokenCreate error:', err);
    res.status(500).json({ error: 'Sandbox public_token failed' });
  }
});

/**
 * @swagger
 * /api/sandbox/database/clean:
 *   post:
 *     summary: Clean all database data
 *     description: Removes all data from the database while preserving table structure. Useful for sandbox cleanup.
 *     tags: [Sandbox]
 *     responses:
 *       200:
 *         description: Database cleaned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/database/clean', async (_req, res) => {
  try {
    await database.cleanAllData();
    res.json({ message: 'Database cleaned successfully - all data removed' });
  } catch (err) {
    logger.error('Database cleanup error:', err);
    res.status(500).json({ error: 'Failed to clean database' });
  }
});

export default router;
