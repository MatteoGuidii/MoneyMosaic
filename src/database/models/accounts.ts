import { DatabaseConnection } from '../connection';

export class AccountsModel {
  constructor(private db: DatabaseConnection) {}

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
  }): Promise<void> {
    await this.db.run(`
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
    return this.db.all(`
      SELECT * FROM accounts 
      WHERE institution_id = ? 
      ORDER BY created_at DESC
    `, [institution_id]);
  }

  async getAccountById(account_id: string): Promise<any> {
    return this.db.get(`
      SELECT * FROM accounts 
      WHERE account_id = ?
    `, [account_id]);
  }

  async getAllAccounts(): Promise<any[]> {
    return this.db.all(`
      SELECT a.* FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE i.is_active = 1
      ORDER BY a.created_at DESC
    `);
  }

  async getAccountsWithInstitution(): Promise<any[]> {
    return this.db.all(`
      SELECT a.*, i.name as institution_name
      FROM accounts a 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE i.is_active = 1
      ORDER BY a.created_at DESC
    `);
  }

  async updateAccountBalance(account_id: string, current_balance: number, available_balance?: number): Promise<void> {
    await this.db.run(`
      UPDATE accounts 
      SET current_balance = ?, available_balance = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE account_id = ?
    `, [current_balance, available_balance, account_id]);
  }

  async deleteAccountsByInstitution(institution_id: number): Promise<void> {
    await this.db.run(`
      DELETE FROM accounts WHERE institution_id = ?
    `, [institution_id]);
  }
}
