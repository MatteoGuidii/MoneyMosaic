import * as cron from 'node-cron';
import { bankService } from './bank.service';
import { investmentService } from './investment.service';
import { UnhealthyConnection } from '../types';
import { logger } from '../utils/logger';
import { database } from '../database';

export class SchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

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
    
    logger.info(`🕒 Transaction sync scheduled every ${intervalHours} hours`);
  }

  // Start the automatic investment sync job
  startInvestmentSync(intervalHours: number = 6): void {
    const cronPattern = `15 */${intervalHours} * * *`; // Every X hours, offset by 15 minutes
    
    const job = cron.schedule(cronPattern, async () => {
      logger.info(`Starting scheduled investment sync...`);
      
      try {
        const activeInstitutions = await database.all(`
          SELECT id, access_token FROM institutions WHERE is_active = 1
        `);
        
        for (const institution of activeInstitutions) {
          try {
            await investmentService.syncInvestmentData(institution.access_token, institution.id);
            logger.info(`✅ Synced investments for institution ${institution.id}`);
          } catch (error) {
            logger.error(`❌ Failed to sync investments for institution ${institution.id}:`, error);
          }
        }
        
        // Update market data for all holdings
        await investmentService.refreshAllMarketData();
        logger.info('✅ Market data refreshed');
        
      } catch (error) {
        logger.error('❌ Scheduled investment sync failed:', error);
      }
    });

    this.jobs.set('investment-sync', job);
    
    logger.info(`📈 Investment sync scheduled every ${intervalHours} hours`);
  }

  // Start market data refresh job (more frequent)
  startMarketDataRefresh(): void {
    const cronPattern = '*/15 9-16 * * 1-5'; // Every 15 minutes during market hours (9 AM - 4 PM, Mon-Fri)
    
    const job = cron.schedule(cronPattern, async () => {
      logger.info(`Starting market data refresh...`);
      
      try {
        await investmentService.refreshAllMarketData();
        logger.info('✅ Market data refreshed');
      } catch (error) {
        logger.error('❌ Market data refresh failed:', error);
      }
    });

    this.jobs.set('market-data-refresh', job);
    
    logger.info(`📊 Market data refresh scheduled every 15 minutes during market hours`);
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
    
    logger.info('🏥 Health check scheduled daily at midnight');
  }

  // Start all jobs
  startAll(transactionSyncHours: number = 6): void {
    this.startTransactionSync(transactionSyncHours);
    this.startInvestmentSync(transactionSyncHours);
    this.startMarketDataRefresh();
    this.startHealthCheck();
    
    logger.info('🚀 All background jobs started');
  }

  // Stop a specific job
  stopJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobs.delete(jobName);
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
    logger.info('⏹️ All background jobs stopped');
  }

  // Get job status
  getJobStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    this.jobs.forEach((_job, name) => {
      status[name] = this.jobs.has(name); // Check if the job is actively scheduled
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

  // Manual trigger for investment sync
  async triggerInvestmentSync(): Promise<void> {
    logger.info('📈 Manually triggering investment sync...');
    try {
      const activeInstitutions = await database.all(`
        SELECT id, access_token FROM institutions WHERE is_active = 1
      `);
      
      for (const institution of activeInstitutions) {
        try {
          await investmentService.syncInvestmentData(institution.access_token, institution.id);
          logger.info(`✅ Synced investments for institution ${institution.id}`);
        } catch (error) {
          logger.error(`❌ Failed to sync investments for institution ${institution.id}:`, error);
        }
      }
      
      // Update market data for all holdings
      await investmentService.refreshAllMarketData();
      logger.info('✅ Manual investment sync completed');
    } catch (error) {
      logger.error('❌ Manual investment sync failed:', error);
      throw error;
    }
  }
}

export const schedulerService = new SchedulerService();
