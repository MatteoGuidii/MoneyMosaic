import { DatabaseConnection } from '../connection';

export class BudgetsModel {
  constructor(private db: DatabaseConnection) {}

  async createOrUpdateBudget(category: string, amount: number, month: string, year: number): Promise<void> {
    await this.db.run(`
      INSERT INTO budgets (category, amount, month, year, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(category, month, year) DO UPDATE SET
        amount = excluded.amount,
        updated_at = CURRENT_TIMESTAMP
    `, [category, amount, month, year]);
  }

  async getBudgets(month: string, year: number): Promise<any[]> {
    return this.db.all(`
      SELECT * FROM budgets 
      WHERE month = ? AND year = ?
      ORDER BY category ASC
    `, [month, year]);
  }

  async deleteBudget(category: string, month: string, year: number): Promise<void> {
    await this.db.run(`
      DELETE FROM budgets 
      WHERE category = ? AND month = ? AND year = ?
    `, [category, month, year]);
  }

  async getBudgetWithSpending(month: string, year: number): Promise<any[]> {
    // Get the start and end dates for the month
    const monthStart = new Date(year, parseInt(month) - 1, 1);
    const monthEnd = new Date(year, parseInt(month), 0);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    // Get budgets and actual spending
    const budgets = await this.db.all(`
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

  async getAllBudgets(): Promise<any[]> {
    return this.db.all(`
      SELECT * FROM budgets 
      ORDER BY year DESC, month DESC, category ASC
    `);
  }

  async getBudgetsByYear(year: number): Promise<any[]> {
    return this.db.all(`
      SELECT * FROM budgets 
      WHERE year = ?
      ORDER BY month DESC, category ASC
    `, [year]);
  }
}
