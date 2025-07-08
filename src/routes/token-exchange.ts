import { Router } from 'express';
import { bankService } from '../services/bank.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/token/exchange:
 *   post:
 *     summary: Exchange public token for access token
 *     description: Exchange a Plaid public_token for an access_token and save bank connection to database
 *     tags: [Bank Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenExchangeRequest'
 *     responses:
 *       200:
 *         description: Token exchange successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenExchangeResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * Exchange a Plaid public_token for an access_token and save to database
 * @route POST /api/token/exchange
 * @access Public
 * @description Exchange public token for access token and save bank connection
 * 
 * ⚠️  CRITICAL PLAID ENDPOINT - DO NOT REMOVE
 * This endpoint implements Plaid's /item/public_token/exchange API.
 * Required for converting temporary public_tokens to permanent access_tokens.
 * Removing this will break bank account linking functionality.
 */
router.post('/token/exchange', async (req, res) => {
  try {
    const { public_token, institution } = req.body;
    
    const result = await bankService.addBankConnection({
      public_token,
      institution
    });
    
    res.json(result);
  } catch (err) {
    logger.error('exchangePublicToken error:', err);
    res.status(500).json({ error: 'Failed to exchange public token' });
  }
});

export default router;