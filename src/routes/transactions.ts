import { Router } from 'express';
import { bankService } from '../services/bankService';
import { schedulerService } from '../services/schedulerService';
import { database } from '../database';

const router = Router();

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

// Get all connected banks
router.get('/connected_banks', async (req, res) => {
  try {
    const banks = await bankService.getConnectedBanks();
    res.json({ banks });
  } catch (err) {
    console.error('getConnectedBanks error:', err);
    res.status(500).json({ error: 'Failed to fetch connected banks' });
  }
});

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

// Check connection health
router.get('/health_check', async (req, res) => {
  try {
    const health = await bankService.checkConnectionHealth();
    res.json(health);
  } catch (err) {
    console.error('healthCheck error:', err);
    res.status(500).json({ error: 'Failed to check connection health' });
  }
});

// Manual sync trigger
router.post('/sync', async (req, res) => {
  try {
    await schedulerService.triggerTransactionSync();
    res.json({ success: true, message: 'Sync completed' });
  } catch (err) {
    console.error('manualSync error:', err);
    res.status(500).json({ error: 'Failed to sync transactions' });
  }
});

// Get scheduler status
router.get('/scheduler_status', (req, res) => {
  try {
    const status = schedulerService.getJobStatus();
    res.json(status);
  } catch (err) {
    console.error('schedulerStatus error:', err);
    res.status(500).json({ error: 'Failed to get scheduler status' });
  }
});

export default router;
