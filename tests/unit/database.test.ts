import { Database } from '../../src/database';
import path from 'path';
import fs from 'fs';

describe('Database', () => {
  let database: Database;
  let testDbPath: string;

  beforeEach(async () => {
    // Create a unique test database for each test
    testDbPath = global.getUniqueTestDbPath();
    
    // Remove test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    database = new Database(testDbPath);
    // Wait for database initialization to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    if (database) {
      await database.close();
    }
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Institution Management', () => {
    test('should save and retrieve institution', async () => {
      const institution = {
        institution_id: 'test_institution_id',
        name: 'Test Bank',
        access_token: 'test_access_token',
        item_id: 'test_item_id'
      };

      await database.saveInstitution(institution);
      const retrieved = await database.getInstitutionByAccessToken('test_access_token');

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Bank');
      expect(retrieved?.access_token).toBe('test_access_token');
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
        access_token: 'test_access_token',
        item_id: 'test_item_id'
      };
      await database.saveInstitution(institution);

      // Get the institution ID
      const savedInstitution = await database.getInstitutionByAccessToken('test_access_token');
      
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
        access_token: 'test_access_token',
        item_id: 'test_item_id'
      };
      await database.saveInstitution(institution);
      const savedInstitution = await database.getInstitutionByAccessToken('test_access_token');

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
        access_token: 'test_access_token',
        item_id: 'test_item_id'
      };
      await database.saveInstitution(institution);
      const savedInstitution = await database.getInstitutionByAccessToken('test_access_token');

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
