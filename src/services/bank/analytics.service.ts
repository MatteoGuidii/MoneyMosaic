import { database, Database } from '../../database';
import { subDays, formatISO } from 'date-fns';
import { logger } from '../../utils/logger';

export class AnalyticsService {
  private database: Database;

  constructor(db?: Database) {
    this.database = db || database;
  }

  // Get budget insights and spending analysis
  async getBudgetInsights(): Promise<{
    categorySpending: { category: string; spent: number; avgMonthly: number; recommendation: string }[];
    unusualSpending: { merchant: string; amount: number; date: string; reason: string }[];
    savingsOpportunities: { category: string; potentialSavings: number; suggestion: string }[];
  }> {
    try {
      // Use centralized logger instead of console.log for consistency
      logger.info('📊 Analyzing budget insights...');

      const last30Days = formatISO(subDays(new Date(), 30), { representation: 'date' });
      const last90Days = formatISO(subDays(new Date(), 90), { representation: 'date' });
      const today = formatISO(new Date(), { representation: 'date' });

      // Get recent transactions
      const allRecentTransactions = await this.database.getTransactions({
        start_date: last30Days,
        end_date: today
      });

      // Get longer period for averages
      const allLongerPeriodTransactions = await this.database.getTransactions({
        start_date: last90Days,
        end_date: today
      });

      // Filter to only expense transactions (positive amounts)
      const recentTransactions = allRecentTransactions.filter(tx => tx.amount > 0);
      const longerPeriodTransactions = allLongerPeriodTransactions.filter(tx => tx.amount > 0);

      // Category spending analysis
      const categorySpending = this.analyzeCategorySpending(recentTransactions, longerPeriodTransactions);
      
      // Unusual spending detection
      const unusualSpending = this.detectUnusualSpending(recentTransactions, longerPeriodTransactions);
      
      // Savings opportunities
      const savingsOpportunities = this.identifySavingsOpportunities(recentTransactions);

      return {
        categorySpending,
        unusualSpending,
        savingsOpportunities
      };
    } catch (error) {
      logger.error('Error analyzing budget insights:', error);
      throw error;
    }
  }

  private analyzeCategorySpending(recent: any[], longer: any[]): { category: string; spent: number; avgMonthly: number; recommendation: string }[] {
    const recentByCategory: { [key: string]: number } = {};
    const longerByCategory: { [key: string]: number } = {};

    recent.forEach(tx => {
      if (tx.category_primary) {
        recentByCategory[tx.category_primary] = (recentByCategory[tx.category_primary] || 0) + Math.abs(tx.amount);
      }
    });

    longer.forEach(tx => {
      if (tx.category_primary) {
        longerByCategory[tx.category_primary] = (longerByCategory[tx.category_primary] || 0) + Math.abs(tx.amount);
      }
    });

    const categories = new Set([...Object.keys(recentByCategory), ...Object.keys(longerByCategory)]);
    
    return Array.from(categories).map(category => {
      const spent = recentByCategory[category] || 0;
      const avgMonthly = (longerByCategory[category] || 0) / 3; // 3 months average
      
      let recommendation = '';
      if (spent > avgMonthly * 1.5) {
        recommendation = `Spending is 50% higher than usual. Consider reviewing ${category} expenses.`;
      } else if (spent < avgMonthly * 0.7) {
        recommendation = `Great job! Spending is lower than usual in ${category}.`;
      } else {
        recommendation = `Spending is consistent with your usual pattern.`;
      }

      return { category, spent, avgMonthly, recommendation };
    });
  }

  private detectUnusualSpending(recent: any[], longer: any[]): { merchant: string; amount: number; date: string; reason: string }[] {
    const merchantAverages: { [key: string]: number } = {};
    const merchantCounts: { [key: string]: number } = {};

    longer.forEach(tx => {
      if (tx.merchant_name) {
        merchantAverages[tx.merchant_name] = (merchantAverages[tx.merchant_name] || 0) + Math.abs(tx.amount);
        merchantCounts[tx.merchant_name] = (merchantCounts[tx.merchant_name] || 0) + 1;
      }
    });

    // Calculate averages
    Object.keys(merchantAverages).forEach(merchant => {
      merchantAverages[merchant] = merchantAverages[merchant] / merchantCounts[merchant];
    });

    // Find unusual spending in recent transactions
    const unusual: { merchant: string; amount: number; date: string; reason: string }[] = [];

    recent.forEach(tx => {
      if (tx.merchant_name && merchantAverages[tx.merchant_name]) {
        const avgAmount = merchantAverages[tx.merchant_name];
        const currentAmount = Math.abs(tx.amount);
        
        if (currentAmount > avgAmount * 3) {
          unusual.push({
            merchant: tx.merchant_name,
            amount: currentAmount,
            date: tx.date,
            reason: `Amount is ${Math.round((currentAmount / avgAmount) * 100)}% of your usual spending at this merchant`
          });
        }
      }
    });

    return unusual.sort((a, b) => b.amount - a.amount).slice(0, 5);
  }

