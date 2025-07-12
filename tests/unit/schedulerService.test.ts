import { SchedulerService } from '../../src/services/scheduler.service';
import { bankService } from '../../src/services/bank.service';
import { investmentService } from '../../src/services/investment.service';
import { logger } from '../../src/utils/logger';
import { database } from '../../src/database';
import * as cron from 'node-cron';

// Mock dependencies
jest.mock('../../src/services/bank.service');
jest.mock('../../src/services/investment.service');
jest.mock('../../src/utils/logger');
jest.mock('../../src/database');
jest.mock('node-cron');

const mockBankService = bankService as jest.Mocked<typeof bankService>;
const mockInvestmentService = investmentService as jest.Mocked<typeof investmentService>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockDatabase = database as jest.Mocked<typeof database>;
const mockCron = cron as jest.Mocked<typeof cron>;

describe('SchedulerService', () => {
  let schedulerService: SchedulerService;
  let mockScheduledTask: any;

  beforeEach(() => {
    jest.clearAllMocks();
    schedulerService = new SchedulerService();
    
    // Mock cron scheduled task
    mockScheduledTask = {
      start: jest.fn(),
      stop: jest.fn(),
      destroy: jest.fn(),
      getStatus: jest.fn().mockReturnValue('scheduled')
    };
    
    mockCron.schedule.mockReturnValue(mockScheduledTask);
  });

  describe('startTransactionSync', () => {
    it('should start transaction sync with default interval', () => {
      schedulerService.startTransactionSync();
      
      expect(mockCron.schedule).toHaveBeenCalledWith(
        '0 */6 * * *',
        expect.any(Function)
      );
      expect(mockLogger.info).toHaveBeenCalledWith('🕒 Transaction sync scheduled every 6 hours');
    });

    it('should start transaction sync with custom interval', () => {
      schedulerService.startTransactionSync(12);
      
      expect(mockCron.schedule).toHaveBeenCalledWith(
        '0 */12 * * *',
        expect.any(Function)
      );
      expect(mockLogger.info).toHaveBeenCalledWith('🕒 Transaction sync scheduled every 12 hours');
    });
  });

  describe('startInvestmentSync', () => {
    it('should start investment sync with default interval', () => {
      schedulerService.startInvestmentSync();
      
      expect(mockCron.schedule).toHaveBeenCalledWith(
        '15 */6 * * *',
        expect.any(Function)
      );
      expect(mockLogger.info).toHaveBeenCalledWith('📈 Investment sync scheduled every 6 hours');
    });
  });

  describe('startMarketDataRefresh', () => {
    it('should start market data refresh with correct cron pattern', () => {
      schedulerService.startMarketDataRefresh();
      
      expect(mockCron.schedule).toHaveBeenCalledWith(
        '*/15 9-16 * * 1-5',
        expect.any(Function)
      );
      expect(mockLogger.info).toHaveBeenCalledWith('📊 Market data refresh scheduled every 15 minutes during market hours');
    });
  });

  describe('startHealthCheck', () => {
    it('should start health check with correct cron pattern', () => {
      schedulerService.startHealthCheck();
      
      expect(mockCron.schedule).toHaveBeenCalledWith(
        '0 0 * * *',
        expect.any(Function)
      );
      expect(mockLogger.info).toHaveBeenCalledWith('🏥 Health check scheduled daily at midnight');
    });
  });

  describe('startAll', () => {
    it('should start all jobs with default interval', () => {
      schedulerService.startAll();
      
      expect(mockCron.schedule).toHaveBeenCalledTimes(4);
      expect(mockLogger.info).toHaveBeenCalledWith('🚀 All background jobs started');
    });

    it('should start all jobs with custom interval', () => {
      schedulerService.startAll(12);
      
      expect(mockCron.schedule).toHaveBeenCalledTimes(4);
      expect(mockLogger.info).toHaveBeenCalledWith('🚀 All background jobs started');
    });
  });

  describe('stopJob', () => {
    it('should stop a specific job', () => {
      schedulerService.startTransactionSync();
      
      schedulerService.stopJob('transaction-sync');
      
      expect(mockScheduledTask.stop).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('⏹️ Stopped job: transaction-sync');
    });

    it('should not error when stopping non-existent job', () => {
      schedulerService.stopJob('non-existent-job');
      
      expect(mockScheduledTask.stop).not.toHaveBeenCalled();
    });
  });

  describe('stopAll', () => {
    it('should stop all jobs', () => {
      schedulerService.startTransactionSync();
      schedulerService.startInvestmentSync();
      
      schedulerService.stopAll();
      
      expect(mockScheduledTask.stop).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith('⏹️ All background jobs stopped');
    });
  });

  describe('getJobStatus', () => {
    it('should return job status', () => {
      schedulerService.startTransactionSync();
      schedulerService.startInvestmentSync();
      
      const status = schedulerService.getJobStatus();
      
      expect(status).toEqual({
        'transaction-sync': true,
        'investment-sync': true
      });
    });

    it('should return empty status when no jobs are running', () => {
      const status = schedulerService.getJobStatus();
      
      expect(status).toEqual({});
    });
  });

  describe('triggerTransactionSync', () => {
    it('should manually trigger transaction sync', async () => {
      const mockResult = {
        transactions: [{ id: 1 }],
        summary: { totalSpending: 100, totalIncome: 50 }
      };
      
      mockBankService.fetchAllTransactions.mockResolvedValue(mockResult);
      
      await schedulerService.triggerTransactionSync();
      
      expect(mockBankService.fetchAllTransactions).toHaveBeenCalledWith(30);
      expect(mockLogger.info).toHaveBeenCalledWith('🔄 Manually triggering transaction sync...');
      expect(mockLogger.info).toHaveBeenCalledWith('✅ Manual sync completed: 1 transactions');
    });

    it('should handle manual transaction sync errors', async () => {
      const mockError = new Error('Manual sync failed');
      mockBankService.fetchAllTransactions.mockRejectedValue(mockError);
      
      await expect(schedulerService.triggerTransactionSync()).rejects.toThrow(mockError);
      
      expect(mockLogger.error).toHaveBeenCalledWith('❌ Manual sync failed:', mockError);
    });
  });

  describe('triggerInvestmentSync', () => {
    it('should manually trigger investment sync', async () => {
      const mockInstitutions = [
        { id: 1, access_token: 'token1' }
      ];
      
      mockDatabase.all.mockResolvedValue(mockInstitutions);
      mockInvestmentService.syncInvestmentData.mockResolvedValue(undefined);
      mockInvestmentService.refreshAllMarketData.mockResolvedValue(undefined);
      
      await schedulerService.triggerInvestmentSync();
      
      expect(mockDatabase.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, access_token FROM institutions WHERE is_active = 1')
      );
      expect(mockInvestmentService.syncInvestmentData).toHaveBeenCalledWith('token1', 1);
      expect(mockInvestmentService.refreshAllMarketData).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('✅ Manual investment sync completed');
    });

    it('should handle manual investment sync errors', async () => {
      const mockError = new Error('Manual investment sync failed');
      mockDatabase.all.mockRejectedValue(mockError);
      
      await expect(schedulerService.triggerInvestmentSync()).rejects.toThrow(mockError);
      
      expect(mockLogger.error).toHaveBeenCalledWith('❌ Manual investment sync failed:', mockError);
    });
  });
});
