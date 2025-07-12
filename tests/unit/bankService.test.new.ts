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

describe('BankService', () => {
  let bankService: BankService;

  beforeEach(() => {
    jest.clearAllMocks();
    bankService = new BankService();
    
    // Setup date mocks
    mockFormatISO.mockReturnValue('2023-01-01');
    mockSubDays.mockReturnValue(new Date('2023-01-01'));
    
    // Setup console mock to avoid clutter in tests
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

      expect(mockDatabase.saveInstitution).toHaveBeenCalledWith({
        institution_id: 'ins_123',
        name: 'Test Bank',
        access_token: 'access-sandbox-test-token',
        item_id: 'test-item-id'
      });

      expect(mockDatabase.saveAccount).toHaveBeenCalledWith({
        account_id: 'acc_1',
        institution_id: 1,
        name: 'Checking',
        official_name: 'Test Checking Account',
        type: 'depository',
        subtype: 'checking',
        mask: '0000',
        current_balance: 1000,
        available_balance: 950
      });
    });

    it('should handle errors when adding bank connection', async () => {
      const connectionData = {
        public_token: 'public-token-test',
        institution: {
          institution_id: 'ins_123',
          name: 'Test Bank'
        }
      };

      mockPlaidClient.itemPublicTokenExchange.mockRejectedValue(new Error('Plaid error'));

      await expect(bankService.addBankConnection(connectionData)).rejects.toThrow('Plaid error');
    });
  });

  describe('getConnectedBanks', () => {
    it('should return all connected banks', async () => {
      const mockBanks = [
        {
          id: 1,
          institution_id: 'ins_123',
          name: 'Test Bank 1',
          access_token: 'token1',
          item_id: 'item1',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          is_active: 1
        },
        {
          id: 2,
          institution_id: 'ins_456',
          name: 'Test Bank 2',
          access_token: 'token2',
          item_id: 'item2',
          created_at: '2023-01-02',
          updated_at: '2023-01-02',
          is_active: 1
        }
      ];

      mockDatabase.getInstitutions.mockResolvedValue(mockBanks);

      const result = await bankService.getConnectedBanks();

      expect(result).toEqual(mockBanks);
      expect(mockDatabase.getInstitutions).toHaveBeenCalled();
    });
  });

  describe('fetchAllTransactions', () => {
    it('should fetch transactions from all connected banks', async () => {
      const mockInstitutions = [
        {
          id: 1,
          institution_id: 'ins_123',
          name: 'Test Bank',
          access_token: 'access-token-test',
          item_id: 'item_123',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          is_active: 1
        }
      ];

      const mockAccounts = [
        {
          account_id: 'acc_1',
          name: 'Checking',
          type: 'depository',
          subtype: 'checking',
          mask: '0000',
          balances: {
            current: 1000,
            available: 950
          }
        }
      ];

      const mockTransactions = [
        {
          transaction_id: 'txn_1',
          account_id: 'acc_1',
          amount: 25.50,
          date: '2023-01-01',
          name: 'Test Transaction',
          merchant_name: 'Test Merchant',
          category: ['Food and Drink', 'Restaurants'],
          pending: false
        }
      ];

      mockDatabase.getInstitutions.mockResolvedValue(mockInstitutions);
      mockPlaidClient.accountsGet.mockResolvedValue({
        data: { accounts: mockAccounts }
      } as any);
      mockPlaidClient.transactionsGet.mockResolvedValue({
        data: { transactions: mockTransactions }
      } as any);
      mockDatabase.saveAccount.mockResolvedValue(undefined);
      mockDatabase.saveTransaction.mockResolvedValue(undefined);

      const result = await bankService.fetchAllTransactions(30);

      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('summary');
      expect(result.transactions).toHaveLength(1);
      expect(result.summary.totalTransactions).toBe(1);
    });

    it('should return empty results when no institutions are connected', async () => {
      mockDatabase.getInstitutions.mockResolvedValue([]);

      const result = await bankService.fetchAllTransactions(30);

      expect(result).toEqual({
        transactions: [],
        summary: {
          totalTransactions: 0,
          totalSpending: 0,
          totalIncome: 0,
          avgDaily: 0,
          categoriesBreakdown: {}
        }
      });
    });
  });

  describe('checkConnectionHealth', () => {
    it('should return healthy and unhealthy connections', async () => {
      const mockInstitutions = [
        {
          id: 1,
          institution_id: 'ins_123',
          name: 'Test Bank',
          access_token: 'access-token-test',
          item_id: 'item_123',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          is_active: 1
        }
      ];

      mockDatabase.getInstitutions.mockResolvedValue(mockInstitutions);
      mockPlaidClient.accountsGet.mockResolvedValue({
        data: { accounts: [] }
      } as any);

      const result = await bankService.checkConnectionHealth();

      expect(result).toHaveProperty('healthy');
      expect(result).toHaveProperty('unhealthy');
      expect(Array.isArray(result.healthy)).toBe(true);
      expect(Array.isArray(result.unhealthy)).toBe(true);
    });
  });

  describe('removeBankConnection', () => {
    it('should successfully remove a bank connection', async () => {
      const institutionId = 1;

      mockDatabase.run.mockResolvedValue(undefined);

      await bankService.removeBankConnection(institutionId);

      expect(mockDatabase.run).toHaveBeenCalledWith(
        'UPDATE institutions SET is_active = 0 WHERE id = ?',
        [institutionId]
      );
    });
  });

  describe('syncBankData', () => {
    it('should sync bank data for all connected institutions', async () => {
      const mockInstitutions = [
        {
          id: 1,
          institution_id: 'ins_123',
          name: 'Test Bank',
          access_token: 'access-token-test',
          item_id: 'item_123',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          is_active: 1
        }
      ];

      const mockAccounts = [
        {
          account_id: 'acc_1',
          name: 'Checking',
          type: 'depository',
          subtype: 'checking',
          mask: '0000',
          balances: {
            current: 1000,
            available: 950
          }
        }
      ];

      const mockTransactions = [
        {
          transaction_id: 'txn_1',
          account_id: 'acc_1',
          amount: 25.50,
          date: '2023-01-01',
          name: 'Test Transaction',
          merchant_name: 'Test Merchant',
          personal_finance_category: ['Food and Drink', 'Restaurants'],
          pending: false
        }
      ];

      mockDatabase.getInstitutions.mockResolvedValue(mockInstitutions);
      mockPlaidClient.accountsGet.mockResolvedValue({
        data: { accounts: mockAccounts }
      } as any);
      mockPlaidClient.transactionsGet.mockResolvedValue({
        data: { transactions: mockTransactions }
      } as any);
      mockDatabase.saveAccount.mockResolvedValue(undefined);
      mockDatabase.saveTransaction.mockResolvedValue(undefined);

      await bankService.syncBankData();

      expect(mockDatabase.getInstitutions).toHaveBeenCalled();
      expect(mockPlaidClient.accountsGet).toHaveBeenCalled();
      expect(mockPlaidClient.transactionsGet).toHaveBeenCalled();
    });
  });

  describe('isValidAccessToken', () => {
    it('should validate sandbox access tokens', () => {
      const result = bankService['isValidAccessToken']('access-sandbox-test-token');
      expect(result).toBe(true);
    });

    it('should validate development access tokens', () => {
      const result = bankService['isValidAccessToken']('access-development-test-token');
      expect(result).toBe(true);
    });

    it('should validate production access tokens', () => {
      const result = bankService['isValidAccessToken']('access-production-test-token');
      expect(result).toBe(true);
    });

    it('should reject invalid access tokens', () => {
      const result = bankService['isValidAccessToken']('invalid-token-format');
      expect(result).toBe(false);
    });
  });
});
