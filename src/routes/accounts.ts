import { Router } from 'express';
import { database } from '../database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all connected accounts
 *     description: Retrieve all bank accounts from connected institutions
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       500:
 *         description: Server error
 */
router.get('/', async (_req, res) => {
  try {
    const accounts = await database.all(`
      SELECT 
        a.*,
        i.name as institution_name,
        i.institution_id
      FROM accounts a
      JOIN institutions i ON a.institution_id = i.id
      ORDER BY i.name, a.name
    `);

    res.json(accounts);
  } catch (error) {
    logger.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

/**
 * @swagger
 * /api/accounts/{accountId}/nickname:
 *   put:
 *     summary: Update account nickname
 *     description: Update the display nickname for an account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nickname updated successfully
 */
router.put('/:accountId/nickname', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { nickname } = req.body;

    await database.run(
      'UPDATE accounts SET nickname = ? WHERE account_id = ?',
      [nickname, accountId]
    );

    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating account nickname:', error);
    res.status(500).json({ error: 'Failed to update nickname' });
  }
});

/**
 * @swagger
 * /api/accounts/{accountId}/visibility:
 *   put:
 *     summary: Toggle account visibility
 *     description: Show or hide an account from displays
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isVisible:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Visibility updated successfully
 */
router.put('/:accountId/visibility', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { isVisible } = req.body;

    await database.run(
      'UPDATE accounts SET is_visible = ? WHERE account_id = ?',
      [isVisible ? 1 : 0, accountId]
    );

    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating account visibility:', error);
    res.status(500).json({ error: 'Failed to update visibility' });
  }
});

export default router;
