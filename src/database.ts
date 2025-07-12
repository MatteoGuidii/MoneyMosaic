import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Enable verbose mode for better debugging
const sqlite = sqlite3.verbose();

export class Database {
  private db: sqlite3.Database;
  private initialized: Promise<void>;
  private isInitialized: boolean = false;
  private isClosed: boolean = false;

  constructor(dbPath: string = path.join(__dirname, '../data/moneymosaic.db')) {
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.db = new sqlite.Database(dbPath);
    this.initialized = this.init();
  }

  private async init(): Promise<void> {
    try {
      // Use AbortController for proper cleanup
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased timeout
      
      try {
        await this.createTables();
        clearTimeout(timeoutId);
        this.isInitialized = true;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    // Direct database operations without ensureInitialized to avoid circular dependency
    try {
      console.log('Creating institutions table...');
      await this.runDirect(`
        CREATE TABLE IF NOT EXISTS institutions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          institution_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          access_token TEXT NOT NULL,
          item_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1
        )
      `);

      console.log('Creating accounts table...');
      await this.runDirect(`
        CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          account_id TEXT UNIQUE NOT NULL,
          institution_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          official_name TEXT,
          type TEXT NOT NULL,
          subtype TEXT,
          mask TEXT,
          current_balance REAL,
          available_balance REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institution_id) REFERENCES institutions (id)
        )
      `);

      console.log('Creating transactions table...');
      await this.runDirect(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transaction_id TEXT UNIQUE NOT NULL,
          account_id TEXT NOT NULL,
          institution_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          date TEXT NOT NULL,
          name TEXT NOT NULL,
          merchant_name TEXT,
          category_primary TEXT,
          category_detailed TEXT,
          type TEXT NOT NULL,
          pending BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institution_id) REFERENCES institutions (id)
        )
      `);

      await this.runDirect(`
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      `);

      await this.runDirect(`
        CREATE INDEX IF NOT EXISTS idx_transactions_date_category ON transactions(date, category_primary);
      `);

      await this.runDirect(`
        CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
      `);

      await this.runDirect(`
        CREATE INDEX IF NOT EXISTS idx_transactions_institution ON transactions(institution_id);
      `);

      console.log('Creating budgets table...');
      await this.runDirect(`
        CREATE TABLE IF NOT EXISTS budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          amount REAL NOT NULL,
          month TEXT NOT NULL,
          year INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(category, month, year)
        )
      `);

      await this.runDirect(`
        CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(year, month);
      `);

      await this.runDirect(`
        CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
      `);

      // Investment tables
      console.log('Creating securities table...');
      await this.runDirect(`
        CREATE TABLE IF NOT EXISTS securities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          security_id TEXT UNIQUE NOT NULL,
          isin TEXT,
          cusip TEXT,
          symbol TEXT,
          name TEXT,
          type TEXT,
          market_identifier_code TEXT,
          sector TEXT,
          industry TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('Creating holdings table...');
      await this.runDirect(`
        CREATE TABLE IF NOT EXISTS holdings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          account_id TEXT NOT NULL,
          security_id TEXT NOT NULL,
          institution_id INTEGER NOT NULL,
          quantity REAL NOT NULL,
          price REAL NOT NULL,
          value REAL NOT NULL,
          cost_basis REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institution_id) REFERENCES institutions (id),
          FOREIGN KEY (security_id) REFERENCES securities (security_id),
          UNIQUE(account_id, security_id)
        )
      `);

      console.log('Creating investment_transactions table...');
      await this.runDirect(`
        CREATE TABLE IF NOT EXISTS investment_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          investment_transaction_id TEXT UNIQUE NOT NULL,
          account_id TEXT NOT NULL,
          security_id TEXT,
          institution_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          subtype TEXT,
          quantity REAL,
          price REAL,
          fees REAL,
          amount REAL NOT NULL,
          date TEXT NOT NULL,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institution_id) REFERENCES institutions (id),
          FOREIGN KEY (security_id) REFERENCES securities (security_id)
        )
      `);

      console.log('Creating market_data table...');
      await this.runDirect(`
        CREATE TABLE IF NOT EXISTS market_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          symbol TEXT NOT NULL,
          price REAL NOT NULL,
          change REAL,
          change_percent REAL,
          volume INTEGER,
          market_cap REAL,
          pe_ratio REAL,
          dividend_yield REAL,
          fifty_two_week_high REAL,
          fifty_two_week_low REAL,
          sector TEXT,
          industry TEXT,
          date TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(symbol, date)
        )
      `);

      // Create indexes for investment tables
      await this.runDirect(`
        CREATE INDEX IF NOT EXISTS idx_holdings_account ON holdings(account_id);
      `);

      await this.runDirect(`
        CREATE INDEX IF NOT EXISTS idx_holdings_security ON holdings(security_id);
      `);

      await this.runDirect(`
        CREATE INDEX IF NOT EXISTS idx_investment_transactions_account ON investment_transactions(account_id);
      `);

      await this.runDirect(`
        CREATE INDEX IF NOT EXISTS idx_investment_transactions_date ON investment_transactions(date);
      `);

      await this.runDirect(`
        CREATE INDEX IF NOT EXISTS idx_securities_symbol ON securities(symbol);
      `);

      await this.runDirect(`
        CREATE INDEX IF NOT EXISTS idx_market_data_symbol_date ON market_data(symbol, date);
      `);

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating database tables:', error);
      throw error;
    }
  }

