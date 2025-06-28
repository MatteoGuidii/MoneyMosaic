import { Router } from 'express';
import { plaidClient } from '../plaidClient';
const router = Router();

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
    console.error('sandboxPublicTokenCreate error:', err);
    res.status(500).json({ error: 'Sandbox public_token failed' });
  }
});

export default router;
