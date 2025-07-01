import sqlite3 from 'sqlite3';
import { promisify } from 'util';
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
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
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
      CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
    `);

    await this.runDirect(`
      CREATE INDEX IF NOT EXISTS idx_transactions_institution ON transactions(institution_id);
    `);
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

  // Promisify database methods for async/await
  // Direct method that doesn't wait for initialization (used during initialization)
  private async runDirect(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
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
}

// Export singleton instance
export const database = new Database();
