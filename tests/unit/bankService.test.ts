import { BankService } from '../../src/services/bankService';
import { Database } from '../../src/database';
import { plaidClient } from '../../src/plaidClient';
import path from 'path';
import fs from 'fs';

// Mock plaidClient
jest.mock('../../src/plaidClient', () => ({
  plaidClient: {
    itemPublicTokenExchange: jest.fn(),
    institutionsGetById: jest.fn(),
    accountsGet: jest.fn(),
    transactionsGet: jest.fn(),
  },
}));

describe('BankService', () => {
  let testDatabase: Database;
  let bankService: BankService;
  let testDbPath: string;

  beforeEach(async () => {
    // Create a unique test database for each test
    testDbPath = global.getUniqueTestDbPath();
    
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    // Create test database and service
    testDatabase = new Database(testDbPath);
    bankService = new BankService(testDatabase);
    
    // Wait for database initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (testDatabase) {
      await testDatabase.close();
    }
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('addBankConnection', () => {
    it('should successfully add a bank connection', async () => {
      const mockExchangeResponse = {
        data: {
          access_token: 'test_access_token',
          item_id: 'test_item_id',
        },
      };

      const mockInstitutionResponse = {
        data: {
          institution: {
            institution_id: 'test_institution_id',
            name: 'Test Bank',
            url: 'https://testbank.com',
            primary_color: '#000000',
            logo: 'https://testbank.com/logo.png',
          },
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

      (plaidClient.itemPublicTokenExchange as jest.Mock).mockResolvedValue(mockExchangeResponse);
      (plaidClient.institutionsGetById as jest.Mock).mockResolvedValue(mockInstitutionResponse);
      (plaidClient.accountsGet as jest.Mock).mockResolvedValue(mockAccountsResponse);

      const result = await bankService.addBankConnection({
        public_token: 'test_public_token',
        institution: {
          institution_id: 'test_institution_id',
          name: 'Test Bank',
        },
      });

      expect(result.access_token).toBe('test_access_token');
      expect(result.item_id).toBe('test_item_id');
      expect(plaidClient.itemPublicTokenExchange).toHaveBeenCalledWith({
        public_token: 'test_public_token',
      });
    });

    it('should handle Plaid API errors', async () => {
      (plaidClient.itemPublicTokenExchange as jest.Mock).mockRejectedValue(new Error('Plaid API Error'));

      await expect(
        bankService.addBankConnection({
          public_token: 'invalid_token',
          institution: {
            institution_id: 'test_institution_id',
            name: 'Test Bank',
          },
        })
      ).rejects.toThrow('Plaid API Error');
    });
  });

  describe('fetchAllTransactions', () => {
    it('should fetch transactions for all connected banks', async () => {
      // Setup a test institution and account first
      await testDatabase.saveInstitution({
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'test_access_token',
        item_id: 'test_item_id',
      });

      const savedInstitution = await testDatabase.getInstitutionByAccessToken('test_access_token');
      
      await testDatabase.saveAccount({
        account_id: 'test_account_id',
        institution_id: savedInstitution.id,
        name: 'Test Checking',
        type: 'depository',
      });

      const mockTransactionsResponse = {
        data: {
          accounts: [
            {
              account_id: 'test_account_id',
              name: 'Test Checking',
              type: 'depository',
              subtype: 'checking',
            },
          ],
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
            },
          ],
          total_transactions: 1,
        },
      };

      (plaidClient.transactionsGet as jest.Mock).mockResolvedValue(mockTransactionsResponse);

      const result = await bankService.fetchAllTransactions(30);

      expect(result.transactions).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(plaidClient.transactionsGet).toHaveBeenCalled();
    });

    it('should handle no connected banks', async () => {
      const result = await bankService.fetchAllTransactions(30);

      expect(result.transactions).toBeDefined();
      expect(result.summary).toBeDefined();
    });
  });

  describe('getConnectedBanks', () => {
    it('should return connected banks', async () => {
      await testDatabase.saveInstitution({
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'test_access_token',
        item_id: 'test_item_id',
      });

      const banks = await bankService.getConnectedBanks();

      expect(banks).toHaveLength(1);
      expect(banks[0].name).toBe('Test Bank');
    });

    it('should return empty array when no banks connected', async () => {
      const banks = await bankService.getConnectedBanks();

      expect(banks).toHaveLength(0);
    });
  });

  describe('removeBankConnection', () => {
    it('should remove a bank connection', async () => {
      await testDatabase.saveInstitution({
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'test_access_token',
        item_id: 'test_item_id',
      });

      const savedInstitution = await testDatabase.getInstitutionByAccessToken('test_access_token');
      
      await bankService.removeBankConnection(savedInstitution.id);

      const banks = await bankService.getConnectedBanks();
      expect(banks).toHaveLength(0);
    });
  });

  describe('checkConnectionHealth', () => {
    it('should check health of all connections', async () => {
      await testDatabase.saveInstitution({
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'test_access_token',
        item_id: 'test_item_id',
      });

      const mockAccountsResponse = {
        data: {
          accounts: [],
        },
      };

      (plaidClient.accountsGet as jest.Mock).mockResolvedValue(mockAccountsResponse);

      const health = await bankService.checkConnectionHealth();

      expect(health.healthy).toHaveLength(1);
      expect(health.unhealthy).toHaveLength(0);
      expect(health.healthy).toContain('Test Bank');
    });

    it('should handle connection failures', async () => {
      await testDatabase.saveInstitution({
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'test_access_token',
        item_id: 'test_item_id',
      });

      (plaidClient.accountsGet as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const health = await bankService.checkConnectionHealth();

      expect(health.healthy).toHaveLength(0);
      expect(health.unhealthy).toHaveLength(1);
      expect(health.unhealthy[0].name).toBe('Test Bank');
    });
  });
});
