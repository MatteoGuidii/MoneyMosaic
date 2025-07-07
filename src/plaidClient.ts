import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { config } from './config';

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[config.plaid.environment as keyof typeof PlaidEnvironments],
  baseOptions: { 
    headers: { 
      'PLAID-CLIENT-ID': config.plaid.clientId,
      'PLAID-SECRET': config.plaid.secret
    } 
  }
});

export const plaidClient = new PlaidApi(plaidConfig);