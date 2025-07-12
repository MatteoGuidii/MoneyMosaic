#!/usr/bin/env ts-node
import { database } from '../src/database';

/**
 * Standalone script to clean all data from the database
 * Usage: npm run cleanup-db or ts-node scripts/cleanup-database.ts
 */

async function cleanupDatabase() {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Clean all data from database
    await database.cleanAllData();
    
    console.log('✅ Database cleanup completed successfully!');
    console.log('📊 All data has been removed from:');
    console.log('   - Institutions');
    console.log('   - Accounts');
    console.log('   - Transactions');
    console.log('   - Budgets');
    console.log('   - Securities');
    console.log('   - Holdings');
    console.log('   - Investment Transactions');
    console.log('   - Market Data');
    
    // Close database connection
    await database.close();
    
    console.log('🔒 Database connection closed');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupDatabase();
}

export { cleanupDatabase };
