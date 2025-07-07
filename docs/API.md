# MoneyMosaic API

Quick reference for MoneyMosaic API endpoints.

## 🔗 Interactive Documentation

- **Swagger UI**: `http://localhost:8080/api-docs` (when server is running)
- **OpenAPI Spec**: [openapi.json](./openapi.json)

## 🔗 Base URL

- **Development**: `http://localhost:8080`
- **Production**: Configure in your deployment

## 🔑 Authentication

MoneyMosaic is designed as a single-user application. All API endpoints are currently public, but production deployments should implement authentication.

## 📋 Quick Reference

### Health Check

- `GET /health` - Check server health

### Bank Management

- `POST /api/link/token/create` - Create Plaid Link token
- `POST /api/token/exchange` - Exchange public token for access token
- `GET /api/transactions/connected_banks` - List connected banks
- `DELETE /api/transactions/banks/{id}` - Remove bank connection
- `GET /api/transactions/health_check` - Check connection health

### Dashboard Data

- `GET /api/overview` - Dashboard overview
- `GET /api/earnings` - Earnings data
- `GET /api/spending-data` - Spending data for charts
- `GET /api/category-data` - Category breakdown

### Transactions

- `POST /api/transactions/fetch` - Fetch transactions
- `GET /api/transactions` - Get filtered transactions
- `POST /api/transactions/sync` - Manual sync trigger

### Accounts & Investments

- `GET /api/accounts` - Account information
- `GET /api/investments` - Investment data

### Sandbox (Development)

- `POST /api/sandbox/public_token/create` - Create test token
- `POST /api/sandbox/reset` - Reset sandbox data

## 📊 Response Format

All endpoints return JSON with consistent structure:

**Success:**

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

**Error:**

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## 🛠️ Development

For complete API documentation with request/response examples, schemas, and testing, visit the Swagger UI at `http://localhost:8080/api-docs` when the server is running.

### Testing

Use the Postman collection in `collections/postman_collection.json` for comprehensive API testing.
