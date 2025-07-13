import { Router } from 'express';
import { 
  getConnectedBanks, 
  deleteBankConnection, 
  getHealthCheck, 
  syncTransactions, 
  getSchedulerStatus 
} from '../controllers/transactions/banks.controller';
import { 
  fetchTransactions, 
  fetchHistoricalTransactions 
} from '../controllers/transactions/fetch.controller';
import { 
  getDateRange, 
  getTransactions, 
  getTransactionSummary 
} from '../controllers/transactions/data.controller';
import { 
  getTrends, 
  getInsights, 
  getCategoryAnalysis, 
  getAlerts 
} from '../controllers/transactions/analytics.controller';

const router = Router();

// Bank management routes
router.get('/connected_banks', getConnectedBanks);
router.delete('/banks/:institutionId', deleteBankConnection);
router.get('/health_check', getHealthCheck);
router.post('/sync', syncTransactions);
router.get('/scheduler_status', getSchedulerStatus);

// Transaction fetching routes
router.post('/fetch', fetchTransactions);
router.post('/fetch-historical', fetchHistoricalTransactions);

// Transaction data routes
router.get('/date-range', getDateRange);
router.get('/', getTransactions);
router.get('/summary', getTransactionSummary);

// Analytics routes
router.get('/trends', getTrends);
router.get('/insights', getInsights);
router.get('/categories/:category/analysis', getCategoryAnalysis);
router.get('/alerts', getAlerts);

export default router;
