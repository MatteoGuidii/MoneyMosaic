import { Router } from 'express';
import { plaidClient } from '../plaidClient';

const router = Router();

/**
 * Exchange a Plaid public_token for an access_token
 * See: POST /item/public_token/exchange (Sandbox) https://plaid.com/docs/api/sandbox/
 */
router.post('/exchange_public_token', async (req, res) => {
  try {
    const { public_token } = req.body;
    const { data: { access_token, item_id } } = await plaidClient.itemPublicTokenExchange({ public_token });
    // TODO: persist access_token and item_id securely per user
    res.json({ access_token, item_id });
  } catch (err) {
    console.error('exchangePublicToken error:', err);
    res.status(500).json({ error: 'Failed to exchange public token' });
  }
});

export default router;