import { BankService } from '../../src/services/bank.service';
import { database } from '../../src/database';
import { plaidClient } from '../../src/plaidClient';
import { formatISO, subDays } from 'date-fns';

// Mock dependencies
jest.mock('../../src/database');
jest.mock('../../src/plaidClient');
jest.mock('date-fns');

const mockDatabase = database as jest.Mocked<typeof database>;
const mockPlaidClient = plaidClient as jest.Mocked<typeof plaidClient>;
const mockFormatISO = formatISO as jest.MockedFunction<typeof formatISO>;
const mockSubDays = subDays as jest.MockedFunction<typeof subDays>;

describe('BankService - Comprehensive Tests', () => {
  let bankService: BankService;

  beforeEach(() => {
    jest.clearAllMocks();
    bankService = new BankService();
    
    // Setup date mocks
    mockFormatISO.mockReturnValue('2023-01-01');
    mockSubDays.mockReturnValue(new Date('2023-01-01'));
    
    // Mock database.getTransactionSummary to return consistent structure
    mockDatabase.getTransactionSummary.mockResolvedValue({
      totalSpending: 0,
      totalIncome: 0,
      byCategory: {},
      byInstitution: {}
    });
    
    // Suppress console output in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('addBankConnection', () => {
    it('should successfully add a bank connection', async () => {
      const mockTokenData = {
        access_token: 'access-sandbox-test-token',
        item_id: 'test-item-id'
      };

      const mockInstitution = {
        institution_id: 'ins_123',
        name: 'Test Bank'
      };

      const connectionData = {
        public_token: 'public-token-test',
        institution: mockInstitution
      };

      mockPlaidClient.itemPublicTokenExchange.mockResolvedValue({
        data: mockTokenData
      } as any);

      mockDatabase.saveInstitution.mockResolvedValue(undefined);
      mockDatabase.getInstitutionByAccessToken.mockResolvedValue({
        id: 1,
        name: 'Test Bank'
      });

      mockPlaidClient.accountsGet.mockResolvedValue({
        data: {
          accounts: [
            {
              account_id: 'acc_1',
              name: 'Checking',
              official_name: 'Test Checking Account',
              type: 'depository',
              subtype: 'checking',
              mask: '0000',
              balances: {
                current: 1000,
                available: 950
              }
            }
          ]
        }
      } as any);

      mockDatabase.saveAccount.mockResolvedValue(undefined);

      const result = await bankService.addBankConnection(connectionData);

      expect(result).toEqual({
        access_token: 'access-sandbox-test-token',
        item_id: 'test-item-id'
      });

      expect(mockPlaidClient.itemPublicTokenExchange).toHaveBeenCalledWith({
        public_token: 'public-token-test'
      });
      expect(mockDatabase.saveInstitution).toHaveBeenCalledWith({
        institution_id: 'ins_123',
        name: 'Test Bank',
        access_token: 'access-sandbox-test-token',
        item_id: 'test-item-id'
      });
    });

    it('should handle Plaid API errors during token exchange', async () => {
      const connectionData = {
        public_token: 'invalid-token',
        institution: {
          institution_id: 'ins_123',
          name: 'Test Bank'
        }
      };

      mockPlaidClient.itemPublicTokenExchange.mockRejectedValue(
        new Error('INVALID_PUBLIC_TOKEN')
      );

      await expect(bankService.addBankConnection(connectionData)).rejects.toThrow(
        'INVALID_PUBLIC_TOKEN'
      );
    });

    it('should handle database errors during institution save', async () => {
      const connectionData = {
        public_token: 'public-token-test',
        institution: {
          institution_id: 'ins_123',
          name: 'Test Bank'
        }
      };

      mockPlaidClient.itemPublicTokenExchange.mockResolvedValue({
        data: {
          access_token: 'access-token',
          item_id: 'item-id'
        }
      } as any);

      mockDatabase.saveInstitution.mockRejectedValue(new Error('Database error'));

      await expect(bankService.addBankConnection(connectionData)).rejects.toThrow(
        'Database error'
      );
    });

    it('should handle errors during account fetching', async () => {
      const connectionData = {
        public_token: 'public-token-test',
        institution: {
          institution_id: 'ins_123',
          name: 'Test Bank'
        }
      };

      mockPlaidClient.itemPublicTokenExchange.mockResolvedValue({
        data: {
          access_token: 'access-token',
          item_id: 'item-id'
        }
      } as any);

      mockDatabase.saveInstitution.mockResolvedValue(undefined);
      mockPlaidClient.accountsGet.mockRejectedValue(new Error('INVALID_ACCESS_TOKEN'));

      await expect(bankService.addBankConnection(connectionData)).rejects.toThrow(
        'INVALID_ACCESS_TOKEN'
      );
    });
  });

  describe('fetchAllTransactions', () => {
    it('should fetch transactions from all connected institutions', async () => {
      const institutions = [
        {
          id: 1,
          name: 'Test Bank 1',
          access_token: 'access-sandbox-test-token-1',
          item_id: 'item-1'
        },
        {
          id: 2,
          name: 'Test Bank 2',
          access_token: 'access-sandbox-test-token-2',
          item_id: 'item-2'
        }
      ];

      mockDatabase.getInstitutions.mockResolvedValue(institutions);

      const mockTransactionsResponse = {
        data: {
          accounts: [
            {
              account_id: 'acc_1',
              name: 'Checking',
              type: 'depository',
              subtype: 'checking'
            }
          ],
          transactions: [
            {
              transaction_id: 'txn_1',
              account_id: 'acc_1',
              amount: 25.50,
              date: '2023-01-01',
              name: 'Test Purchase',
              merchant_name: 'Test Merchant',
              category: ['Food and Drink', 'Restaurants'],
              type: 'place',
              pending: false,
              personal_finance_category: {
                primary: 'FOOD_AND_DRINK',
                detailed: 'FOOD_AND_DRINK_RESTAURANTS'
              }
            }
          ],
          total_transactions: 1
        }
      };

      mockPlaidClient.transactionsGet.mockResolvedValue(mockTransactionsResponse as any);
      mockDatabase.saveTransaction.mockResolvedValue(undefined);
      mockDatabase.getTransactions.mockResolvedValue([
        {
          transaction_id: 'txn_1',
          account_id: 'acc_1',
          amount: 25.50,
          date: '2023-01-01',
          name: 'Test Purchase',
          institution_name: 'Test Bank 1',
          account_name: 'Checking'
        }
      ]);
      mockDatabase.getTransactionSummary.mockResolvedValue({
        totalSpending: 25.50,
        totalIncome: 0,
        byCategory: { 'Food and Drink': 25.50 },
        byInstitution: { 'Test Bank 1': 25.50 }
      });

      const result = await bankService.fetchAllTransactions(30);

      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('summary');
      expect(result.transactions).toHaveLength(2); // 2 calls to getTransactions
      expect(mockPlaidClient.transactionsGet).toHaveBeenCalledTimes(2);
    });

    it('should handle case with no connected institutions', async () => {
      mockDatabase.getInstitutions.mockResolvedValue([]);

      const result = await bankService.fetchAllTransactions(30);

      expect(result).toEqual({
        transactions: [],
        summary: {
          totalExpenses: 0,
          totalIncome: 0,
          netCashFlow: 0,
          transactionCount: 0
        }
      });
    });

    it('should handle invalid access tokens gracefully', async () => {
      const institutions = [
        {
          id: 1,
          name: 'Test Bank',
          access_token: 'invalid-token-format',
          item_id: 'item-1'
        }
      ];

      mockDatabase.getInstitutions.mockResolvedValue(institutions);

      const result = await bankService.fetchAllTransactions(30);

      expect(result).toEqual({
        transactions: [],
        summary: {
          totalSpending: 0,
          totalIncome: 0,
          byCategory: {},
          byInstitution: {}
        }
      });
    });

    it('should handle Plaid API errors gracefully', async () => {
      const institutions = [
        {
          id: 1,
          name: 'Test Bank',
          access_token: 'access-sandbox-test-token',
          item_id: 'item-1'
        }
      ];

      mockDatabase.getInstitutions.mockResolvedValue(institutions);
      mockDatabase.getTransactionSummary.mockResolvedValue({
        totalSpending: 0,
        totalIncome: 0,
        byCategory: {},
        byInstitution: {}
      });
      
      // Mock the plaidClient.transactionsGet to reject with an error
      mockPlaidClient.transactionsGet.mockRejectedValue(new Error('API Error'));

      const result = await bankService.fetchAllTransactions(30);

      expect(result).toEqual({
        transactions: [],
        summary: {
          totalSpending: 0,
          totalIncome: 0,
          byCategory: {},
          byInstitution: {}
        }
      });
    });

    it('should handle INVALID_ACCESS_TOKEN errors and mark tokens as invalid', async () => {
      const institutions = [
        {
          id: 1,
          name: 'Test Bank',
          access_token: 'access-sandbox-test-token',
          item_id: 'item-1'
        }
      ];

      mockDatabase.getInstitutions.mockResolvedValue(institutions);
      mockPlaidClient.transactionsGet.mockRejectedValue({
        response: {
          data: {
            error_code: 'INVALID_ACCESS_TOKEN'
          }
        }
      });
      mockDatabase.getTransactionSummary.mockResolvedValue({
        totalSpending: 0,
        totalIncome: 0,
        byCategory: {},
        byInstitution: {}
      });

      const result = await bankService.fetchAllTransactions(30);

      expect(result).toEqual({
        transactions: [],
        summary: {
          totalSpending: 0,
          totalIncome: 0,
          byCategory: {},
          byInstitution: {}
        }
      });
    });
  });

  describe('getConnectedBanks', () => {
    it('should return list of connected banks', async () => {
      const mockInstitutions = [
        {
          id: 1,
          name: 'Test Bank 1',
          access_token: 'token-1',
          item_id: 'item-1',
          created_at: '2023-01-01'
        },
        {
          id: 2,
          name: 'Test Bank 2',
          access_token: 'token-2',
          item_id: 'item-2',
          created_at: '2023-01-02'
        }
      ];

      mockDatabase.getInstitutions.mockResolvedValue(mockInstitutions);

      const result = await bankService.getConnectedBanks();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Test Bank 1');
      expect(result[1].name).toBe('Test Bank 2');
    });

    it('should return empty array when no banks connected', async () => {
      mockDatabase.getInstitutions.mockResolvedValue([]);

      const result = await bankService.getConnectedBanks();

      expect(result).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      mockDatabase.getInstitutions.mockRejectedValue(new Error('Database error'));

      await expect(bankService.getConnectedBanks()).rejects.toThrow('Database error');
    });
  });

  describe('removeBankConnection', () => {
    it('should remove a bank connection and associated data', async () => {
      const institutionId = 1;
      
      const mockAccounts = [
        { account_id: 'acc_1' },
        { account_id: 'acc_2' }
      ];

      mockDatabase.run.mockResolvedValue(undefined);
      mockDatabase.all.mockResolvedValue(mockAccounts);

      await bankService.removeBankConnection(institutionId);

      // Check that transaction was started
      expect(mockDatabase.run).toHaveBeenCalledWith('BEGIN TRANSACTION');
      
      // Check that accounts were fetched
      expect(mockDatabase.all).toHaveBeenCalledWith(
        'SELECT account_id FROM accounts WHERE institution_id = ?',
        [institutionId]
      );
      
      // Check that transaction was committed
      expect(mockDatabase.run).toHaveBeenCalledWith('COMMIT');
    });

    it('should handle database errors when removing connection', async () => {
      const institutionId = 1;
      
      mockDatabase.run.mockRejectedValue(new Error('Database error'));

      await expect(bankService.removeBankConnection(institutionId)).rejects.toThrow(
        'Database error'
      );
    });

    it('should rollback transaction on error', async () => {
      const institutionId = 1;
      
      mockDatabase.run
        .mockResolvedValueOnce(undefined) // BEGIN TRANSACTION
        .mockRejectedValueOnce(new Error('SQL error')); // First DELETE operation fails
      
      mockDatabase.all.mockResolvedValue([{ account_id: 'acc_1' }]);

      await expect(bankService.removeBankConnection(institutionId)).rejects.toThrow();
      
      expect(mockDatabase.run).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('checkConnectionHealth', () => {
    it('should check health of all connections', async () => {
      const mockInstitutions = [
        {
          id: 1,
          name: 'Healthy Bank',
          access_token: 'access-sandbox-test-token',
          item_id: 'item-1'
        },
        {
          id: 2,
          name: 'Unhealthy Bank',
          access_token: 'access-sandbox-invalid-token',
          item_id: 'item-2'
        }
      ];

      mockDatabase.getInstitutions.mockResolvedValue(mockInstitutions);

      mockPlaidClient.accountsGet
        .mockResolvedValueOnce({ data: { accounts: [] } } as any)
        .mockRejectedValueOnce({ 
          error_code: 'INVALID_ACCESS_TOKEN'
        });

      const result = await bankService.checkConnectionHealth();

      expect(result.healthy).toContain('Healthy Bank');
      expect(result.unhealthy).toHaveLength(1);
      expect(result.unhealthy[0].name).toBe('Unhealthy Bank');
      expect(result.unhealthy[0].error).toBe('INVALID_ACCESS_TOKEN');
    });

    it('should handle case with no institutions', async () => {
      mockDatabase.getInstitutions.mockResolvedValue([]);

      const result = await bankService.checkConnectionHealth();

      expect(result.healthy).toHaveLength(0);
      expect(result.unhealthy).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      mockDatabase.getInstitutions.mockRejectedValue(new Error('Database error'));

      await expect(bankService.checkConnectionHealth()).rejects.toThrow('Database error');
    });
  });

  describe('syncBankData', () => {
    it('should sync data for all connected institutions', async () => {
      const mockInstitutions = [
        {
          id: 1,
          name: 'Test Bank',
          access_token: 'access-sandbox-test-token',
          item_id: 'item-1'
        }
      ];

      mockDatabase.getInstitutions.mockResolvedValue(mockInstitutions);
      mockDatabase.getInstitutionByAccessToken.mockResolvedValue({
        id: 1,
        name: 'Test Bank'
      });

      mockPlaidClient.accountsGet.mockResolvedValue({
        data: {
          accounts: [
            {
              account_id: 'acc_1',
              name: 'Checking',
              type: 'depository',
              subtype: 'checking',
              balances: {
                current: 1000,
                available: 950
              }
            }
          ]
        }
      } as any);

      mockDatabase.saveAccount.mockResolvedValue(undefined);

      const mockTransactionsResponse = {
        data: {
          accounts: [
            {
              account_id: 'acc_1',
              name: 'Checking',
              type: 'depository',
              subtype: 'checking'
            }
          ],
          transactions: [
            {
              transaction_id: 'txn_1',
              account_id: 'acc_1',
              amount: 25.50,
              date: '2023-01-01',
              name: 'Test Purchase',
              category: ['Food and Drink'],
              type: 'place',
              pending: false,
              personal_finance_category: {
                primary: 'FOOD_AND_DRINK',
                detailed: 'FOOD_AND_DRINK_RESTAURANTS'
              }
            }
          ],
          total_transactions: 1
        }
      };

      mockPlaidClient.transactionsGet.mockResolvedValue(mockTransactionsResponse as any);
      mockDatabase.saveTransaction.mockResolvedValue(undefined);

      await bankService.syncBankData();

      expect(mockDatabase.getInstitutions).toHaveBeenCalled();
      expect(mockPlaidClient.accountsGet).toHaveBeenCalled();
      expect(mockPlaidClient.transactionsGet).toHaveBeenCalled();
    });

    it('should handle errors for individual institutions gracefully', async () => {
      const mockInstitutions = [
        {
          id: 1,
          name: 'Test Bank 1',
          access_token: 'access-sandbox-test-token-1',
          item_id: 'item-1'
        },
        {
          id: 2,
          name: 'Test Bank 2',
          access_token: 'access-sandbox-test-token-2',
          item_id: 'item-2'
        }
      ];

      mockDatabase.getInstitutions.mockResolvedValue(mockInstitutions);
      mockPlaidClient.accountsGet
        .mockRejectedValueOnce(new Error('INVALID_ACCESS_TOKEN'))
        .mockResolvedValueOnce({
          data: {
            accounts: []
          }
        } as any);

      await bankService.syncBankData();

      expect(mockDatabase.getInstitutions).toHaveBeenCalled();
      expect(mockPlaidClient.accountsGet).toHaveBeenCalledTimes(2);
    });

    it('should handle case with no institutions', async () => {
      mockDatabase.getInstitutions.mockResolvedValue([]);

      await bankService.syncBankData();

      expect(mockDatabase.getInstitutions).toHaveBeenCalled();
      expect(mockPlaidClient.accountsGet).not.toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('should create instance with default database', () => {
      const service = new BankService();
      expect(service).toBeInstanceOf(BankService);
    });

    it('should create instance with provided database', () => {
      const mockDb = {} as any;
      const service = new BankService(mockDb);
      expect(service).toBeInstanceOf(BankService);
    });
  });
});
