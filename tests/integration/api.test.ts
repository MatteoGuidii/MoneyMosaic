import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { Database } from '../../src/database';
import { BankService } from '../../src/services/bankService';

// Import routes
import createLinkTokenRoute from '../../src/routes/createLinkToken';
import exchangeTokenRoute from '../../src/routes/exchangeToken';
import sandboxRoutes from '../../src/routes/sandbox';
import transactionsRoutes from '../../src/routes/transactions';

// Mock plaidClient
jest.mock('../../src/plaidClient', () => ({
  plaidClient: {
    linkTokenCreate: jest.fn(),
    itemPublicTokenExchange: jest.fn(),
    sandboxPublicTokenCreate: jest.fn(),
    institutionsGetById: jest.fn(),
    accountsGet: jest.fn(),
    transactionsGet: jest.fn(),
  },
}));

// Mock bankService
jest.mock('../../src/services/bankService', () => {
  const actual = jest.requireActual('../../src/services/bankService');
  return {
    ...actual,
    bankService: {
      addBankConnection: jest.fn(),
      getConnectedBanks: jest.fn(),
      fetchAllTransactions: jest.fn(),
      getTransactions: jest.fn(),
      getDashboardSummary: jest.fn(),
      checkConnectionHealth: jest.fn(),
      removeBankConnection: jest.fn(),
    },
  };
});

const { plaidClient } = require('../../src/plaidClient');
const { bankService } = require('../../src/services/bankService');

describe('API Integration Tests', () => {
  let app: express.Application;

  beforeEach(async () => {
    // Setup Express app with routes
    app = express();
    app.use(express.json());
    
    app.use('/api', createLinkTokenRoute);
    app.use('/api', exchangeTokenRoute);
    app.use('/api', sandboxRoutes);
    app.use('/api', transactionsRoutes);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('POST /api/create_link_token', () => {
    it('should create a link token successfully', async () => {
      const mockResponse = {
        data: {
          link_token: 'test_link_token_12345',
          expiration: '2024-01-01T00:00:00Z',
        },
      };

      plaidClient.linkTokenCreate.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/create_link_token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('link_token');
      expect(response.body.link_token).toBe('test_link_token_12345');
      expect(plaidClient.linkTokenCreate).toHaveBeenCalledWith({
        client_name: 'FinTracker',
        user: { client_user_id: 'unique-user-id' },
        products: ['transactions'],
        country_codes: ['CA'],
        language: 'en',
        webhook: process.env.PLAID_WEBHOOK_URL,
        redirect_uri: process.env.PLAID_REDIRECT_URI,
      });
    });

    it('should handle Plaid API errors', async () => {
      plaidClient.linkTokenCreate.mockRejectedValue(new Error('Plaid API Error'));

      const response = await request(app)
        .post('/api/create_link_token')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to create link token');
    });
  });

  describe('POST /api/exchange_public_token', () => {
    it('should exchange public token successfully', async () => {
      const mockExchangeResponse = {
        data: {
          access_token: 'test_access_token',
          item_id: 'test_item_id',
        },
      };

      const mockAccountsResponse = {
        data: {
          accounts: [
            {
              account_id: 'test_account_id',
              name: 'Test Checking',
              official_name: 'Test Checking Account',
              type: 'depository',
              subtype: 'checking',
              mask: '1234',
              balances: {
                current: 1000.00,
                available: 950.00,
              },
            },
          ],
        },
      };

      plaidClient.itemPublicTokenExchange.mockResolvedValue(mockExchangeResponse);
      plaidClient.accountsGet.mockResolvedValue(mockAccountsResponse);
      bankService.addBankConnection.mockResolvedValue({
        access_token: 'test_access_token',
        item_id: 'test_item_id',
      });

      const response = await request(app)
        .post('/api/exchange_public_token')
        .send({
          public_token: 'test_public_token',
          institution: {
            institution_id: 'test_institution_id',
            name: 'Test Bank',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('item_id');
    });

    it('should handle missing public_token', async () => {
      bankService.addBankConnection.mockRejectedValue(new Error('Missing public_token'));

      const response = await request(app)
        .post('/api/exchange_public_token')
        .send({
          institution: {
            institution_id: 'test_institution_id',
            name: 'Test Bank',
          },
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/sandbox/public_token/create', () => {
    it('should create sandbox public token', async () => {
      const mockResponse = {
        data: {
          public_token: 'test_sandbox_public_token',
        },
      };

      plaidClient.sandboxPublicTokenCreate.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/sandbox/public_token/create')
        .send({
          institution_id: 'ins_109508',
          initial_products: ['transactions'],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('public_token');
      expect(response.body.public_token).toBe('test_sandbox_public_token');
    });
  });

  describe('GET /api/connected_banks', () => {
    it('should return empty array when no banks connected', async () => {
      bankService.getConnectedBanks.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/connected_banks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('banks');
      expect(response.body.banks).toHaveLength(0);
    });

    it('should return connected banks', async () => {
      // Mock the bankService response
      bankService.getConnectedBanks.mockResolvedValue([
        {
          id: 1,
          institution_id: 'test_institution_id',
          name: 'Test Bank',
          access_token: 'test_access_token',
          item_id: 'test_item_id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: 1
        }
      ]);

      const response = await request(app)
        .get('/api/connected_banks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('banks');
      expect(response.body.banks).toHaveLength(1);
      expect(response.body.banks[0].name).toBe('Test Bank');
    });
  });

  describe('POST /api/fetch_transactions', () => {
    it('should fetch transactions for connected banks', async () => {
      // Mock the bankService response
      bankService.fetchAllTransactions.mockResolvedValue({
        transactions: [
          {
            transaction_id: 'txn_1',
            account_id: 'test_account_id',
            amount: 25.50,
            date: '2023-01-01',
            name: 'Test Purchase',
            merchant_name: 'Test Merchant',
            category_primary: 'Food and Drink',
            category_detailed: 'Restaurants',
            type: 'place',
            pending: false,
          },
        ],
        summary: {
          totalExpenses: 25.50,
          totalIncome: 0,
          netCashFlow: -25.50,
          transactionCount: 1
        }
      });

      const mockTransactionsResponse = {
        data: {
          transactions: [
            {
              transaction_id: 'txn_1',
              account_id: 'test_account_id',
              amount: 25.50,
              date: '2023-01-01',
              name: 'Test Purchase',
              merchant_name: 'Test Merchant',
              category: ['Food and Drink', 'Restaurants'],
              type: 'place',
              pending: false,
              personal_finance_category: 'Food and Drink',
            },
          ],
        },
      };

      plaidClient.transactionsGet.mockResolvedValue(mockTransactionsResponse);

      const response = await request(app)
        .post('/api/fetch_transactions')
        .send({ days: 30 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('summary');
    });
  });

  describe('GET /api/health_check', () => {
    it('should return health status', async () => {
      bankService.checkConnectionHealth.mockResolvedValue({
        healthy: [{ name: 'Test Bank' }],
        unhealthy: []
      });

      const response = await request(app)
        .get('/api/health_check');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('healthy');
      expect(response.body).toHaveProperty('unhealthy');
    });
  });

  describe('GET /api/scheduler_status', () => {
    it('should return scheduler status', async () => {
      const response = await request(app)
        .get('/api/scheduler_status');

      expect(response.status).toBe(200);
      // The actual response depends on scheduler implementation
    });
  });

  describe('DELETE /api/banks/:institutionId', () => {
    it('should remove bank connection', async () => {
      // Mock the service response
      const institutionId = 1;
      
      const response = await request(app)
        .delete(`/api/banks/${institutionId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });
  });
});
