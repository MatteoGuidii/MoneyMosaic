import * as cron from 'node-cron';
import { bankService } from './bank.service';
import { UnhealthyConnection } from '../types';
import { logger } from '../utils/logger';

export class SchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private activeJobs: Set<string> = new Set();

  // Start the automatic transaction sync job
  startTransactionSync(intervalHours: number = 6): void {
    const cronPattern = `0 */${intervalHours} * * *`; // Every X hours
    
    const job = cron.schedule(cronPattern, async () => {
      logger.info(`Starting scheduled transaction sync...`);
      
      try {
        const result = await bankService.fetchAllTransactions(30);
        logger.info(`✅ Synced ${result.transactions.length} transactions from all banks`);
        
        // Optional: Log summary
        logger.info(`💰 Total Spending: $${result.summary.totalSpending.toFixed(2)}`);
        logger.info(`💵 Total Income: $${result.summary.totalIncome.toFixed(2)}`);
      } catch (error) {
        logger.error('❌ Scheduled transaction sync failed:', error);
      }
    });

    this.jobs.set('transaction-sync', job);
    this.activeJobs.add('transaction-sync');
    
    logger.info(`🕒 Transaction sync scheduled every ${intervalHours} hours`);
  }

  // Start connection health check job  
  startHealthCheck(): void {
    const cronPattern = '0 0 * * *'; // Daily at midnight
    
    const job = cron.schedule(cronPattern, async () => {
      logger.info(`Starting connection health check...`);
      
      try {
        const health = await bankService.checkConnectionHealth();
        
        if (health.healthy.length > 0) {
          logger.info(`✅ Healthy connections: ${health.healthy.join(', ')}`);
        }
        
        if (health.unhealthy.length > 0) {
          logger.warn(`❌ Unhealthy connections:`);
          health.unhealthy.forEach((conn: UnhealthyConnection) => {
            logger.warn(`  - ${conn.name}: ${conn.error}`);
          });
        }
      } catch (error) {
        logger.error('❌ Health check failed:', error);
      }
    });

    this.jobs.set('health-check', job);
    this.activeJobs.add('health-check');
    
    logger.info('🏥 Health check scheduled daily at midnight');
  }

  // Start all jobs
  startAll(transactionSyncHours: number = 6): void {
    this.startTransactionSync(transactionSyncHours);
    this.startHealthCheck();
    
    logger.info('🚀 All background jobs started');
  }

  // Stop a specific job
  stopJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobs.delete(jobName);
      this.activeJobs.delete(jobName);
      logger.info(`⏹️ Stopped job: ${jobName}`);
    }
  }

  // Stop all jobs
  stopAll(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`⏹️ Stopped job: ${name}`);
    });
    this.jobs.clear();
    this.activeJobs.clear();
    logger.info('⏹️ All background jobs stopped');
  }

  // Get job status
  getJobStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    this.jobs.forEach((_job, name) => {
      status[name] = this.activeJobs.has(name); // Check if the job is actively scheduled
    });
    return status;
  }

  // Manual trigger for transaction sync
  async triggerTransactionSync(): Promise<void> {
    logger.info('🔄 Manually triggering transaction sync...');
    try {
      const result = await bankService.fetchAllTransactions(30);
      logger.info(`✅ Manual sync completed: ${result.transactions.length} transactions`);
    } catch (error) {
      logger.error('❌ Manual sync failed:', error);
      throw error;
    }
  }
}

export const schedulerService = new SchedulerService();
