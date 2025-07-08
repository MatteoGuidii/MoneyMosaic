export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface UnhealthyConnection {
  name: string;
  error: string;
}

export interface PaginatedResponse<T = any> extends APIResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardOverview {
  totalCashBalance: number;
  totalPortfolioValue: number;
  netWorth: number;
  todayNetFlow: number;
  monthToDateNetFlow: number;
  sevenDayAverage: number;
}

export interface TransactionSummary {
  totalSpending: number;
  totalIncome: number;
  byCategory: Record<string, number>;
  byInstitution: Record<string, number>;
}

export interface HealthCheckResult {
  healthy: number;
  warning: number;
  error: number;
  details: Array<{
    institution_id: string;
    name: string;
    status: 'healthy' | 'warning' | 'error';
    last_sync: string;
    message?: string;
  }>;
}
