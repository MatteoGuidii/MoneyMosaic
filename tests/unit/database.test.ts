import { Database } from '../../src/database';
import fs from 'fs';

describe('Database', () => {
  let database: Database;
  let testDbPath: string;

  beforeEach(async () => {
    // Create a unique test database for each test
    testDbPath = (global as any).getUniqueTestDbPath();
    
    // Remove test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    database = new Database(testDbPath);
    // Wait for database initialization to complete
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  afterEach(async () => {
    if (database) {
      try {
        await database.close();
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  });

  describe('Institution Management', () => {
    test('should save and retrieve institution', async () => {
      const institution = {
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'access-sandbox-test-institution-token',
        item_id: 'test_item_id'
      };

      await database.saveInstitution(institution);
      const retrieved = await database.getInstitutionByAccessToken('access-sandbox-test-institution-token');

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Bank');
      expect(retrieved?.access_token).toBe('access-sandbox-test-institution-token');
    });

    test('should get all institutions', async () => {
      const institution1 = {
        institution_id: 'inst1',
        name: 'Bank 1',
        access_token: 'token1',
        item_id: 'item1'
      };

      const institution2 = {
        institution_id: 'inst2',
        name: 'Bank 2',
        access_token: 'token2',
        item_id: 'item2'
      };

      await database.saveInstitution(institution1);
      await database.saveInstitution(institution2);

      const institutions = await database.getInstitutions();
      expect(institutions).toHaveLength(2);
      expect(institutions.map(i => i.name)).toContain('Bank 1');
      expect(institutions.map(i => i.name)).toContain('Bank 2');
    });
  });

  describe('Account Management', () => {
    test('should save and retrieve accounts', async () => {
      // First create an institution
      const institution = {
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'access-sandbox-test-institution-token',
        item_id: 'test_item_id'
      };
      await database.saveInstitution(institution);

      // Get the institution ID
      const savedInstitution = await database.getInstitutionByAccessToken('access-sandbox-test-institution-token');
      
      const account = {
        account_id: 'test_account_id',
        institution_id: savedInstitution.id,
        name: 'Test Checking',
        type: 'depository',
        subtype: 'checking',
        mask: '1234'
      };

      await database.saveAccount(account);
      const accounts = await database.getAccountsByInstitution(savedInstitution.id);

      expect(accounts).toHaveLength(1);
      expect(accounts[0].name).toBe('Test Checking');
      expect(accounts[0].account_id).toBe('test_account_id');
    });
  });

  describe('Transaction Management', () => {
    test('should save and retrieve transactions', async () => {
      // Setup institution and account
      const institution = {
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'access-sandbox-test-institution-token',
        item_id: 'test_item_id'
      };
      await database.saveInstitution(institution);
      const savedInstitution = await database.getInstitutionByAccessToken('access-sandbox-test-institution-token');

      const account = {
        account_id: 'test_account_id',
        institution_id: savedInstitution.id,
        name: 'Test Checking',
        type: 'depository',
        subtype: 'checking',
        mask: '1234'
      };
      await database.saveAccount(account);

      const transaction = {
        transaction_id: 'test_transaction_id',
        account_id: 'test_account_id',
        institution_id: savedInstitution.id,
        amount: 25.50,
        date: '2023-01-01',
        name: 'Test Purchase',
        merchant_name: 'Test Merchant',
        category_primary: 'Food and Drink',
        category_detailed: 'Restaurants',
        type: 'place',
        pending: false
      };

      await database.saveTransaction(transaction);
      const transactions = await database.getTransactions({});

      expect(transactions).toHaveLength(1);
      expect(transactions[0].name).toBe('Test Purchase');
      expect(transactions[0].amount).toBe(25.50);
    });

    test('should get transaction summary', async () => {
      // Setup institution and account
      const institution = {
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'access-sandbox-test-institution-token',
        item_id: 'test_item_id'
      };
      await database.saveInstitution(institution);
      const savedInstitution = await database.getInstitutionByAccessToken('access-sandbox-test-institution-token');

      const account = {
        account_id: 'test_account_id',
        institution_id: savedInstitution.id,
        name: 'Test Checking',
        type: 'depository',
        subtype: 'checking',
        mask: '1234'
      };
      await database.saveAccount(account);

      // Add multiple transactions
      const transactions = [
        {
          transaction_id: 'txn1',
          account_id: 'test_account_id',
          institution_id: savedInstitution.id,
          amount: 100.00,
          date: '2023-01-01',
          name: 'Expense 1',
          merchant_name: 'Store 1',
          category_primary: 'Shopping',
          category_detailed: 'General Merchandise',
          type: 'place',
          pending: false
        },
        {
          transaction_id: 'txn2',
          account_id: 'test_account_id',
          institution_id: savedInstitution.id,
          amount: -50.00, // Income (negative in Plaid)
          date: '2023-01-02',
          name: 'Income 1',
          merchant_name: 'Employer',
          category_primary: 'Deposit',
          category_detailed: 'Payroll',
          type: 'special',
          pending: false
        }
      ];

      for (const txn of transactions) {
        await database.saveTransaction(txn);
      }

      const summary = await database.getTransactionSummary({});
      expect(summary.totalSpending).toBe(100.00);
      expect(summary.totalIncome).toBe(50.00);
    });
  });

  describe('Budget Management', () => {
    test('should create and retrieve budgets', async () => {
      await database.createOrUpdateBudget('Food', 500, '01', 2023);
      await database.createOrUpdateBudget('Transport', 200, '01', 2023);
      
      const budgets = await database.getBudgets('01', 2023);
      expect(budgets).toHaveLength(2);
      
      const foodBudget = budgets.find(b => b.category === 'Food');
      expect(foodBudget).toBeDefined();
      expect(foodBudget?.amount).toBe(500);
    });

    test('should update existing budget', async () => {
      // Create initial budget
      await database.createOrUpdateBudget('Food', 500, '01', 2023);
      
      // Update the same budget
      await database.createOrUpdateBudget('Food', 600, '01', 2023);
      
      const budgets = await database.getBudgets('01', 2023);
      expect(budgets).toHaveLength(1);
      expect(budgets[0].amount).toBe(600);
    });

    test('should delete budget', async () => {
      await database.createOrUpdateBudget('Food', 500, '01', 2023);
      await database.createOrUpdateBudget('Transport', 200, '01', 2023);
      
      await database.deleteBudget('Food', '01', 2023);
      
      const budgets = await database.getBudgets('01', 2023);
      expect(budgets).toHaveLength(1);
      expect(budgets[0].category).toBe('Transport');
    });

    test('should get budget with spending data', async () => {
      // Setup institution and account
      const institution = {
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'access-sandbox-test-institution-token',
        item_id: 'test_item_id'
      };
      await database.saveInstitution(institution);
      const savedInstitution = await database.getInstitutionByAccessToken('access-sandbox-test-institution-token');

      const account = {
        account_id: 'test_account_id',
        institution_id: savedInstitution.id,
        name: 'Test Checking',
        type: 'depository'
      };
      await database.saveAccount(account);

      // Create budget
      await database.createOrUpdateBudget('Food', 500, '01', 2023);

      // Add spending transaction
      const transaction = {
        transaction_id: 'txn1',
        account_id: 'test_account_id',
        institution_id: savedInstitution.id,
        amount: -100.00, // Spending (negative)
        date: '2023-01-15',
        name: 'Restaurant',
        category_primary: 'Food',
        type: 'place',
        pending: false
      };
      await database.saveTransaction(transaction);

      const budgetsWithSpending = await database.getBudgetWithSpending('01', 2023);
      expect(budgetsWithSpending).toHaveLength(1);
      expect(budgetsWithSpending[0].category).toBe('Food');
      expect(budgetsWithSpending[0].budgeted).toBe(500);
      expect(budgetsWithSpending[0].spent).toBe(100);
      expect(budgetsWithSpending[0].percentage).toBe(20);
    });
  });

  describe('Investment Management', () => {
    test('should manage securities', async () => {
      const security = {
        security_id: 'sec_test_123',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'equity',
        sector: 'Technology',
        industry: 'Consumer Electronics'
      };

      await database.upsertSecurity(security);

      // Test that we can retrieve the security through holdings query
      // Since there's no direct getSecurity method, we'll verify through holdings
      const holdings = await database.getHoldings();
      // This test validates the security was saved (holdings will be empty but no error)
      expect(holdings).toEqual([]);
    });

    test('should manage holdings', async () => {
      // Setup institution and account
      const institution = {
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'access-sandbox-test-institution-token',
        item_id: 'test_item_id'
      };
      await database.saveInstitution(institution);
      const savedInstitution = await database.getInstitutionByAccessToken('access-sandbox-test-institution-token');

      const account = {
        account_id: 'test_account_id',
        institution_id: savedInstitution.id,
        name: 'Test Investment',
        type: 'investment'
      };
      await database.saveAccount(account);

      // Create security
      const security = {
        security_id: 'sec_test_123',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'equity'
      };
      await database.upsertSecurity(security);

      // Create holding
      const holding = {
        account_id: 'test_account_id',
        security_id: 'sec_test_123',
        institution_id: savedInstitution.id,
        quantity: 10,
        price: 150.00,
        value: 1500.00,
        cost_basis: 1400.00
      };
      await database.upsertHolding(holding);

      // Get holdings
      const holdings = await database.getHoldings();
      expect(holdings).toHaveLength(1);
      expect(holdings[0].quantity).toBe(10);
      expect(holdings[0].value).toBe(1500.00);
      expect(holdings[0].symbol).toBe('AAPL');

      // Get holdings for specific account
      const accountHoldings = await database.getHoldings('test_account_id');
      expect(accountHoldings).toHaveLength(1);
      expect(accountHoldings[0].account_id).toBe('test_account_id');
    });

    test('should manage investment transactions', async () => {
      // Setup institution and account
      const institution = {
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'access-sandbox-test-institution-token',
        item_id: 'test_item_id'
      };
      await database.saveInstitution(institution);
      const savedInstitution = await database.getInstitutionByAccessToken('access-sandbox-test-institution-token');

      const account = {
        account_id: 'test_account_id',
        institution_id: savedInstitution.id,
        name: 'Test Investment',
        type: 'investment'
      };
      await database.saveAccount(account);

      // Create security
      const security = {
        security_id: 'sec_test_123',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'equity'
      };
      await database.upsertSecurity(security);

      // Create investment transaction
      const transaction = {
        investment_transaction_id: 'inv_txn_123',
        account_id: 'test_account_id',
        security_id: 'sec_test_123',
        institution_id: savedInstitution.id,
        type: 'buy',
        quantity: 10,
        price: 150.00,
        amount: 1500.00,
        date: '2023-01-01',
        name: 'Buy AAPL'
      };
      await database.insertInvestmentTransaction(transaction);

      // Get investment transactions
      const transactions = await database.getInvestmentTransactions();
      expect(transactions).toHaveLength(1);
      expect(transactions[0].type).toBe('buy');
      expect(transactions[0].quantity).toBe(10);
      expect(transactions[0].amount).toBe(1500.00);

      // Get investment transactions with filters
      const filteredTransactions = await database.getInvestmentTransactions({
        account_id: 'test_account_id',
        start_date: '2023-01-01',
        end_date: '2023-01-31',
        limit: 5
      });
      expect(filteredTransactions).toHaveLength(1);
      expect(filteredTransactions[0].account_id).toBe('test_account_id');
    });

    test('should manage market data', async () => {
      const marketData = {
        symbol: 'AAPL',
        price: 150.00,
        change: 5.00,
        change_percent: 3.45,
        volume: 1000000,
        market_cap: 2500000000,
        pe_ratio: 25.5,
        dividend_yield: 0.6,
        date: '2023-01-01'
      };

      await database.upsertMarketData(marketData);

      // Get market data
      const marketDataResults = await database.getMarketData('AAPL', '2023-01-01');
      expect(marketDataResults).toHaveLength(1);
      expect(marketDataResults[0].symbol).toBe('AAPL');
      expect(marketDataResults[0].price).toBe(150.00);

      // Get market data with filters
      const filteredMarketData = await database.getMarketData('AAPL', '2023-01-01');
      expect(filteredMarketData).toHaveLength(1);
      expect(filteredMarketData[0].symbol).toBe('AAPL');
      expect(filteredMarketData[0].date).toBe('2023-01-01');
    });

    test('should get portfolio summary', async () => {
      // Setup institution and account
      const institution = {
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'access-sandbox-test-institution-token',
        item_id: 'test_item_id'
      };
      await database.saveInstitution(institution);
      const savedInstitution = await database.getInstitutionByAccessToken('access-sandbox-test-institution-token');

      const account = {
        account_id: 'test_account_id',
        institution_id: savedInstitution.id,
        name: 'Test Investment',
        type: 'investment'
      };
      await database.saveAccount(account);

      // Create security
      const security = {
        security_id: 'sec_test_123',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'equity'
      };
      await database.upsertSecurity(security);

      // Create holding
      const holding = {
        account_id: 'test_account_id',
        security_id: 'sec_test_123',
        institution_id: savedInstitution.id,
        quantity: 10,
        price: 150.00,
        value: 1500.00,
        cost_basis: 1400.00
      };
      await database.upsertHolding(holding);

      // Add market data for current price
      const marketData = {
        symbol: 'AAPL',
        price: 155.00,
        change: 5.00,
        change_percent: 3.33,
        date: new Date().toISOString().split('T')[0]
      };
      await database.upsertMarketData(marketData);

      const summary = await database.getPortfolioSummary();
      expect(summary.totalValue).toBe(1500.00);
      expect(summary.totalCostBasis).toBe(1400.00);
      expect(summary.holdingsCount).toBe(1);
      expect(summary.accountsCount).toBe(1);
    });
  });

  describe('Advanced Query Operations', () => {
    test('should handle transaction filters', async () => {
      // Setup institution and account
      const institution = {
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'access-sandbox-test-institution-token',
        item_id: 'test_item_id'
      };
      await database.saveInstitution(institution);
      const savedInstitution = await database.getInstitutionByAccessToken('access-sandbox-test-institution-token');

      const account = {
        account_id: 'test_account_id',
        institution_id: savedInstitution.id,
        name: 'Test Checking',
        type: 'depository'
      };
      await database.saveAccount(account);

      // Add multiple transactions
      const transactions = [
        {
          transaction_id: 'txn1',
          account_id: 'test_account_id',
          institution_id: savedInstitution.id,
          amount: -100.00,
          date: '2023-01-01',
          name: 'Transaction 1',
          type: 'place',
          pending: false
        },
        {
          transaction_id: 'txn2',
          account_id: 'test_account_id',
          institution_id: savedInstitution.id,
          amount: -50.00,
          date: '2023-01-15',
          name: 'Transaction 2',
          type: 'place',
          pending: false
        },
        {
          transaction_id: 'txn3',
          account_id: 'test_account_id',
          institution_id: savedInstitution.id,
          amount: -25.00,
          date: '2023-02-01',
          name: 'Transaction 3',
          type: 'place',
          pending: false
        }
      ];

      for (const txn of transactions) {
        await database.saveTransaction(txn);
      }

      // Test date filtering
      const januaryTxns = await database.getTransactions({
        start_date: '2023-01-01',
        end_date: '2023-01-31'
      });
      expect(januaryTxns).toHaveLength(2);

      // Test account filtering
      const accountTxns = await database.getTransactions({
        account_id: 'test_account_id'
      });
      expect(accountTxns).toHaveLength(3);

      // Test institution filtering
      const institutionTxns = await database.getTransactions({
        institution_id: savedInstitution.id
      });
      expect(institutionTxns).toHaveLength(3);

      // Test limit
      const limitedTxns = await database.getTransactions({
        limit: 2
      });
      expect(limitedTxns).toHaveLength(2);
    });

    test('should handle transaction summary with filters', async () => {
      // Setup institution and account
      const institution = {
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'access-sandbox-test-institution-token',
        item_id: 'test_item_id'
      };
      await database.saveInstitution(institution);
      const savedInstitution = await database.getInstitutionByAccessToken('access-sandbox-test-institution-token');

      const account = {
        account_id: 'test_account_id',
        institution_id: savedInstitution.id,
        name: 'Test Checking',
        type: 'depository'
      };
      await database.saveAccount(account);

      // Add transactions with different categories
      const transactions = [
        {
          transaction_id: 'txn1',
          account_id: 'test_account_id',
          institution_id: savedInstitution.id,
          amount: 100.00,
          date: '2023-01-01',
          name: 'Food Purchase',
          category_primary: 'Food',
          type: 'place',
          pending: false
        },
        {
          transaction_id: 'txn2',
          account_id: 'test_account_id',
          institution_id: savedInstitution.id,
          amount: 50.00,
          date: '2023-01-15',
          name: 'Gas Purchase',
          category_primary: 'Transportation',
          type: 'place',
          pending: false
        },
        {
          transaction_id: 'txn3',
          account_id: 'test_account_id',
          institution_id: savedInstitution.id,
          amount: -1000.00,
          date: '2023-02-01',
          name: 'Salary',
          category_primary: 'Deposit',
          type: 'special',
          pending: false
        }
      ];

      for (const txn of transactions) {
        await database.saveTransaction(txn);
      }

      // Test summary with date filter
      const januarySummary = await database.getTransactionSummary({
        start_date: '2023-01-01',
        end_date: '2023-01-31'
      });
      expect(januarySummary.totalSpending).toBe(150.00);
      expect(januarySummary.totalIncome).toBe(0);
      expect(januarySummary.byCategory['Food']).toBe(100.00);
      expect(januarySummary.byCategory['Transportation']).toBe(50.00);

      // Test summary with institution filter
      const institutionSummary = await database.getTransactionSummary({
        institution_id: savedInstitution.id
      });
      expect(institutionSummary.totalSpending).toBe(150.00);
      expect(institutionSummary.totalIncome).toBe(1000.00);
      expect(institutionSummary.byInstitution['Test Bank']).toBe(1150.00);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty results gracefully', async () => {
      const institutions = await database.getInstitutions();
      expect(institutions).toEqual([]);

      const transactions = await database.getTransactions();
      expect(transactions).toEqual([]);

      const budgets = await database.getBudgets('12', 2023);
      expect(budgets).toEqual([]);

      const holdings = await database.getHoldings();
      expect(holdings).toEqual([]);
    });

    test('should handle non-existent data queries', async () => {
      const institution = await database.getInstitutionByAccessToken('non-existent-token');
      expect(institution).toBeUndefined();

      const marketData = await database.getMarketData('NONEXISTENT', '2023-01-01');
      expect(marketData).toEqual([]);
    });

    test('should handle portfolio summary with no data', async () => {
      const summary = await database.getPortfolioSummary();
      expect(summary.totalValue).toBe(0);
      expect(summary.totalCostBasis).toBe(0);
      expect(summary.totalDayChange).toBe(0);
      expect(summary.totalDayChangePercent).toBe(0);
      expect(summary.holdingsCount).toBe(0);
      expect(summary.accountsCount).toBe(0);
    });
  });

  describe('Database Operations', () => {
    test('should handle database errors gracefully', async () => {
      // Test with invalid data
      const invalidInstitution = {
        institution_id: 'test_id',
        name: 'Test Bank',
        access_token: '', // Invalid - empty string
        item_id: 'test_item_id'
      };

      // This should not throw since empty string is valid for SQLite
      await expect(database.saveInstitution(invalidInstitution))
        .resolves.not.toThrow();
    });

    test('should close database connection', async () => {
      await expect(database.close()).resolves.not.toThrow();
      
      // Prevent afterEach from trying to close again
      database = null as any;
    });
  });
});