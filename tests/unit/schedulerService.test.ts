import { schedulerService } from '../../src/services/schedulerService';
import { bankService } from '../../src/services/bankService';

// Mock bankService
jest.mock('../../src/services/bankService', () => ({
  bankService: {
    fetchAllTransactions: jest.fn(),
    checkConnectionHealth: jest.fn(),
  },
}));

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

const cron = require('node-cron');

describe('SchedulerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any existing jobs
    schedulerService.stopAll();
  });

  describe('startTransactionSync', () => {
    it('should start transaction sync job with default interval', () => {
      const mockJob = { stop: jest.fn() };
      cron.schedule.mockReturnValue(mockJob);

      schedulerService.startTransactionSync();

      expect(cron.schedule).toHaveBeenCalledWith(
        '0 */6 * * *', // Every 6 hours
        expect.any(Function)
      );
    });

    it('should start transaction sync job with custom interval', () => {
      const mockJob = { stop: jest.fn() };
      cron.schedule.mockReturnValue(mockJob);

      schedulerService.startTransactionSync(12); // Every 12 hours

      expect(cron.schedule).toHaveBeenCalledWith(
        '0 */12 * * *',
        expect.any(Function)
      );
    });
  });

  describe('startHealthCheck', () => {
    it('should start health check job', () => {
      const mockJob = { stop: jest.fn() };
      cron.schedule.mockReturnValue(mockJob);

      schedulerService.startHealthCheck();

      expect(cron.schedule).toHaveBeenCalledWith(
        '0 0 * * *', // Daily at midnight
        expect.any(Function)
      );
    });
  });

  describe('startAll', () => {
    it('should start all jobs with default interval', () => {
      const mockJob = { stop: jest.fn() };
      cron.schedule.mockReturnValue(mockJob);

      schedulerService.startAll();

      expect(cron.schedule).toHaveBeenCalledTimes(2); // Transaction sync + health check
      expect(cron.schedule).toHaveBeenCalledWith('0 */6 * * *', expect.any(Function));
      expect(cron.schedule).toHaveBeenCalledWith('0 0 * * *', expect.any(Function));
    });

    it('should start all jobs with custom interval', () => {
      const mockJob = { stop: jest.fn() };
      cron.schedule.mockReturnValue(mockJob);

      schedulerService.startAll(8);

      expect(cron.schedule).toHaveBeenCalledTimes(2);
      expect(cron.schedule).toHaveBeenCalledWith('0 */8 * * *', expect.any(Function));
      expect(cron.schedule).toHaveBeenCalledWith('0 0 * * *', expect.any(Function));
    });
  });

  describe('triggerTransactionSync', () => {
    it('should trigger manual transaction sync', async () => {
      const mockTransactionResult = {
        transactions: [],
        summary: { totalSpending: 0, totalIncome: 0 }
      };

      (bankService.fetchAllTransactions as jest.Mock).mockResolvedValue(mockTransactionResult);

      await schedulerService.triggerTransactionSync();

      expect(bankService.fetchAllTransactions).toHaveBeenCalledWith(30);
    });

    it('should handle sync errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (bankService.fetchAllTransactions as jest.Mock).mockRejectedValue(
        new Error('Sync failed')
      );

      await expect(schedulerService.triggerTransactionSync()).rejects.toThrow('Sync failed');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Manual sync failed:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('stopJob', () => {
    it('should stop a specific job', () => {
      const mockJob = { stop: jest.fn() };
      cron.schedule.mockReturnValue(mockJob);

      schedulerService.startTransactionSync();
      schedulerService.stopJob('transaction-sync');

      expect(mockJob.stop).toHaveBeenCalled();
    });

    it('should handle stopping non-existent job', () => {
      // Should not throw error when job doesn't exist
      expect(() => schedulerService.stopJob('non-existent')).not.toThrow();
    });
  });

  describe('stopAll', () => {
    it('should stop all scheduled jobs', () => {
      const mockJob = { stop: jest.fn() };
      cron.schedule.mockReturnValue(mockJob);

      // Start jobs first
      schedulerService.startAll();
      
      // Then stop all jobs
      schedulerService.stopAll();

      expect(mockJob.stop).toHaveBeenCalledTimes(2); // Called for each job
    });

    it('should handle stopping when no jobs are running', () => {
      // Should not throw error when no jobs are running
      expect(() => schedulerService.stopAll()).not.toThrow();
    });
  });

  describe('getJobStatus', () => {
    it('should return job status when jobs are running', () => {
      const mockJob = { stop: jest.fn() };
      cron.schedule.mockReturnValue(mockJob);

      schedulerService.startAll();
      const status = schedulerService.getJobStatus();

      expect(status).toEqual({
        'transaction-sync': true,
        'health-check': true
      });
    });

    it('should return empty status when no jobs are running', () => {
      // Ensure no jobs are running
      schedulerService.stopAll();
      
      const status = schedulerService.getJobStatus();

      expect(status).toEqual({});
    });
  });

  describe('Job Execution', () => {
    it('should execute transaction sync when cron job runs', async () => {
      const mockJob = { stop: jest.fn() };
      let cronCallback: Function | undefined;
      
      cron.schedule.mockImplementation((schedule: string, callback: Function) => {
        if (schedule === '0 */6 * * *') {
          cronCallback = callback;
        }
        return mockJob;
      });

      (bankService.fetchAllTransactions as jest.Mock).mockResolvedValue({
        transactions: [],
        summary: { totalSpending: 0, totalIncome: 0 }
      });

      schedulerService.startTransactionSync();

      // Simulate cron job execution
      if (cronCallback) {
        await cronCallback();
      }

      expect(bankService.fetchAllTransactions).toHaveBeenCalledWith(30);
    });

    it('should execute health check when cron job runs', async () => {
      const mockJob = { stop: jest.fn() };
      let cronCallback: Function | undefined;
      
      cron.schedule.mockImplementation((schedule: string, callback: Function) => {
        if (schedule === '0 0 * * *') {
          cronCallback = callback;
        }
        return mockJob;
      });

      (bankService.checkConnectionHealth as jest.Mock).mockResolvedValue({
        healthy: ['Test Bank'],
        unhealthy: []
      });

      schedulerService.startHealthCheck();

      // Simulate cron job execution
      if (cronCallback) {
        await cronCallback();
      }

      expect(bankService.checkConnectionHealth).toHaveBeenCalled();
    });

    it('should handle job execution errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockJob = { stop: jest.fn() };
      let cronCallback: Function | undefined;
      
      cron.schedule.mockImplementation((schedule: string, callback: Function) => {
        if (schedule === '0 */6 * * *') {
          cronCallback = callback;
        }
        return mockJob;
      });

      (bankService.fetchAllTransactions as jest.Mock).mockRejectedValue(
        new Error('Scheduled sync failed')
      );

      schedulerService.startTransactionSync();

      // Simulate cron job execution
      if (cronCallback) {
        await cronCallback();
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Scheduled transaction sync failed:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