  // Ensure database is initialized before operations
  private async ensureInitialized(): Promise<void> {
    if (this.isClosed) {
      throw new Error('Database connection is closed');
    }
    if (!this.isInitialized) {
      await this.initialized;
    }
  }

  // Close database connection
  public async close(): Promise<void> {
    if (this.isClosed) {
      return; // Already closed
    }
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else {
          this.isClosed = true;
          resolve();
        }
      });
    });
  }

  // Clean all data from database (useful for sandbox cleanup)
  public async cleanAllData(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      console.log('Cleaning all data from database...');
      
      // Delete in reverse order of dependencies to avoid foreign key constraints
      await this.run('DELETE FROM market_data');
      await this.run('DELETE FROM investment_transactions');
      await this.run('DELETE FROM holdings');
      await this.run('DELETE FROM securities');
      await this.run('DELETE FROM budgets');
      await this.run('DELETE FROM transactions');
      await this.run('DELETE FROM accounts');
      await this.run('DELETE FROM institutions');
      
      // Reset auto-increment counters
      await this.run("UPDATE sqlite_sequence SET seq = 0 WHERE name IN ('institutions', 'accounts', 'transactions', 'budgets', 'securities', 'holdings', 'investment_transactions', 'market_data')");
      
      console.log('Database cleaned successfully - all data removed');
    } catch (error) {
      console.error('Error cleaning database:', error);
      throw error;
    }
  }

  // Promisify database methods for async/await
  // Direct method that doesn't wait for initialization (used during initialization)
  private async runDirect(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if database is still available
      if (!this.db) {
        reject(new Error('Database is not initialized'));
        return;
      }
      
      try {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async run(sql: string, params: any[] = []): Promise<void> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  public async get(sql: string, params: any[] = []): Promise<any> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  public async all(sql: string, params: any[] = []): Promise<any[]> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Institution methods
  async saveInstitution(data: {
    institution_id: string;
    name: string;
    access_token: string;
    item_id: string;
  }) {
    await this.run(`
      INSERT OR REPLACE INTO institutions 
      (institution_id, name, access_token, item_id, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [data.institution_id, data.name, data.access_token, data.item_id]);
  }

  async getInstitutions(): Promise<any[]> {
    return this.all(`
      SELECT * FROM institutions 
      WHERE is_active = 1 
      ORDER BY created_at DESC
    `);
  }

  async getInstitutionByAccessToken(access_token: string): Promise<any> {
    return this.get(`
      SELECT * FROM institutions 
      WHERE access_token = ? AND is_active = 1
    `, [access_token]);
  }

  // Account methods
  async saveAccount(data: {
    account_id: string;
    institution_id: number;
    name: string;
    official_name?: string;
    type: string;
    subtype?: string;
    mask?: string;
    current_balance?: number;
    available_balance?: number;
  }) {
    await this.run(`
      INSERT OR REPLACE INTO accounts 
      (account_id, institution_id, name, official_name, type, subtype, mask, current_balance, available_balance, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      data.account_id,
      data.institution_id,
      data.name,
      data.official_name,
      data.type,
      data.subtype,
      data.mask,
      data.current_balance,
      data.available_balance
    ]);
  }

  async getAccountsByInstitution(institution_id: number): Promise<any[]> {
    return this.all(`
      SELECT * FROM accounts 
      WHERE institution_id = ? 
      ORDER BY created_at DESC
    `, [institution_id]);
  }

  // Transaction methods
  async saveTransaction(data: {
    transaction_id: string;
    account_id: string;
    institution_id: number;
    amount: number;
    date: string;
    name: string;
    merchant_name?: string;
    category_primary?: string;
    category_detailed?: string;
    type: string;
    pending: boolean;
  }) {
    await this.run(`
      INSERT OR REPLACE INTO transactions 
      (transaction_id, account_id, institution_id, amount, date, name, merchant_name, 
       category_primary, category_detailed, type, pending, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      data.transaction_id,
      data.account_id,
      data.institution_id,
      data.amount,
      data.date,
      data.name,
      data.merchant_name,
      data.category_primary,
      data.category_detailed,
      data.type,
      data.pending ? 1 : 0
    ]);
  }

  async updateTransaction(transaction_id: string, data: {
    amount: number;
    date: string;
    name: string;
    merchant_name?: string;
    category_primary?: string;
    category_detailed?: string;
    type: string;
    pending: boolean;
  }) {
    await this.run(`
      UPDATE transactions 
      SET amount = ?, date = ?, name = ?, merchant_name = ?, 
          category_primary = ?, category_detailed = ?, type = ?, pending = ?, updated_at = CURRENT_TIMESTAMP
      WHERE transaction_id = ?
    `, [
      data.amount,
      data.date,
      data.name,
      data.merchant_name,
      data.category_primary,
      data.category_detailed,
      data.type,
      data.pending ? 1 : 0,
      transaction_id
    ]);
  }

  async deleteTransaction(transaction_id: string) {
    await this.run(`
      DELETE FROM transactions WHERE transaction_id = ?
    `, [transaction_id]);
  }

  async getTransactions(filters: {
    institution_id?: number;
    account_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  } = {}): Promise<any[]> {
    let sql = `
      SELECT t.*, i.name as institution_name, a.name as account_name
      FROM transactions t
      JOIN institutions i ON t.institution_id = i.id
      JOIN accounts a ON t.account_id = a.account_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.institution_id) {
      sql += ' AND t.institution_id = ?';
      params.push(filters.institution_id);
    }

    if (filters.account_id) {
      sql += ' AND t.account_id = ?';
      params.push(filters.account_id);
    }

    if (filters.start_date) {
      sql += ' AND t.date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      sql += ' AND t.date <= ?';
      params.push(filters.end_date);
    }

    sql += ' ORDER BY t.date DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    return this.all(sql, params);
  }

  async getTransactionSummary(filters: {
    start_date?: string;
    end_date?: string;
    institution_id?: number;
  } = {}): Promise<{
    totalSpending: number;
    totalIncome: number;
    byCategory: { [key: string]: number };
    byInstitution: { [key: string]: number };
  }> {
    let sql = `
      SELECT 
        type,
        category_primary,
        institution_name,
        SUM(ABS(amount)) as total
      FROM (
        SELECT 
          CASE WHEN amount > 0 THEN 'spending' ELSE 'income' END as type,
          category_primary,
          i.name as institution_name,
          amount
        FROM transactions t
        JOIN institutions i ON t.institution_id = i.id
        WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.start_date) {
      sql += ' AND t.date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      sql += ' AND t.date <= ?';
      params.push(filters.end_date);
    }

    if (filters.institution_id) {
      sql += ' AND t.institution_id = ?';
      params.push(filters.institution_id);
    }

    sql += `
      ) GROUP BY type, category_primary, institution_name
    `;

    const rows = await this.all(sql, params);

    const summary = {
      totalSpending: 0,
      totalIncome: 0,
      byCategory: {} as { [key: string]: number },
      byInstitution: {} as { [key: string]: number }
    };

    rows.forEach(row => {
      if (row.type === 'spending') {
        summary.totalSpending += row.total;
      } else {
        summary.totalIncome += row.total;
      }

      if (row.category_primary) {
        summary.byCategory[row.category_primary] = (summary.byCategory[row.category_primary] || 0) + row.total;
      }

      summary.byInstitution[row.institution_name] = (summary.byInstitution[row.institution_name] || 0) + row.total;
    });

    return summary;
  }

  // Budget management methods
  async createOrUpdateBudget(category: string, amount: number, month: string, year: number): Promise<void> {
    await this.ensureInitialized();
    await this.run(`
      INSERT INTO budgets (category, amount, month, year, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(category, month, year) DO UPDATE SET
        amount = excluded.amount,
        updated_at = CURRENT_TIMESTAMP
    `, [category, amount, month, year]);
  }

  async getBudgets(month: string, year: number): Promise<any[]> {
    await this.ensureInitialized();
    return await this.all(`
      SELECT * FROM budgets 
      WHERE month = ? AND year = ?
      ORDER BY category ASC
    `, [month, year]);
  }

  async deleteBudget(category: string, month: string, year: number): Promise<void> {
    await this.ensureInitialized();
    await this.run(`
      DELETE FROM budgets 
      WHERE category = ? AND month = ? AND year = ?
    `, [category, month, year]);
  }

  async getBudgetWithSpending(month: string, year: number): Promise<any[]> {
    await this.ensureInitialized();
    
    // Get the start and end dates for the month
    const monthStart = new Date(year, parseInt(month) - 1, 1);
    const monthEnd = new Date(year, parseInt(month), 0);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    // Get budgets and actual spending
    const budgets = await this.all(`
      SELECT 
        b.category,
        b.amount as budgeted,
        COALESCE(SUM(ABS(t.amount)), 0) as spent
      FROM budgets b
      LEFT JOIN transactions t ON b.category = t.category_primary 
        AND t.date >= ? AND t.date <= ?
        AND t.amount < 0
      WHERE b.month = ? AND b.year = ?
      GROUP BY b.category, b.amount
      ORDER BY b.category ASC
    `, [monthStartStr, monthEndStr, month, year]);

    return budgets.map(budget => ({
      category: budget.category,
      budgeted: budget.budgeted,
      spent: budget.spent,
      percentage: budget.budgeted > 0 ? Math.round((budget.spent / budget.budgeted) * 100 * 100) / 100 : 0
    }));
  }

  // Investment-related methods
  async upsertSecurity(security: {
    security_id: string;
    isin?: string;
    cusip?: string;
    symbol?: string;
    name?: string;
    type?: string;
    market_identifier_code?: string;
    sector?: string;
    industry?: string;
  }): Promise<void> {
    await this.ensureInitialized();
    const sql = `
      INSERT OR REPLACE INTO securities (
        security_id, isin, cusip, symbol, name, type, 
        market_identifier_code, sector, industry, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    await this.run(sql, [
      security.security_id,
      security.isin,
      security.cusip,
      security.symbol,
      security.name,
      security.type,
      security.market_identifier_code,
      security.sector,
      security.industry
    ]);
  }

  async upsertHolding(holding: {
    account_id: string;
    security_id: string;
    institution_id: number;
    quantity: number;
    price: number;
    value: number;
    cost_basis?: number;
  }): Promise<void> {
    await this.ensureInitialized();
    const sql = `
      INSERT OR REPLACE INTO holdings (
        account_id, security_id, institution_id, quantity, price, value, cost_basis, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    await this.run(sql, [
      holding.account_id,
      holding.security_id,
      holding.institution_id,
      holding.quantity,
      holding.price,
      holding.value,
      holding.cost_basis
    ]);
  }

  async insertInvestmentTransaction(transaction: {
    investment_transaction_id: string;
    account_id: string;
    security_id?: string;
    institution_id: number;
    type: string;
    subtype?: string;
    quantity?: number;
    price?: number;
    fees?: number;
    amount: number;
    date: string;
    name?: string;
  }): Promise<void> {
    await this.ensureInitialized();
    const sql = `
      INSERT OR REPLACE INTO investment_transactions (
        investment_transaction_id, account_id, security_id, institution_id,
        type, subtype, quantity, price, fees, amount, date, name, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    await this.run(sql, [
      transaction.investment_transaction_id,
      transaction.account_id,
      transaction.security_id,
      transaction.institution_id,
      transaction.type,
      transaction.subtype,
      transaction.quantity,
      transaction.price,
      transaction.fees,
      transaction.amount,
      transaction.date,
      transaction.name
    ]);
  }

  async getHoldings(accountId?: string): Promise<any[]> {
    await this.ensureInitialized();
    let sql = `
      SELECT 
        h.*,
        s.symbol,
        s.name as security_name,
        s.type as security_type,
        s.sector,
        s.industry,
        a.name as account_name,
        i.name as institution_name,
        md.price as current_price,
        md.change as day_change,
        md.change_percent as day_change_percent,
        md.volume,
        md.market_cap,
        md.pe_ratio,
        md.dividend_yield
      FROM holdings h
      JOIN securities s ON h.security_id = s.security_id
      JOIN accounts a ON h.account_id = a.account_id
      JOIN institutions i ON h.institution_id = i.id
      LEFT JOIN market_data md ON s.symbol = md.symbol AND md.date = date('now')
      WHERE i.is_active = 1
    `;
    
    const params: any[] = [];
    if (accountId) {
      sql += ' AND h.account_id = ?';
      params.push(accountId);
    }
    
    sql += ' ORDER BY h.value DESC';
    
    return this.all(sql, params);
  }

  async getInvestmentTransactions(filters: {
    account_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    await this.ensureInitialized();
    let sql = `
      SELECT 
        it.*,
        s.symbol,
        s.name as security_name,
        a.name as account_name,
        i.name as institution_name
      FROM investment_transactions it
      LEFT JOIN securities s ON it.security_id = s.security_id
      JOIN accounts a ON it.account_id = a.account_id
      JOIN institutions i ON it.institution_id = i.id
      WHERE i.is_active = 1
    `;
    
    const params: any[] = [];
    
    if (filters.account_id) {
      sql += ' AND it.account_id = ?';
      params.push(filters.account_id);
    }
    
    if (filters.start_date) {
      sql += ' AND it.date >= ?';
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      sql += ' AND it.date <= ?';
      params.push(filters.end_date);
    }
    
    sql += ' ORDER BY it.date DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
      
      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(filters.offset);
      }
    }
    
    return this.all(sql, params);
  }

  async upsertMarketData(marketData: {
    symbol: string;
    price: number;
    change?: number;
    change_percent?: number;
    volume?: number;
    market_cap?: number;
    pe_ratio?: number;
    dividend_yield?: number;
    fifty_two_week_high?: number;
    fifty_two_week_low?: number;
    sector?: string;
    industry?: string;
    date: string;
  }): Promise<void> {
    await this.ensureInitialized();
    const sql = `
      INSERT OR REPLACE INTO market_data (
        symbol, price, change, change_percent, volume, market_cap, pe_ratio,
        dividend_yield, fifty_two_week_high, fifty_two_week_low, sector, industry, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.run(sql, [
      marketData.symbol,
      marketData.price,
      marketData.change,
      marketData.change_percent,
      marketData.volume,
      marketData.market_cap,
      marketData.pe_ratio,
      marketData.dividend_yield,
      marketData.fifty_two_week_high,
      marketData.fifty_two_week_low,
      marketData.sector,
      marketData.industry,
      marketData.date
    ]);
  }

  async getMarketData(symbol?: string, date?: string): Promise<any[]> {
    await this.ensureInitialized();
    let sql = `
      SELECT * FROM market_data
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (symbol) {
      sql += ' AND symbol = ?';
      params.push(symbol);
    }
    
    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    } else {
      sql += ' AND date = date("now")';
    }
    
    sql += ' ORDER BY symbol ASC';
    
    return this.all(sql, params);
  }

  async getPortfolioSummary(): Promise<{
    totalValue: number;
    totalCostBasis: number;
    totalDayChange: number;
    totalDayChangePercent: number;
    holdingsCount: number;
    accountsCount: number;
  }> {
    await this.ensureInitialized();
    const sql = `
      SELECT 
        COUNT(*) as holdings_count,
        COUNT(DISTINCT h.account_id) as accounts_count,
        SUM(h.value) as total_value,
        SUM(h.cost_basis) as total_cost_basis,
        SUM(CASE WHEN md.change IS NOT NULL THEN md.change * h.quantity ELSE 0 END) as total_day_change
      FROM holdings h
      JOIN securities s ON h.security_id = s.security_id
      JOIN institutions i ON h.institution_id = i.id
      LEFT JOIN market_data md ON s.symbol = md.symbol AND md.date = date('now')
      WHERE i.is_active = 1
    `;
    
    const result = await this.get(sql);
    const totalValue = result?.total_value || 0;
    const totalCostBasis = result?.total_cost_basis || 0;
    const totalDayChange = result?.total_day_change || 0;
    const totalDayChangePercent = totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0;
    
    return {
      totalValue,
      totalCostBasis,
      totalDayChange,
      totalDayChangePercent,
      holdingsCount: result?.holdings_count || 0,
      accountsCount: result?.accounts_count || 0
    };
  }
}

// Export singleton instance
export const database = new Database();
