export const swaggerSchemas = {
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
  
  Institution: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Institution ID',
      },
      name: {
        type: 'string',
        description: 'Institution name',
      },
      plaid_institution_id: {
        type: 'string',
        description: 'Plaid institution ID',
      },
      is_active: {
        type: 'boolean',
        description: 'Whether the institution is active',
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
      },
    },
    required: ['id', 'name', 'plaid_institution_id', 'is_active'],
  },
  
  Account: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Account ID',
      },
      institution_id: {
        type: 'string',
        description: 'Institution ID',
      },
      plaid_account_id: {
        type: 'string',
        description: 'Plaid account ID',
      },
      name: {
        type: 'string',
        description: 'Account name',
      },
      type: {
        type: 'string',
        enum: ['depository', 'credit', 'investment', 'loan', 'other'],
        description: 'Account type',
      },
      subtype: {
        type: 'string',
        description: 'Account subtype',
      },
      current_balance: {
        type: 'number',
        description: 'Current account balance',
      },
      available_balance: {
        type: 'number',
        description: 'Available account balance',
      },
      iso_currency_code: {
        type: 'string',
        description: 'ISO currency code',
      },
      unofficial_currency_code: {
        type: 'string',
        description: 'Unofficial currency code',
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
      },
    },
    required: ['id', 'institution_id', 'plaid_account_id', 'name', 'type'],
  },
  
  Transaction: {
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
      amount: {
        type: 'number',
        description: 'Transaction amount',
      },
      iso_currency_code: {
        type: 'string',
        description: 'ISO currency code',
      },
      unofficial_currency_code: {
        type: 'string',
        description: 'Unofficial currency code',
      },
      category: {
        type: 'string',
        description: 'Transaction category',
      },
      subcategory: {
        type: 'string',
        description: 'Transaction subcategory',
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
      merchant_name: {
        type: 'string',
        description: 'Merchant name',
      },
      pending: {
        type: 'boolean',
        description: 'Whether the transaction is pending',
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
      },
    },
    required: ['id', 'account_id', 'plaid_transaction_id', 'amount', 'date', 'name'],
  },
};
