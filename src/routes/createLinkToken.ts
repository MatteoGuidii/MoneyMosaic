import { Router } from 'express';
import { plaidClient } from '../plaidClient';
import { Products, CountryCode } from 'plaid';

const router = Router();

/**
 * Create a Link Token for initializing Plaid Link
 * See: POST /link/token/create (Sandbox) https://plaid.com/docs/api/sandbox/
 */
router.post('/create_link_token', async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      client_name: 'FinTracker',
      user: { client_user_id: 'unique-user-id' },
      products: [Products.Transactions],
      country_codes: [CountryCode.Ca],
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
      redirect_uri: process.env.PLAID_REDIRECT_URI
    });
    res.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error('createLinkToken error:', err);
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

export default router;