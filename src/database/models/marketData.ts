import { DatabaseConnection } from '../connection';

export class MarketDataModel {
  constructor(private db: DatabaseConnection) {}

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
    const sql = `
      INSERT OR REPLACE INTO market_data (
        symbol, price, change, change_percent, volume, market_cap, pe_ratio,
        dividend_yield, fifty_two_week_high, fifty_two_week_low, sector, industry, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.db.run(sql, [
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
    
    return this.db.all(sql, params);
  }

  async getLatestMarketData(symbols?: string[]): Promise<any[]> {
    let sql = `
      SELECT * FROM market_data
      WHERE date = date("now")
    `;
    
    const params: any[] = [];
    
    if (symbols && symbols.length > 0) {
      const placeholders = symbols.map(() => '?').join(', ');
      sql += ` AND symbol IN (${placeholders})`;
      params.push(...symbols);
    }
    
    sql += ' ORDER BY symbol ASC';
    
    return this.db.all(sql, params);
  }

  async getMarketDataHistory(symbol: string, days: number = 30): Promise<any[]> {
    const sql = `
      SELECT * FROM market_data
      WHERE symbol = ? AND date >= date('now', '-${days} days')
      ORDER BY date ASC
    `;
    
    return this.db.all(sql, [symbol]);
  }

  async deleteOldMarketData(daysToKeep: number = 90): Promise<void> {
    await this.db.run(`
      DELETE FROM market_data 
      WHERE date < date('now', '-${daysToKeep} days')
    `);
  }

  async getMarketDataByDate(date: string): Promise<any[]> {
    return this.db.all(`
      SELECT * FROM market_data
      WHERE date = ?
      ORDER BY symbol ASC
    `, [date]);
  }

  async getUniqueSymbols(): Promise<string[]> {
    const result = await this.db.all(`
      SELECT DISTINCT symbol 
      FROM market_data 
      ORDER BY symbol ASC
    `);
    return result.map(row => row.symbol);
  }
}