  private identifySavingsOpportunities(transactions: any[]): { category: string; potentialSavings: number; suggestion: string }[] {
    const categoryData: { [key: string]: { total: number; count: number; merchants: Set<string> } } = {};

    transactions.forEach(tx => {
      if (tx.category_primary) {
        if (!categoryData[tx.category_primary]) {
          categoryData[tx.category_primary] = { total: 0, count: 0, merchants: new Set() };
        }
        categoryData[tx.category_primary].total += Math.abs(tx.amount);
        categoryData[tx.category_primary].count += 1;
        if (tx.merchant_name) {
          categoryData[tx.category_primary].merchants.add(tx.merchant_name);
        }
      }
    });

    return Object.entries(categoryData)
      .map(([category, data]) => {
        let potentialSavings = 0;
        let suggestion = '';

        // Different suggestions based on category
        if (category === 'FOOD_AND_DRINK') {
          potentialSavings = data.total * 0.2; // 20% potential savings
          suggestion = 'Consider cooking at home more often or setting a dining out budget';
        } else if (category === 'TRANSPORTATION') {
          potentialSavings = data.total * 0.15;
          suggestion = 'Look into public transportation or carpooling options';
        } else if (category === 'ENTERTAINMENT') {
          potentialSavings = data.total * 0.25;
          suggestion = 'Consider free entertainment options or subscription audits';
        } else if (data.merchants.size > 5) {
          potentialSavings = data.total * 0.1;
          suggestion = 'You shop at many different places. Consider consolidating purchases for better deals';
        }

        return { category, potentialSavings, suggestion };
      })
      .filter(item => item.potentialSavings > 0)
      .sort((a, b) => b.potentialSavings - a.potentialSavings)
      .slice(0, 5);
  }

  // Get advanced transaction summary with metrics
  async getAdvancedTransactionSummary(period: string = 'month', compareWithPrevious: boolean = false): Promise<{
    summary: {
      totalIncome: number;
      totalExpenses: number;
      netCashFlow: number;
      transactionCount: number;
      avgTransactionAmount: number;
      topExpenseCategory: string;
      savingsRate: number;
    };
    categoryBreakdown: { category: string; amount: number; percentage: number; transactionCount: number }[];
    comparison?: {
      previousPeriod: any;
      changes: any;
    };
  }> {
    try {
      logger.info(`📊 Generating advanced transaction summary for ${period}...`);

      // Calculate date ranges based on period
      const { startDate, endDate, prevStartDate, prevEndDate } = this.calculatePeriodDates(period);

      // Get current period transactions
      const currentTransactions = await this.database.getTransactions({
        start_date: startDate,
        end_date: endDate
      });

      // Calculate summary metrics
      const summary = this.calculateSummaryMetrics(currentTransactions);
      
      // Calculate category breakdown
      const categoryBreakdown = this.calculateCategoryBreakdown(currentTransactions);

      let comparison;
      if (compareWithPrevious) {
        const previousTransactions = await this.database.getTransactions({
          start_date: prevStartDate,
          end_date: prevEndDate
        });
        comparison = this.calculatePeriodComparison(currentTransactions, previousTransactions);
      }

      return {
        summary,
        categoryBreakdown,
        comparison
      };
    } catch (error) {
      logger.error('Error generating advanced transaction summary:', error);
      throw error;
    }
  }

