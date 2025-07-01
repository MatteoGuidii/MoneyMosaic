import * as cron from 'node-cron';
import { bankService } from './bankService';

export class SchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  // Start the automatic transaction sync job
  startTransactionSync(intervalHours: number = 6): void {
    const cronPattern = `0 */${intervalHours} * * *`; // Every X hours
    
    const job = cron.schedule(cronPattern, async () => {
      console.log(`[${new Date().toISOString()}] Starting scheduled transaction sync...`);
      
      try {
        const result = await bankService.fetchAllTransactions(30);
        console.log(`✅ Synced ${result.transactions.length} transactions from all banks`);
        
        // Optional: Log summary
        console.log(`💰 Total Spending: $${result.summary.totalSpending.toFixed(2)}`);
        console.log(`💵 Total Income: $${result.summary.totalIncome.toFixed(2)}`);
      } catch (error) {
        console.error('❌ Scheduled transaction sync failed:', error);
      }
    });

    this.jobs.set('transaction-sync', job);
    
    console.log(`🕒 Transaction sync scheduled every ${intervalHours} hours`);
  }

  // Start connection health check job  
  startHealthCheck(): void {
    const cronPattern = '0 0 * * *'; // Daily at midnight
    
    const job = cron.schedule(cronPattern, async () => {
      console.log(`[${new Date().toISOString()}] Starting connection health check...`);
      
      try {
        const health = await bankService.checkConnectionHealth();
        
        if (health.healthy.length > 0) {
          console.log(`✅ Healthy connections: ${health.healthy.join(', ')}`);
        }
        
        if (health.unhealthy.length > 0) {
          console.log(`❌ Unhealthy connections:`);
          health.unhealthy.forEach(conn => {
            console.log(`  - ${conn.name}: ${conn.error}`);
          });
        }
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
    });

    this.jobs.set('health-check', job);
    
    console.log('🏥 Health check scheduled daily at midnight');
  }

  // Start all jobs
  startAll(transactionSyncHours: number = 6): void {
    this.startTransactionSync(transactionSyncHours);
    this.startHealthCheck();
    
    console.log('🚀 All background jobs started');
  }

  // Stop a specific job
  stopJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobs.delete(jobName);
      console.log(`⏹️ Stopped job: ${jobName}`);
    }
  }

  // Stop all jobs
  stopAll(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    });
    this.jobs.clear();
    console.log('⏹️ All background jobs stopped');
  }

  // Get job status
  getJobStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    this.jobs.forEach((job, name) => {
      status[name] = this.jobs.has(name); // Job exists means it's active
    });
    return status;
  }

  // Manual trigger for transaction sync
  async triggerTransactionSync(): Promise<void> {
    console.log('🔄 Manually triggering transaction sync...');
    try {
      const result = await bankService.fetchAllTransactions(30);
      console.log(`✅ Manual sync completed: ${result.transactions.length} transactions`);
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      throw error;
    }
  }
}

export const schedulerService = new SchedulerService();
