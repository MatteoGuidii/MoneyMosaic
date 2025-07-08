# API Testing Collections

This directory contains API testing collections for the MoneyMosaic application.

## Contents

- `postman_collection.json` - Complete Postman collection for testing all MoneyMosaic API endpoints

## Usage

### Postman

1. Open Postman
2. Click "Import" in the top left
3. Select "File" and choose `postman_collection.json`
4. The collection will be imported with all endpoints organized by feature

### Environment Setup

Before using the collection, ensure you have:

1. **Server running**: Start MoneyMosaic (`npm run dev:both` or `npm run docker:up`)
2. **Environment variables**: Set up your `.env` file with Plaid credentials

See main [README.md](../README.md) for complete setup instructions.

### Testing Workflow

The collection includes endpoints for:

- **Authentication**: Link token creation and exchange
- **Accounts**: Bank account management
- **Transactions**: Transaction retrieval and categorization
- **Sandbox**: Test data creation and management

Each endpoint includes:

- Pre-configured request headers
- Example request bodies
- Response documentation
- Test scripts for validation

## Notes

- Endpoints use `http://localhost:8080` for API and `http://localhost:3000` for frontend
- Update base URL in Postman if using different ports
- Some endpoints require authentication - follow the authentication flow first
- Sandbox endpoints available for testing without real bank connections

For detailed API docs, see [../docs/API.md](../docs/API.md) or Swagger UI at `http://localhost:8080/api-docs`.
