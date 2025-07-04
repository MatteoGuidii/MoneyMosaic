# MoneyMosaic API Postman Collection

This directory contains the Postman collection for testing the MoneyMosaic API endpoints.

## Collection File

- `postman_collection.json` - The main and complete API testing collection

## Collection Structure

The collection includes comprehensive testing for all backend API endpoints:

### 1. Authentication & Setup

- Create Link Token
- Create Sandbox Public Token (for testing)
- Exchange Public Token for Access Token

### 2. Dashboard Data

- Get Overview (financial summary)
- Get Earnings Data
- Get Spending Data
- Get Category Data
- Get Categories List
- Get Investments Data

### 3. Transactions

- Get Transactions (with pagination)
- Get Filtered Transactions (with search, categories, date range)

### 4. Account Management

- Get Accounts List

## Usage

1. Import `postman_collection.json` into Postman
2. Set up environment variables:
   - `baseUrl`: http://localhost:8080/api
   - `managementUrl`: http://localhost:8080/api/management
3. Run the collection in order, starting with Authentication & Setup
4. The collection automatically stores tokens from API responses for subsequent requests

## Testing Features

- Automatic token extraction and storage
- Response validation tests
- Error handling verification
- Comprehensive endpoint coverage matching the backend API structure

## Synchronization

This collection is synchronized with the backend API structure and is updated whenever backend endpoints change.
