const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
import { swaggerSchemas } from './schemas';
import { dashboardSchemas } from './dashboardSchemas';
import { investmentSchemas } from './investmentSchemas';

const swaggerOptions: any = {
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
    components: {
      schemas: {
        ...swaggerSchemas,
        ...dashboardSchemas,
        ...investmentSchemas,
      },
    },
    tags: [
      {
        name: 'Plaid',
        description: 'Plaid integration endpoints',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard data endpoints',
      },
      {
        name: 'Transactions',
        description: 'Transaction management endpoints',
      },
      {
        name: 'Investments',
        description: 'Investment portfolio endpoints',
      },
      {
        name: 'Accounts',
        description: 'Account management endpoints',
      },
      {
        name: 'Analytics',
        description: 'Financial analytics endpoints',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/**/*.ts',
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export { swaggerSpec, swaggerUi };
