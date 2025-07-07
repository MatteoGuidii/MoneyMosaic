export interface Institution {
  id?: number;
  institution_id: string;
  name: string;
  access_token: string;
  item_id: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface Account {
  id?: number;
  account_id: string;
  institution_id: number;
  name: string;
  official_name?: string;
  type: string;
  subtype?: string;
  mask?: string;
  current_balance?: number;
  available_balance?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id?: number;
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
  created_at?: string;
  updated_at?: string;
}

export interface BankConnection {
  id: number;
  institution_id: string;
  name: string;
  access_token: string;
  item_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_sync?: string;
  status?: 'healthy' | 'warning' | 'error';
}

export interface DatabaseFilters {
  institution_id?: number;
  account_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}
