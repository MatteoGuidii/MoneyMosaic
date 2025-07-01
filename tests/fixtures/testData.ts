// Test data fixtures for MoneyMosaic tests

export const mockInstitution = {
  institution_id: 'test_institution_id',
  name: 'Test Bank',
  access_token: 'test_access_token',
  item_id: 'test_item_id'
};

export const mockAccount = {
  account_id: 'test_account_id',
  institution_id: 1,
  name: 'Test Checking',
  official_name: 'Test Checking Account',
  type: 'depository',
  subtype: 'checking',
  mask: '1234',
  current_balance: 1000.00,
  available_balance: 950.00
};

export const mockTransaction = {
  transaction_id: 'test_transaction_id',
  account_id: 'test_account_id',
  institution_id: 1,
  amount: 25.50,
  date: '2023-01-01',
  name: 'Test Purchase',
  merchant_name: 'Test Merchant',
  category_primary: 'Food and Drink',
  category_detailed: 'Restaurants',
  type: 'place',
  pending: false
};

export const mockPlaidLinkTokenResponse = {
  data: {
    link_token: 'test_link_token_12345',
    expiration: '2024-01-01T00:00:00Z'
  }
};

export const mockPlaidExchangeResponse = {
  data: {
    access_token: 'test_access_token',
    item_id: 'test_item_id'
  }
};

export const mockPlaidAccountsResponse = {
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
          available: 950.00
        }
      }
    ]
  }
};

export const mockPlaidTransactionsResponse = {
  data: {
    accounts: [
      {
        account_id: 'test_account_id',
        name: 'Test Checking',
        type: 'depository',
        subtype: 'checking'
      }
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
        personal_finance_category: 'Food and Drink'
      },
      {
        transaction_id: 'txn_2',
        account_id: 'test_account_id',
        amount: -1000.00, // Income (negative in Plaid)
        date: '2023-01-02',
        name: 'Salary Deposit',
        merchant_name: 'Employer Corp',
        category: ['Deposit'],
        type: 'special',
        pending: false,
        personal_finance_category: 'Deposit'
      }
    ],
    total_transactions: 2
  }
};

export const mockPlaidSandboxResponse = {
  data: {
    public_token: 'test_sandbox_public_token'
  }
};

export const testInstitutions = [
  {
    institution_id: 'ins_109508',
    name: 'Chase Bank',
    access_token: 'test_access_token_chase',
    item_id: 'test_item_id_chase'
  },
  {
    institution_id: 'ins_109511',
    name: 'Bank of America',
    access_token: 'test_access_token_boa',
    item_id: 'test_item_id_boa'
  }
];

export const testAccounts = [
  {
    account_id: 'chase_checking_001',
    institution_id: 1,
    name: 'Chase Checking',
    type: 'depository',
    subtype: 'checking',
    mask: '0001',
    current_balance: 2500.00,
    available_balance: 2450.00
  },
  {
    account_id: 'chase_savings_002',
    institution_id: 1,
    name: 'Chase Savings',
    type: 'depository',
    subtype: 'savings',
    mask: '0002',
    current_balance: 10000.00,
    available_balance: 10000.00
  }
];

export const testTransactions = [
  {
    transaction_id: 'txn_food_001',
    account_id: 'chase_checking_001',
    institution_id: 1,
    amount: 15.75,
    date: '2023-12-01',
    name: 'Starbucks Coffee',
    merchant_name: 'Starbucks',
    category_primary: 'Food and Drink',
    category_detailed: 'Coffee',
    type: 'place',
    pending: false
  },
  {
    transaction_id: 'txn_gas_001',
    account_id: 'chase_checking_001',
    institution_id: 1,
    amount: 45.20,
    date: '2023-12-02',
    name: 'Shell Gas Station',
    merchant_name: 'Shell',
    category_primary: 'Transportation',
    category_detailed: 'Gas Stations',
    type: 'place',
    pending: false
  },
  {
    transaction_id: 'txn_salary_001',
    account_id: 'chase_checking_001',
    institution_id: 1,
    amount: -3000.00, // Income (negative in Plaid)
    date: '2023-12-01',
    name: 'Salary Deposit',
    merchant_name: 'ACME Corp',
    category_primary: 'Deposit',
    category_detailed: 'Payroll',
    type: 'special',
    pending: false
  }
];

export const createTestDatabase = async (dbPath: string) => {
  const { Database } = await import('../../src/database');
  return new Database(dbPath);
};

export const seedTestData = async (database: any) => {
  // Add test institutions
  for (const institution of testInstitutions) {
    await database.saveInstitution(institution);
  }

  // Add test accounts
  for (const account of testAccounts) {
    await database.saveAccount(account);
  }

  // Add test transactions
  for (const transaction of testTransactions) {
    await database.saveTransaction(transaction);
  }
};
