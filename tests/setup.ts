import path from 'path';
import fs from 'fs';

// Setup test environment
process.env.NODE_ENV = 'test';
process.env.PLAID_CLIENT_ID = 'test_client_id';
process.env.PLAID_SECRET = 'test_secret';
process.env.PLAID_ENV = 'sandbox';

// Store original console methods
const originalLog = console.log;
const originalError = console.error;

// Completely silence console output during tests for clean results
console.log = (...args) => {
  // Only show logs that are explicitly marked as critical/important
  const logText = args.join(' ');
  if (logText.includes('CRITICAL') || logText.includes('FATAL') || logText.includes('IMPORTANT')) {
    originalLog(...args);
  }
  // Otherwise, suppress all logs for clean test output
};

console.error = (...args) => {
  // Only show truly unexpected errors
  const errorText = args.join(' ');
  if (errorText.includes('CRITICAL') || errorText.includes('FATAL') || errorText.includes('UNEXPECTED')) {
    originalError(...args);
  }
  // Suppress all expected test errors for clean output
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
