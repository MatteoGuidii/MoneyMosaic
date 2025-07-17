import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

// Enable verbose mode for better debugging
const sqlite = sqlite3.verbose();

export class DatabaseConnection {
  private db: sqlite3.Database;
  private initialized: Promise<void>;
  private isInitialized: boolean = false;
  private isClosed: boolean = false;

  constructor(dbPath: string = path.join(__dirname, '../../data/moneymosaic.db')) {
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
      logger.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    // Tables will be created by the migration system
    await this.createBasicTables();
    await this.createInvestmentTables();
    await this.createIndexes();
  }

  private async createBasicTables(): Promise<void> {
    logger.info('Creating institutions table...');
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

    logger.info('Creating accounts table...');
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

    logger.info('Creating transactions table...');
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

    logger.info('Creating budgets table...');
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
  }

  private async createInvestmentTables(): Promise<void> {
    logger.info('Creating securities table...');
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

    logger.info('Creating holdings table...');
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

    logger.info('Creating investment_transactions table...');
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

    logger.info('Creating market_data table...');
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
  }

  private async createIndexes(): Promise<void> {
    await this.runDirect(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);`);
    await this.runDirect(`CREATE INDEX IF NOT EXISTS idx_transactions_date_category ON transactions(date, category_primary);`);
    await this.runDirect(`CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);`);
    await this.runDirect(`CREATE INDEX IF NOT EXISTS idx_transactions_institution ON transactions(institution_id);`);
    await this.runDirect(`CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(year, month);`);
    await this.runDirect(`CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);`);
    await this.runDirect(`CREATE INDEX IF NOT EXISTS idx_holdings_account ON holdings(account_id);`);
    await this.runDirect(`CREATE INDEX IF NOT EXISTS idx_holdings_security ON holdings(security_id);`);
    await this.runDirect(`CREATE INDEX IF NOT EXISTS idx_investment_transactions_account ON investment_transactions(account_id);`);
    await this.runDirect(`CREATE INDEX IF NOT EXISTS idx_investment_transactions_date ON investment_transactions(date);`);
    await this.runDirect(`CREATE INDEX IF NOT EXISTS idx_securities_symbol ON securities(symbol);`);
    await this.runDirect(`CREATE INDEX IF NOT EXISTS idx_market_data_symbol_date ON market_data(symbol, date);`);
  }

  // Ensure database is initialized before operations
  public async ensureInitialized(): Promise<void> {
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
      logger.info('Cleaning all data from database...');
      
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
      
      logger.info('Database cleaned successfully - all data removed');
    } catch (error) {
      logger.error('Error cleaning database:', error);
      throw error;
    }
  }

  // Direct method that doesn't wait for initialization (used during initialization)
  private async runDirect(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
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
}
