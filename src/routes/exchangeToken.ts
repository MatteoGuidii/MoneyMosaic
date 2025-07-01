import { Router } from 'express';
import { bankService } from '../services/bankService';

const router = Router();

/**
 * Exchange a Plaid public_token for an access_token and save to database
 * See: POST /item/public_token/exchange (Sandbox) https://plaid.com/docs/api/sandbox/
 */
router.post('/exchange_public_token', async (req, res) => {
  try {
    const { public_token, institution } = req.body;
    
    const result = await bankService.addBankConnection({
      public_token,
      institution
    });
    
    res.json(result);
  } catch (err) {
    console.error('exchangePublicToken error:', err);
    res.status(500).json({ error: 'Failed to exchange public token' });
  }
});

export default router;