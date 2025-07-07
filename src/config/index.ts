import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '8080'),
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // Database Configuration
  database: {
    path: process.env.DB_PATH || './data/moneymosaic.db',
    timeout: parseInt(process.env.DB_TIMEOUT || '10000'),
    maxRetries: parseInt(process.env.DB_MAX_RETRIES || '3')
  },

  // Plaid Configuration
  plaid: {
    clientId: process.env.PLAID_CLIENT_ID!,
    secret: process.env.PLAID_SECRET!,
    environment: process.env.PLAID_ENV || 'sandbox',
    webhookUrl: process.env.PLAID_WEBHOOK_URL,
    redirectUri: process.env.PLAID_REDIRECT_URI,
    clientName: process.env.PLAID_CLIENT_NAME || 'MoneyMosaic'
  },

  // Scheduler Configuration
  scheduler: {
    syncIntervalHours: parseInt(process.env.SYNC_INTERVAL_HOURS || '6'),
    healthCheckIntervalHours: parseInt(process.env.HEALTH_CHECK_INTERVAL_HOURS || '1')
  }
};

// Validate required environment variables
const requiredEnvVars = ['PLAID_CLIENT_ID', 'PLAID_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config;
