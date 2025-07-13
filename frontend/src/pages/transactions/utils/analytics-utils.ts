import { TransactionFilters, TrendData, CategoryData, TransactionAnalyticsData } from '../types'

export const calculateAnalyticsData = (
  transactions: any[],
  filters: TransactionFilters
): TransactionAnalyticsData => {
  // Calculate date range based on filter
  let startDate: Date;
  let endDate: Date = new Date();
  
  if (filters.dateRange === 'custom' && filters.customDateRange.start && filters.customDateRange.end) {
    startDate = new Date(filters.customDateRange.start);
    endDate = new Date(filters.customDateRange.end);
  } else {
    const days = parseInt(filters.dateRange);
    startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
  }
  
  // Calculate the number of days to show in the chart
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysToShow = Math.min(daysDiff, 30); // Limit to 30 days max for readability
  
  // Generate date range for the chart based on actual date range
  const chartStartDate = new Date(endDate);
  chartStartDate.setDate(chartStartDate.getDate() - daysToShow + 1);
  
  // Transaction trends data for chart - filter by categories if selected
  const filteredForTrends = filters.categories.length > 0 
    ? transactions.filter(t => filters.categories.includes(t.category))
    : transactions;

  const trendsData: TrendData[] = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date(chartStartDate);
    date.setDate(date.getDate() + i);
    const dayTransactions = filteredForTrends.filter(t => 
      new Date(t.date).toDateString() === date.toDateString()
    );
    
    const income = dayTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const spending = dayTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: date.toLocaleDateString('en-CA', { 
        month: 'short', 
        day: 'numeric',
        ...(daysToShow > 7 && { year: 'numeric' })
      }),
      income,
      spending,
      net: income - spending
    };
  });

  // Category breakdown data - use filtered transactions if categories are selected
  const filteredForCategories = filters.categories.length > 0 
    ? transactions.filter(t => filters.categories.includes(t.category))
    : transactions;

  const categoryTotals = filteredForCategories.reduce((acc, t) => {
    if (t.amount > 0) { // Positive amounts are spending
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalSpending = Object.values(categoryTotals).reduce((sum: number, amount) => sum + (amount as number), 0);
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];
  
  let categoryData: CategoryData[] = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .map(([category, amount], index) => ({
      category,
      amount: amount as number,
      percentage: totalSpending > 0 ? ((amount as number) / totalSpending) * 100 : 0,
      color: colors[index % colors.length]
    }));

  // Show top 8 categories
  categoryData = categoryData.slice(0, 8);

  return { 
    trendsData, 
    categoryData, 
    allCategories: Object.keys(categoryTotals).sort() 
  };
};
