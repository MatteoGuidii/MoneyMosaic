export interface Transaction {
  id: string
  transaction_id: string
  account_id: string
  date: string
  name: string
  merchant_name?: string
  amount: number
  category: string
  category_detailed?: string
  type: string
  pending: boolean
  account_name?: string
}

export interface Account {
  id: string
  name: string
  type: string
  rawType?: string
  subtype?: string
  balance: number
  lastUpdated: string
  institutionName?: string
}

export interface Investment {
  symbol: string
  companyName: string
  quantity: number
  marketPrice: number
  marketValue: number
  dayChange: number
  dayChangePercent: number
  accountId: string
  accountName: string
  institutionName: string
  sector?: string
  industry?: string
  costBasis?: number
  securityType?: string
}

export interface InvestmentSummary {
  totalValue: number
  totalCostBasis: number
  totalDayChange: number
  totalDayChangePercent: number
  holdingsCount: number
  accountsCount: number
  topHoldings: Investment[]
  sectorAllocation: Array<{
    sector: string
    value: number
    percentage: number
  }>
}

export interface InvestmentTransaction {
  investment_transaction_id: string
  account_id: string
  security_id?: string
  type: string
  subtype?: string
  quantity?: number
  price?: number
  amount: number
  date: string
  symbol?: string
  security_name?: string
  account_name?: string
  institution_name?: string
}
