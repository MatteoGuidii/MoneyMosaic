import { InvestmentService, MarketDataProvider } from '../../src/services/investment.service';
import { plaidClient } from '../../src/plaidClient';
import { database } from '../../src/database';
import { logger } from '../../src/utils/logger';

// Mock all dependencies
jest.mock('../../src/plaidClient');
jest.mock('../../src/database');
jest.mock('../../src/utils/logger');

const mockPlaidClient = plaidClient as jest.Mocked<typeof plaidClient>;
const mockDatabase = database as jest.Mocked<typeof database>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('InvestmentService Comprehensive', () => {
  let investmentService: InvestmentService;
  let mockMarketDataProvider: jest.Mocked<MarketDataProvider>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock market data provider
    mockMarketDataProvider = {
      getQuote: jest.fn(),
      getMultipleQuotes: jest.fn(),
    };
    
    investmentService = new InvestmentService(mockMarketDataProvider);
  });

  describe('initialization', () => {
    it('should create an instance', () => {
      expect(investmentService).toBeDefined();
    });

    it('should initialize with custom market data provider', () => {
      const customProvider = {
        getQuote: jest.fn(),
        getMultipleQuotes: jest.fn(),
      };
      const service = new InvestmentService(customProvider);
      expect(service).toBeDefined();
    });
  });

  describe('checkInvestmentSupport', () => {
    it('should return true for supported investment accounts', async () => {
      mockPlaidClient.accountsGet.mockResolvedValue({
        data: {
          accounts: [
            {
              account_id: 'acc_1',
              type: 'investment',
              subtype: 'brokerage'
            }
          ]
        }
      } as any);

      const result = await investmentService.checkInvestmentSupport('access-token', 1);
      
      expect(result).toBe(true);
      expect(mockPlaidClient.accountsGet).toHaveBeenCalledWith({
        access_token: 'access-token'
      });
    });

    it('should return false for unsupported accounts', async () => {
      mockPlaidClient.accountsGet.mockResolvedValue({
        data: {
          accounts: [
            {
              account_id: 'acc_1',
              type: 'depository',
              subtype: 'checking'
            }
          ]
        }
      } as any);

      const result = await investmentService.checkInvestmentSupport('access-token', 1);
      
      expect(result).toBe(false);
    });

    it('should handle errors and return false', async () => {
      mockPlaidClient.accountsGet.mockRejectedValue(new Error('API error'));

      const result = await investmentService.checkInvestmentSupport('access-token', 1);
      
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error checking investment support for institution 1:',
        expect.any(Error)
      );
    });
  });

  describe('syncInvestmentData', () => {
    beforeEach(() => {
      // Reset all mocks before each test to prevent carryover
      jest.clearAllMocks();
    });

    it('should sync investment data successfully', async () => {
      const mockAccountsResponse = {
        data: {
          accounts: [
            {
              account_id: 'acc_1',
              type: 'investment',
              subtype: 'brokerage'
            }
          ]
        }
      };

      const mockSecurities = [
        {
          security_id: 'sec_1',
          isin: 'US0378331005',
          cusip: '037833100',
          ticker_symbol: 'AAPL',
          name: 'Apple Inc.',
          type: 'equity',
          market_identifier_code: 'XNAS',
          sector: 'Technology',
          industry: 'Consumer Electronics'
        }
      ];

      const mockHoldings = [
        {
          account_id: 'acc_1',
          security_id: 'sec_1',
          institution_value: 15000,
          institution_price: 150.00,
          quantity: 100,
          cost_basis: 14000
        }
      ];

      const mockTransactions = [
        {
          investment_transaction_id: 'inv_txn_1',
          account_id: 'acc_1',
          security_id: 'sec_1',
          type: 'buy',
          subtype: 'buy',
          quantity: 100,
          price: 150.00,
          fees: 1.00,
          amount: 15001.00,
          date: '2023-01-01',
          name: 'Buy AAPL'
        }
      ];

      mockPlaidClient.accountsGet.mockResolvedValue(mockAccountsResponse as any);
      mockPlaidClient.investmentsHoldingsGet.mockResolvedValue({
        data: {
          securities: mockSecurities,
          holdings: mockHoldings
        }
      } as any);
      mockPlaidClient.investmentsTransactionsGet.mockResolvedValue({
        data: {
          investment_transactions: mockTransactions
        }
      } as any);
      mockDatabase.upsertSecurity.mockResolvedValue(undefined);
      mockDatabase.upsertHolding.mockResolvedValue(undefined);
      mockDatabase.insertInvestmentTransaction.mockResolvedValue(undefined);
      mockMarketDataProvider.getMultipleQuotes.mockResolvedValue([]);

      await investmentService.syncInvestmentData('access-token', 1);

      expect(mockPlaidClient.accountsGet).toHaveBeenCalledWith({
        access_token: 'access-token'
      });
      expect(mockPlaidClient.investmentsHoldingsGet).toHaveBeenCalledWith({
        access_token: 'access-token'
      });
      expect(mockPlaidClient.investmentsTransactionsGet).toHaveBeenCalledWith({
        access_token: 'access-token',
        start_date: expect.any(String),
        end_date: expect.any(String)
      });
      expect(mockDatabase.upsertSecurity).toHaveBeenCalledTimes(1);
      expect(mockDatabase.upsertHolding).toHaveBeenCalledTimes(1);
      expect(mockDatabase.insertInvestmentTransaction).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during sync', async () => {
      mockPlaidClient.accountsGet.mockRejectedValue(new Error('Plaid API error'));

      await expect(investmentService.syncInvestmentData('access-token', 1)).rejects.toThrow('Plaid API error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error syncing investment data:',
        expect.any(Error)
      );
    });

    it('should handle missing securities data', async () => {
      const mockAccountsResponse = {
        data: {
          accounts: [
            {
              account_id: 'acc_1',
              type: 'investment',
              subtype: 'brokerage'
            }
          ]
        }
      };

      mockPlaidClient.accountsGet.mockResolvedValue(mockAccountsResponse as any);
      mockPlaidClient.investmentsHoldingsGet.mockResolvedValue({
        data: {
          securities: [],
          holdings: []
        }
      } as any);
      mockPlaidClient.investmentsTransactionsGet.mockResolvedValue({
        data: {
          investment_transactions: []
        }
      } as any);

      await investmentService.syncInvestmentData('access-token', 1);

      expect(mockPlaidClient.accountsGet).toHaveBeenCalled();
      expect(mockPlaidClient.investmentsHoldingsGet).toHaveBeenCalled();
      expect(mockPlaidClient.investmentsTransactionsGet).toHaveBeenCalled();
      expect(mockDatabase.upsertSecurity).not.toHaveBeenCalled();
      expect(mockDatabase.upsertHolding).not.toHaveBeenCalled();
      expect(mockDatabase.insertInvestmentTransaction).not.toHaveBeenCalled();
    });

    it('should handle no investment accounts', async () => {
      const mockAccountsResponse = {
        data: {
          accounts: [
            {
              account_id: 'acc_1',
              type: 'depository',
              subtype: 'checking'
            }
          ]
        }
      };

      mockPlaidClient.accountsGet.mockResolvedValue(mockAccountsResponse as any);

      await investmentService.syncInvestmentData('access-token', 1);

      expect(mockPlaidClient.accountsGet).toHaveBeenCalled();
      expect(mockPlaidClient.investmentsHoldingsGet).not.toHaveBeenCalled();
    });
  });

  describe('updateMarketData', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update market data for provided symbols', async () => {
      const mockMarketData = [
        {
          symbol: 'AAPL',
          price: 155.00,
          change: 5.00,
          change_percent: 3.33,
          volume: 1000000,
          market_cap: 2500000000000,
          pe_ratio: 25.5,
          dividend_yield: 0.5,
          fifty_two_week_high: 180.00,
          fifty_two_week_low: 120.00,
          sector: 'Technology',
          industry: 'Consumer Electronics'
        }
      ];

      mockMarketDataProvider.getMultipleQuotes.mockResolvedValue(mockMarketData);
      mockDatabase.upsertMarketData.mockResolvedValue(undefined);

      await investmentService.updateMarketData(['AAPL']);

      expect(mockMarketDataProvider.getMultipleQuotes).toHaveBeenCalledWith(['AAPL']);
      expect(mockDatabase.upsertMarketData).toHaveBeenCalledWith({
        ...mockMarketData[0],
        date: expect.any(String)
      });
    });

    it('should handle errors during market data update', async () => {
      mockMarketDataProvider.getMultipleQuotes.mockRejectedValue(new Error('API error'));

      await expect(investmentService.updateMarketData(['AAPL'])).rejects.toThrow('API error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error updating market data:',
        expect.any(Error)
      );
    });

    it('should handle empty symbol list', async () => {
      mockMarketDataProvider.getMultipleQuotes.mockResolvedValue([]);

      await investmentService.updateMarketData([]);

      expect(mockMarketDataProvider.getMultipleQuotes).toHaveBeenCalledWith([]);
      expect(mockDatabase.upsertMarketData).not.toHaveBeenCalled();
    });
  });

  describe('getInvestmentSummary', () => {
    it('should return investment summary', async () => {
      const mockSummary = {
        totalValue: 100000,
        totalCostBasis: 90000,
        totalDayChange: 2000,
        totalDayChangePercent: 2.0,
        holdingsCount: 5,
        accountsCount: 2
      };

      const mockHoldings = [
        {
          id: 1,
          account_id: 'acc_1',
          security_id: 'sec_1',
          institution_id: 1,
          quantity: 100,
          price: 150.00,
          value: 15000,
          cost_basis: 14000,
          symbol: 'AAPL',
          security_name: 'Apple Inc.',
          security_type: 'equity',
          sector: 'Technology',
          industry: 'Consumer Electronics',
          account_name: 'Investment Account',
          institution_name: 'Test Bank',
          current_price: 155.00,
          day_change: 5.00,
          day_change_percent: 3.33
        }
      ];

      mockDatabase.getPortfolioSummary.mockResolvedValue(mockSummary);
      mockDatabase.getHoldings.mockResolvedValue(mockHoldings);

      const result = await investmentService.getInvestmentSummary();

      expect(result).toHaveProperty('totalValue');
      expect(result).toHaveProperty('totalCostBasis');
      expect(result).toHaveProperty('totalDayChange');
      expect(result).toHaveProperty('totalDayChangePercent');
      expect(result).toHaveProperty('holdingsCount');
      expect(result).toHaveProperty('accountsCount');
      expect(result).toHaveProperty('topHoldings');
      expect(result).toHaveProperty('sectorAllocation');
      expect(result.topHoldings).toEqual(mockHoldings.slice(0, 5));
      expect(result.sectorAllocation).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            sector: 'Technology',
            value: 15000,
            percentage: expect.any(Number)
          })
        ])
      );
    });

    it('should handle errors during summary generation', async () => {
      mockDatabase.getPortfolioSummary.mockRejectedValue(new Error('Database error'));

      await expect(investmentService.getInvestmentSummary()).rejects.toThrow('Database error');
    });
  });

  describe('getDetailedHoldings', () => {
    it('should return detailed holdings', async () => {
      const mockHoldings = [
        {
          id: 1,
          account_id: 'acc_1',
          security_id: 'sec_1',
          institution_id: 1,
          quantity: 100,
          price: 150.00,
          value: 15000,
          cost_basis: 14000,
          symbol: 'AAPL',
          security_name: 'Apple Inc.',
          security_type: 'equity',
          sector: 'Technology',
          industry: 'Consumer Electronics',
          account_name: 'Investment Account',
          institution_name: 'Test Bank',
          current_price: 155.00,
          day_change: 5.00,
          day_change_percent: 3.33
        }
      ];

      mockDatabase.getHoldings.mockResolvedValue(mockHoldings);

      const result = await investmentService.getDetailedHoldings();

      expect(result).toEqual(mockHoldings);
      expect(mockDatabase.getHoldings).toHaveBeenCalled();
    });

    it('should handle errors and rethrow them', async () => {
      mockDatabase.getHoldings.mockRejectedValue(new Error('Database error'));

      await expect(investmentService.getDetailedHoldings()).rejects.toThrow('Database error');
    });
  });

  describe('getInvestmentTransactions', () => {
    it('should return investment transactions', async () => {
      const mockTransactions = [
        {
          id: 1,
          investment_transaction_id: 'inv_txn_1',
          account_id: 'acc_1',
          security_id: 'sec_1',
          institution_id: 1,
          type: 'buy',
          subtype: 'buy',
          quantity: 100,
          price: 150.00,
          fees: 1.00,
          amount: 15001.00,
          date: '2023-01-01',
          name: 'Buy AAPL',
          symbol: 'AAPL',
          security_name: 'Apple Inc.',
          account_name: 'Investment Account',
          institution_name: 'Test Bank'
        }
      ];

      const filters = {
        account_id: 'acc_1',
        start_date: '2023-01-01',
        end_date: '2023-01-31',
        limit: 10
      };

      mockDatabase.getInvestmentTransactions.mockResolvedValue(mockTransactions);

      const result = await investmentService.getInvestmentTransactions(filters);

      expect(result).toEqual(mockTransactions);
      expect(mockDatabase.getInvestmentTransactions).toHaveBeenCalledWith(filters);
    });

    it('should handle errors and rethrow them', async () => {
      mockDatabase.getInvestmentTransactions.mockRejectedValue(new Error('Database error'));

      await expect(investmentService.getInvestmentTransactions({})).rejects.toThrow('Database error');
    });
  });

  describe('refreshAllMarketData', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should refresh market data for all holdings', async () => {
      const mockHoldings = [
        {
          id: 1,
          account_id: 'acc_1',
          security_id: 'sec_1',
          institution_id: 1,
          quantity: 100,
          price: 150.00,
          value: 15000,
          cost_basis: 14000,
          symbol: 'AAPL',
          security_name: 'Apple Inc.',
          security_type: 'equity',
          sector: 'Technology',
          industry: 'Consumer Electronics',
          account_name: 'Investment Account',
          institution_name: 'Test Bank',
          current_price: 155.00,
          day_change: 5.00,
          day_change_percent: 3.33
        }
      ];

      const mockQuotes = [
        {
          symbol: 'AAPL',
          price: 160.00,
          change: 5.00,
          change_percent: 3.23,
          volume: 1000000,
          market_cap: 2500000000000,
          pe_ratio: 25.5,
          dividend_yield: 0.5,
          fifty_two_week_high: 180.00,
          fifty_two_week_low: 120.00,
          sector: 'Technology',
          industry: 'Consumer Electronics'
        }
      ];

      mockDatabase.getHoldings.mockResolvedValue(mockHoldings);
      mockMarketDataProvider.getMultipleQuotes.mockResolvedValue(mockQuotes);

      await investmentService.refreshAllMarketData();

      expect(mockDatabase.getHoldings).toHaveBeenCalled();
      expect(mockMarketDataProvider.getMultipleQuotes).toHaveBeenCalledWith(['AAPL']);
    });

    it('should handle errors during refresh', async () => {
      mockDatabase.getHoldings.mockRejectedValue(new Error('Database error'));

      await expect(investmentService.refreshAllMarketData()).rejects.toThrow('Database error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error refreshing market data:',
        expect.any(Error)
      );
    });

    it('should handle empty holdings', async () => {
      mockDatabase.getHoldings.mockResolvedValue([]);

      await investmentService.refreshAllMarketData();

      expect(mockDatabase.getHoldings).toHaveBeenCalled();
      expect(mockMarketDataProvider.getMultipleQuotes).not.toHaveBeenCalled();
    });
  });

  describe('getInvestmentSupportStatus', () => {
    it('should return investment support status', async () => {
      const mockInstitutions = [
        {
          id: 1,
          access_token: 'access-sandbox-test-token',
          name: 'Test Bank'
        }
      ];

      mockDatabase.all.mockResolvedValue(mockInstitutions);
      mockPlaidClient.accountsGet.mockResolvedValue({
        data: {
          accounts: [
            {
              account_id: 'acc_1',
              type: 'investment',
              subtype: 'brokerage'
            }
          ]
        }
      } as any);

      const result = await investmentService.getInvestmentSupportStatus();

      expect(result).toHaveProperty('supportedInstitutions');
      expect(result).toHaveProperty('unsupportedInstitutions');
      expect(result).toHaveProperty('totalInstitutions');
      expect(result).toHaveProperty('details');
      expect(result.details).toHaveLength(1);
      expect(result.details[0]).toHaveProperty('institutionId');
      expect(result.details[0]).toHaveProperty('institutionName');
      expect(result.details[0]).toHaveProperty('supportsInvestments');
      expect(result.details[0]).toHaveProperty('hasInvestmentAccounts');
    });

    it('should handle errors and return default status', async () => {
      mockDatabase.all.mockRejectedValue(new Error('Database error'));

      await expect(investmentService.getInvestmentSupportStatus()).rejects.toThrow('Database error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error getting investment support status:',
        expect.any(Error)
      );
    });
  });
});
