import { Router } from 'express';
import { 
  getInvestments, 
  getInvestmentSummary, 
  getInvestmentAccounts, 
  getInvestmentTransactions,
  getInvestmentDashboard 
} from '../controllers/investment/investment.controller';

const router = Router();

// Investment data routes
router.get('/', getInvestments);
router.get('/summary', getInvestmentSummary);
router.get('/accounts', getInvestmentAccounts);
router.get('/transactions', getInvestmentTransactions);
router.get('/dashboard', getInvestmentDashboard);

export default router;
