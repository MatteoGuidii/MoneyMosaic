export const dashboardSchemas = {
  DashboardOverview: {
    type: 'object',
    properties: {
      totalCashBalance: {
        type: 'number',
        description: 'Total cash balance across all accounts',
      },
      totalPortfolioValue: {
        type: 'number',
        description: 'Total investment portfolio value',
      },
      netWorth: {
        type: 'number',
        description: 'Net worth (assets - liabilities)',
      },
      todayNetFlow: {
        type: 'number',
        description: 'Net cash flow for today',
      },
      monthToDateNetFlow: {
        type: 'number',
        description: 'Net cash flow for the month to date',
      },
      accountSummary: {
        type: 'object',
        properties: {
          totalAccounts: {
            type: 'integer',
            description: 'Total number of accounts',
          },
          activeInstitutions: {
            type: 'integer',
            description: 'Number of active institutions',
          },
          cashAccounts: {
            type: 'integer',
            description: 'Number of cash accounts',
          },
          investmentAccounts: {
            type: 'integer',
            description: 'Number of investment accounts',
          },
        },
      },
      recentTransactions: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Transaction',
        },
        description: 'Recent transactions',
      },
    },
    required: ['totalCashBalance', 'totalPortfolioValue', 'netWorth'],
  },
  
  SpendingData: {
    type: 'object',
    properties: {
      dailySpending: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date',
            },
            amount: {
              type: 'number',
            },
            transactionCount: {
              type: 'integer',
            },
          },
        },
        description: 'Daily spending data',
      },
      totalSpending: {
        type: 'number',
        description: 'Total spending for the period',
      },
      averageDaily: {
        type: 'number',
        description: 'Average daily spending',
      },
      dateRange: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            format: 'date',
          },
          endDate: {
            type: 'string',
            format: 'date',
          },
          days: {
            type: 'integer',
          },
        },
      },
    },
    required: ['dailySpending', 'totalSpending', 'averageDaily'],
  },
  
  CategorySpending: {
    type: 'object',
    properties: {
      categoryBreakdown: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
            },
            totalSpent: {
              type: 'number',
            },
            transactionCount: {
              type: 'integer',
            },
            percentage: {
              type: 'number',
            },
          },
        },
        description: 'Spending breakdown by category',
      },
      totalSpending: {
        type: 'number',
        description: 'Total spending across all categories',
      },
    },
    required: ['categoryBreakdown', 'totalSpending'],
  },
  
  FinancialHealth: {
    type: 'object',
    properties: {
      score: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        description: 'Financial health score (0-100)',
      },
      metrics: {
        type: 'object',
        properties: {
          emergencyFundRatio: {
            type: 'number',
            description: 'Emergency fund ratio',
          },
          savingsRate: {
            type: 'number',
            description: 'Savings rate percentage',
          },
          debtToIncomeRatio: {
            type: 'number',
            description: 'Debt to income ratio',
          },
          investmentDiversification: {
            type: 'number',
            description: 'Investment diversification score',
          },
        },
      },
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },
            message: {
              type: 'string',
            },
            actionItems: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        description: 'Financial health recommendations',
      },
    },
    required: ['score', 'metrics'],
  },
};
