export interface MarketDataProvider {
  getQuote(symbol: string): Promise<{
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
  }>;
  
  getMultipleQuotes(symbols: string[]): Promise<Array<{
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
  }>>;
}

// Mock market data provider - replace with real API like Alpha Vantage, Yahoo Finance, etc.
export class MockMarketDataProvider implements MarketDataProvider {
  private mockData: { [symbol: string]: any } = {
    'AAPL': { symbol: 'AAPL', price: 185.25, change: 2.34, change_percent: 1.28, volume: 45678901, market_cap: 2890000000000, pe_ratio: 28.5, dividend_yield: 0.52, fifty_two_week_high: 199.62, fifty_two_week_low: 164.08, sector: 'Technology', industry: 'Consumer Electronics' },
    'GOOGL': { symbol: 'GOOGL', price: 2745.50, change: -15.75, change_percent: -0.57, volume: 1234567, market_cap: 1750000000000, pe_ratio: 24.2, dividend_yield: 0.00, fifty_two_week_high: 2925.07, fifty_two_week_low: 2193.62, sector: 'Technology', industry: 'Internet Content & Information' },
    'MSFT': { symbol: 'MSFT', price: 375.80, change: 4.25, change_percent: 1.14, volume: 23456789, market_cap: 2790000000000, pe_ratio: 32.1, dividend_yield: 0.75, fifty_two_week_high: 384.52, fifty_two_week_low: 309.45, sector: 'Technology', industry: 'Software—Infrastructure' },
    'TSLA': { symbol: 'TSLA', price: 248.75, change: -8.50, change_percent: -3.30, volume: 87654321, market_cap: 790000000000, pe_ratio: 65.8, dividend_yield: 0.00, fifty_two_week_high: 299.29, fifty_two_week_low: 138.80, sector: 'Consumer Cyclical', industry: 'Auto Manufacturers' },
    'AMZN': { symbol: 'AMZN', price: 3285.04, change: 12.85, change_percent: 0.39, volume: 3456789, market_cap: 1680000000000, pe_ratio: 58.3, dividend_yield: 0.00, fifty_two_week_high: 3552.25, fifty_two_week_low: 2671.45, sector: 'Consumer Cyclical', industry: 'Internet Retail' },
    'META': { symbol: 'META', price: 325.16, change: -2.84, change_percent: -0.87, volume: 19876543, market_cap: 820000000000, pe_ratio: 23.7, dividend_yield: 0.00, fifty_two_week_high: 384.33, fifty_two_week_low: 274.38, sector: 'Technology', industry: 'Internet Content & Information' },
    'NFLX': { symbol: 'NFLX', price: 485.50, change: 7.25, change_percent: 1.52, volume: 5432109, market_cap: 215000000000, pe_ratio: 41.2, dividend_yield: 0.00, fifty_two_week_high: 541.15, fifty_two_week_low: 344.73, sector: 'Communication Services', industry: 'Entertainment' },
    'NVDA': { symbol: 'NVDA', price: 875.20, change: 15.60, change_percent: 1.81, volume: 45678901, market_cap: 2150000000000, pe_ratio: 62.4, dividend_yield: 0.12, fifty_two_week_high: 974.00, fifty_two_week_low: 395.75, sector: 'Technology', industry: 'Semiconductors' }
  };

  async getQuote(symbol: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const quote = this.mockData[symbol];
    if (!quote) {
      throw new Error(`Quote not found for symbol: ${symbol}`);
    }
    
    // Add some random variation to simulate real market data
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    return {
      ...quote,
      price: parseFloat((quote.price * (1 + variation)).toFixed(2)),
      change: parseFloat((quote.change * (1 + variation)).toFixed(2)),
      change_percent: parseFloat((quote.change_percent * (1 + variation)).toFixed(2))
    };
  }

  async getMultipleQuotes(symbols: string[]): Promise<any[]> {
    const quotes = await Promise.all(
      symbols.map(symbol => this.getQuote(symbol).catch(error => {
        console.warn(`Failed to get quote for ${symbol}:`, error.message);
        return null;
      }))
    );
    
    return quotes.filter(quote => quote !== null);
  }
}

// Create a singleton instance
export const marketDataProvider = new MockMarketDataProvider();
