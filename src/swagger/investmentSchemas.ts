export const investmentSchemas = {
  InvestmentHolding: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Holding ID',
      },
      account_id: {
        type: 'string',
        description: 'Account ID',
      },
      security_id: {
        type: 'string',
        description: 'Security ID',
      },
      ticker_symbol: {
        type: 'string',
        description: 'Ticker symbol',
      },
      security_name: {
        type: 'string',
        description: 'Security name',
      },
      security_type: {
        type: 'string',
        description: 'Security type',
      },
      quantity: {
        type: 'number',
        description: 'Quantity held',
      },
      current_price: {
        type: 'number',
        description: 'Current price per share',
      },
      current_value: {
        type: 'number',
        description: 'Current total value',
      },
      cost_basis: {
        type: 'number',
        description: 'Cost basis',
      },
      total_return: {
        type: 'number',
        description: 'Total return amount',
      },
      total_return_percent: {
        type: 'number',
        description: 'Total return percentage',
      },
      day_change: {
        type: 'number',
        description: 'Day change amount',
      },
      day_change_percent: {
        type: 'number',
        description: 'Day change percentage',
      },
    },
    required: ['id', 'account_id', 'security_id', 'ticker_symbol', 'security_name'],
  },
  
  PortfolioSummary: {
    type: 'object',
    properties: {
      totalValue: {
        type: 'number',
        description: 'Total portfolio value',
      },
      sectorBreakdown: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sector: {
              type: 'string',
            },
            total_value: {
              type: 'number',
            },
            holding_count: {
              type: 'integer',
            },
          },
        },
        description: 'Portfolio breakdown by sector',
      },
      topHoldings: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/InvestmentHolding',
        },
        description: 'Top holdings by value',
      },
      performance: {
        type: 'object',
        properties: {
          totalReturn: {
            type: 'number',
            description: 'Total return amount',
          },
          avgReturnPercent: {
            type: 'number',
            description: 'Average return percentage',
          },
          totalDayChange: {
            type: 'number',
            description: 'Total day change amount',
          },
          avgDayChangePercent: {
            type: 'number',
            description: 'Average day change percentage',
          },
        },
      },
    },
    required: ['totalValue', 'sectorBreakdown', 'topHoldings', 'performance'],
  },
  
  InvestmentTransaction: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Transaction ID',
      },
      account_id: {
        type: 'string',
        description: 'Account ID',
      },
      plaid_transaction_id: {
        type: 'string',
        description: 'Plaid transaction ID',
      },
      security_id: {
        type: 'string',
        description: 'Security ID',
      },
      ticker_symbol: {
        type: 'string',
        description: 'Ticker symbol',
      },
      security_name: {
        type: 'string',
        description: 'Security name',
      },
      date: {
        type: 'string',
        format: 'date',
        description: 'Transaction date',
      },
      name: {
        type: 'string',
        description: 'Transaction name',
      },
      type: {
        type: 'string',
        enum: ['buy', 'sell', 'dividend', 'fee', 'transfer'],
        description: 'Transaction type',
      },
      subtype: {
        type: 'string',
        description: 'Transaction subtype',
      },
      quantity: {
        type: 'number',
        description: 'Quantity of shares',
      },
      amount: {
        type: 'number',
        description: 'Transaction amount',
      },
      price: {
        type: 'number',
        description: 'Price per share',
      },
      fees: {
        type: 'number',
        description: 'Transaction fees',
      },
    },
    required: ['id', 'account_id', 'plaid_transaction_id', 'date', 'name', 'type'],
  },
};