  private calculatePeriodDates(period: string): { startDate: string; endDate: string; prevStartDate: string; prevEndDate: string } {
    const now = new Date();
    let startDate: string;
    let endDate: string;
    let prevStartDate: string;
    let prevEndDate: string;

    switch (period) {
      case 'week':
        startDate = formatISO(subDays(now, 7), { representation: 'date' });
        endDate = formatISO(now, { representation: 'date' });
        prevStartDate = formatISO(subDays(now, 14), { representation: 'date' });
        prevEndDate = formatISO(subDays(now, 7), { representation: 'date' });
        break;
      case 'month':
        startDate = formatISO(subDays(now, 30), { representation: 'date' });
        endDate = formatISO(now, { representation: 'date' });
        prevStartDate = formatISO(subDays(now, 60), { representation: 'date' });
        prevEndDate = formatISO(subDays(now, 30), { representation: 'date' });
        break;
      case 'quarter':
        startDate = formatISO(subDays(now, 90), { representation: 'date' });
        endDate = formatISO(now, { representation: 'date' });
        prevStartDate = formatISO(subDays(now, 180), { representation: 'date' });
        prevEndDate = formatISO(subDays(now, 90), { representation: 'date' });
        break;
      case 'year':
        startDate = formatISO(subDays(now, 365), { representation: 'date' });
        endDate = formatISO(now, { representation: 'date' });
        prevStartDate = formatISO(subDays(now, 730), { representation: 'date' });
        prevEndDate = formatISO(subDays(now, 365), { representation: 'date' });
        break;
      default:
        throw new Error(`Invalid period: ${period}`);
    }

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  private calculateSummaryMetrics(transactions: any[]): any {
    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      netCashFlow: 0,
      transactionCount: transactions.length,
      avgTransactionAmount: 0,
      topExpenseCategory: '',
      savingsRate: 0
    };

    const categoryTotals: { [key: string]: number } = {};

    transactions.forEach(tx => {
      const amount = Math.abs(tx.amount);
      
      if (tx.amount > 0) {
        summary.totalExpenses += amount;
        
        if (tx.category_primary) {
          categoryTotals[tx.category_primary] = (categoryTotals[tx.category_primary] || 0) + amount;
        }
      } else {
        summary.totalIncome += amount;
      }
    });

    summary.netCashFlow = summary.totalIncome - summary.totalExpenses;
    summary.avgTransactionAmount = summary.transactionCount > 0 ? 
      (summary.totalIncome + summary.totalExpenses) / summary.transactionCount : 0;
    
    // Find top expense category
    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0];
    summary.topExpenseCategory = topCategory ? topCategory[0] : '';
    
    // Calculate savings rate
    summary.savingsRate = summary.totalIncome > 0 ? 
      (summary.netCashFlow / summary.totalIncome) * 100 : 0;

    return summary;
  }

  private calculateCategoryBreakdown(transactions: any[]): { category: string; amount: number; percentage: number; transactionCount: number }[] {
    const categoryData: { [key: string]: { amount: number; count: number } } = {};
    let totalAmount = 0;

    transactions.forEach(tx => {
      if (tx.category_primary) {
        const amount = Math.abs(tx.amount);
        if (!categoryData[tx.category_primary]) {
          categoryData[tx.category_primary] = { amount: 0, count: 0 };
        }
        categoryData[tx.category_primary].amount += amount;
        categoryData[tx.category_primary].count += 1;
        totalAmount += amount;
      }
    });

    return Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        transactionCount: data.count
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private calculatePeriodComparison(current: any[], previous: any[]): any {
    const currentSummary = this.calculateSummaryMetrics(current);
    const previousSummary = this.calculateSummaryMetrics(previous);

    const changes = {
      totalIncome: currentSummary.totalIncome - previousSummary.totalIncome,
      totalExpenses: currentSummary.totalExpenses - previousSummary.totalExpenses,
      netCashFlow: currentSummary.netCashFlow - previousSummary.netCashFlow,
      transactionCount: currentSummary.transactionCount - previousSummary.transactionCount,
      avgTransactionAmount: currentSummary.avgTransactionAmount - previousSummary.avgTransactionAmount,
      savingsRate: currentSummary.savingsRate - previousSummary.savingsRate
    };

    return {
      previousPeriod: previousSummary,
      changes
    };
  }

  // Get spending trends over time
  async getSpendingTrends(period: 'week' | 'month' | 'quarter' = 'month'): Promise<{
    trends: { date: string; amount: number; category: string }[];
    totalSpending: number;
    avgDailySpending: number;
  }> {
    try {
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
      const startDate = formatISO(subDays(new Date(), days), { representation: 'date' });
      const endDate = formatISO(new Date(), { representation: 'date' });

      const transactions = await this.database.getTransactions({
        start_date: startDate,
        end_date: endDate
      });

      const expenseTransactions = transactions.filter(tx => tx.amount > 0);
      const totalSpending = expenseTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const avgDailySpending = totalSpending / days;

      const trends = expenseTransactions.map(tx => ({
        date: tx.date,
        amount: Math.abs(tx.amount),
        category: tx.category_primary || 'Uncategorized'
      }));

      return {
        trends,
        totalSpending,
        avgDailySpending
      };
    } catch (error) {
      logger.error('Error getting spending trends:', error);
      throw error;
    }
  }
}
