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

1. **Server running**: Start the MoneyMosaic server (`npm run dev`)
2. **Environment variables**: Set up your `.env` file with required API keys
3. **Database**: Initialize the database with `npm run db:init`

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

- All endpoints are pre-configured to use `http://localhost:3000` as the base URL
- Update the base URL in Postman if your server runs on a different port
- Some endpoints require authentication tokens - follow the authentication flow first
- Sandbox endpoints are available for testing without real bank connections

For more detailed API documentation, see [../docs/API.md](../docs/API.md) or the interactive Swagger UI at `http://localhost:8080/api-docs`.
