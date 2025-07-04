import path from 'path';
import fs from 'fs';

// Setup test environment
process.env.NODE_ENV = 'test';
process.env.PLAID_CLIENT_ID = 'test_client_id';
process.env.PLAID_SECRET = 'test_secret';
process.env.PLAID_ENV = 'sandbox';

// Suppress console logs during tests for cleaner output
// Store original console methods
const originalLog = console.log;
const originalError = console.error;

// Mock console methods to reduce noise in tests
console.log = (...args) => {
  const logText = args.join(' ');
  
  // Skip scheduler service logs (they use emojis and are noisy in tests)
  if (logText.includes('🕒') || logText.includes('🏥') || logText.includes('🚀') || 
      logText.includes('⏹️') || logText.includes('✅') || logText.includes('💰') || 
      logText.includes('💵') || logText.includes('🔄') || logText.includes('Starting scheduled') ||
      logText.includes('Synced') || logText.includes('Total Spending') || logText.includes('Total Income') ||
      logText.includes('All background jobs') || logText.includes('Stopped job') || 
      logText.includes('scheduled every') || logText.includes('Manual sync completed') ||
      logText.includes('Starting connection health check') || logText.includes('Healthy connections') ||
      logText.includes('Manually triggering')) {
    return; // Skip these logs
  }
  
  // Only show logs that contain 'ERROR' or 'FAIL' for important debugging
  if (args.some(arg => String(arg).includes('ERROR') || String(arg).includes('FAIL'))) {
    originalLog(...args);
  }
};

// Keep console.error for actual error debugging
console.error = (...args) => {
  const errorText = args.join(' ');
  
  // Skip expected test errors
  if (errorText.includes('test error') || 
      errorText.includes('Plaid API Error') || 
      errorText.includes('Missing public_token') ||
      errorText.includes('exchangePublicToken error')) {
    return;
  }
  
  // Show other errors
  originalError(...args);
};

// Create a unique test database path for each test run
const testId = Date.now().toString();
const testDbPath = path.join(__dirname, 'fixtures', `test-${testId}.db`);
process.env.DB_PATH = testDbPath;

// Ensure test fixtures directory exists
const fixturesDir = path.join(__dirname, 'fixtures');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

// Global test utilities
declare global {
  var getUniqueTestDbPath: () => string;
}

global.getUniqueTestDbPath = () => {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return path.join(__dirname, 'fixtures', `test-${uniqueId}.db`);
};
