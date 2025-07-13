import { DatabaseConnection } from '../connection';

export class TransactionsModel {
  constructor(private db: DatabaseConnection) {}

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
  }): Promise<void> {
    await this.db.run(`
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
  }): Promise<void> {
    await this.db.run(`
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

  async deleteTransaction(transaction_id: string): Promise<void> {
    await this.db.run(`
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

    return this.db.all(sql, params);
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

    const rows = await this.db.all(sql, params);

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

  async deleteTransactionsByInstitution(institution_id: number): Promise<void> {
    await this.db.run(`
      DELETE FROM transactions WHERE institution_id = ?
    `, [institution_id]);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<any[]> {
    return this.db.all(`
      SELECT t.* FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date >= ? AND t.date <= ? AND i.is_active = 1
      ORDER BY t.date DESC
    `, [startDate, endDate]);
  }

  async getTodaysTransactions(): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.db.all(`
      SELECT t.* FROM transactions t 
      JOIN accounts a ON t.account_id = a.account_id 
      JOIN institutions i ON a.institution_id = i.id 
      WHERE t.date = ? AND i.is_active = 1
    `, [today]);
  }
}
