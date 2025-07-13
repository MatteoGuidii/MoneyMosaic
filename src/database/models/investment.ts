import { DatabaseConnection } from '../connection';

export class InvestmentModel {
  constructor(private db: DatabaseConnection) {}

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
    const sql = `
      INSERT OR REPLACE INTO securities (
        security_id, isin, cusip, symbol, name, type, 
        market_identifier_code, sector, industry, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    await this.db.run(sql, [
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
    const sql = `
      INSERT OR REPLACE INTO holdings (
        account_id, security_id, institution_id, quantity, price, value, cost_basis, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    await this.db.run(sql, [
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
    const sql = `
      INSERT OR REPLACE INTO investment_transactions (
        investment_transaction_id, account_id, security_id, institution_id,
        type, subtype, quantity, price, fees, amount, date, name, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    await this.db.run(sql, [
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
    
    return this.db.all(sql, params);
  }

  async getInvestmentTransactions(filters: {
    account_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
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
    
    return this.db.all(sql, params);
  }

  async getPortfolioSummary(): Promise<{
    totalValue: number;
    totalCostBasis: number;
    totalDayChange: number;
    totalDayChangePercent: number;
    holdingsCount: number;
    accountsCount: number;
  }> {
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
    
    const result = await this.db.get(sql);
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

  async deleteInvestmentDataByInstitution(institution_id: number): Promise<void> {
    await this.db.run(`DELETE FROM investment_transactions WHERE institution_id = ?`, [institution_id]);
    await this.db.run(`DELETE FROM holdings WHERE institution_id = ?`, [institution_id]);
  }
}
