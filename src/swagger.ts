import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MoneyMosaic API',
      version: '1.0.0',
      description: 'A comprehensive personal finance dashboard API that connects multiple banks and tracks finances using the Plaid API.',
      contact: {
        name: 'MoneyMosaic API Support',
        url: 'https://github.com/matteoguidii/moneymosaic',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    // servers: [
    //   {
    //     url: `http://localhost:${config.server.port}`,
    //     description: 'Development server',
    //   },
    //   {
    //     url: 'https://your-production-domain.com',
    //     description: 'Production server',
    //   },
    // ],
    components: {
    //   securitySchemes: {
    //     bearerAuth: {
    //       type: 'http',
    //       scheme: 'bearer',
    //       bearerFormat: 'JWT',
    //     },
    //   },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'string',
              description: 'Additional error details',
            },
          },
          required: ['error'],
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy'],
              description: 'Service health status',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Current timestamp',
            },
            environment: {
              type: 'string',
              description: 'Current environment',
            },
          },
          required: ['status', 'timestamp'],
        },
        LinkToken: {
          type: 'object',
          properties: {
            link_token: {
              type: 'string',
              description: 'Plaid Link token for frontend integration',
            },
            expiration: {
              type: 'string',
              format: 'date-time',
              description: 'Token expiration time',
            },
          },
          required: ['link_token', 'expiration'],
        },
        Institution: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Institution ID',
            },
            name: {
              type: 'string',
              description: 'Institution name',
            },
            plaid_institution_id: {
              type: 'string',
              description: 'Plaid institution identifier',
            },
            access_token: {
              type: 'string',
              description: 'Plaid access token',
            },
            is_active: {
              type: 'boolean',
              description: 'Whether the institution connection is active',
            },
            last_sync: {
              type: 'string',
              format: 'date-time',
              description: 'Last synchronization timestamp',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
          },
          required: ['id', 'name', 'plaid_institution_id', 'is_active'],
        },
        Account: {
          type: 'object',
          properties: {
            account_id: {
              type: 'string',
              description: 'Plaid account identifier',
            },
            institution_id: {
              type: 'integer',
              description: 'Associated institution ID',
            },
            name: {
              type: 'string',
              description: 'Account name',
            },
            type: {
              type: 'string',
              enum: ['depository', 'credit', 'investment', 'loan'],
              description: 'Account type',
            },
            subtype: {
              type: 'string',
              description: 'Account subtype',
            },
            current_balance: {
              type: 'number',
              format: 'float',
              description: 'Current account balance',
            },
            available_balance: {
              type: 'number',
              format: 'float',
              description: 'Available balance',
            },
            currency_code: {
              type: 'string',
              description: 'Currency code (e.g., USD)',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
          },
          required: ['account_id', 'institution_id', 'name', 'type'],
        },
        Transaction: {
          type: 'object',
          properties: {
            transaction_id: {
              type: 'string',
              description: 'Plaid transaction identifier',
            },
            account_id: {
              type: 'string',
              description: 'Associated account ID',
            },
            amount: {
              type: 'number',
              format: 'float',
              description: 'Transaction amount (positive for debits, negative for credits)',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Transaction date',
            },
            name: {
              type: 'string',
              description: 'Transaction name/description',
            },
            category: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Transaction categories',
            },
            merchant_name: {
              type: 'string',
              description: 'Merchant name',
            },
            currency_code: {
              type: 'string',
              description: 'Currency code',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
          },
          required: ['transaction_id', 'account_id', 'amount', 'date', 'name'],
        },
        DashboardOverview: {
          type: 'object',
          properties: {
            totalCashBalance: {
              type: 'number',
              format: 'float',
              description: 'Total cash balance across all accounts',
            },
            totalPortfolioValue: {
              type: 'number',
              format: 'float',
              description: 'Total investment portfolio value',
            },
            todayNetFlow: {
              type: 'number',
              format: 'float',
              description: 'Net cash flow for today',
            },
            accountsCount: {
              type: 'integer',
              description: 'Number of connected accounts',
            },
            institutionsCount: {
              type: 'integer',
              description: 'Number of connected institutions',
            },
            lastSyncTime: {
              type: 'string',
              format: 'date-time',
              description: 'Last data synchronization time',
            },
          },
          required: ['totalCashBalance', 'totalPortfolioValue', 'todayNetFlow'],
        },
        TokenExchangeRequest: {
          type: 'object',
          properties: {
            public_token: {
              type: 'string',
              description: 'Public token from Plaid Link',
            },
          },
          required: ['public_token'],
        },
        TokenExchangeResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the token exchange was successful',
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            institutionId: {
              type: 'integer',
              description: 'Created institution ID',
            },
          },
          required: ['success', 'message'],
        },
        SyncResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the sync was successful',
            },
            message: {
              type: 'string',
              description: 'Sync result message',
            },
            syncedInstitutions: {
              type: 'integer',
              description: 'Number of institutions synced',
            },
            newTransactions: {
              type: 'integer',
              description: 'Number of new transactions found',
            },
          },
          required: ['success', 'message'],
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'System health endpoints',
      },
      {
        name: 'Authentication',
        description: 'Plaid Link token management',
      },
      {
        name: 'Bank Management',
        description: 'Bank connection and management endpoints',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard data and insights',
      },
      {
        name: 'Transactions',
        description: 'Transaction data and management',
      },
      {
        name: 'Accounts',
        description: 'Account information',
      },
      {
        name: 'Investments',
        description: 'Investment data',
      },
      {
        name: 'Sandbox',
        description: 'Sandbox testing endpoints',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/server.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
export const swaggerUiOptions = {
  explorer: true,
  customSiteTitle: 'MoneyMosaic API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  customfavIcon: '/favicon.ico',
};

export { swaggerUi };
