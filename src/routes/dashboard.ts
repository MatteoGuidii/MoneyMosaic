import express from 'express';
import { getOverview } from '../controllers/dashboard/overview.controller';
import { 
  getSpendingData, 
  getSpendingByCategory, 
  getMonthlySpendingComparison, 
  getTopMerchants 
} from '../controllers/dashboard/spending.controller';
import { 
  getFinancialHealth, 
  getCashFlowAnalysis, 
  getSpendingTrends 
} from '../controllers/dashboard/analytics.controller';
import { getEarnings } from '../controllers/dashboard/overview.controller';

const router = express.Router();

// Overview routes
router.get('/overview', getOverview);
router.get('/earnings', getEarnings);

// Spending routes
router.get('/spending-data', getSpendingData);
router.get('/spending-by-category', getSpendingByCategory);
router.get('/monthly-spending-comparison', getMonthlySpendingComparison);
router.get('/top-merchants', getTopMerchants);

// Analytics routes
router.get('/financial-health', getFinancialHealth);
router.get('/cash-flow-analysis', getCashFlowAnalysis);
router.get('/spending-trends', getSpendingTrends);

export { router as dashboardRouter };
