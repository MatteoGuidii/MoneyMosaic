# MoneyMosaic Testing Guide

This guide covers the comprehensive testing setup for MoneyMosaic, including unit tests, integration tests, and API testing with Postman.

## Table of Contents

- [Testing Framework](#testing-framework)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [Postman API Testing](#postman-api-testing)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)
- [Continuous Integration](#continuous-integration)
- [Debugging Tests](#debugging-tests)
- [Contributing](#contributing)

## Testing Framework

MoneyMosaic uses the following testing stack:

- **Jest**: Testing framework and test runner
- **ts-jest**: TypeScript transformer for Jest
- **Supertest**: HTTP assertion library for API testing
- **Postman**: Manual and automated API testing

### Dependencies

```json
{
  "@types/jest": "^29.5.12",
  "@types/supertest": "^2.0.16",
  "jest": "^29.7.0",
  "supertest": "^6.3.4",
  "ts-jest": "^29.1.2"
}
```

## Test Structure

```
tests/
├── unit/                     # Unit tests for individual modules
│   ├── database.test.ts      # Database layer tests
│   ├── bankService.test.ts   # Bank service tests
│   ├── schedulerService.test.ts # Scheduler service tests
│   └── plaidClient.test.ts   # Plaid client tests
├── integration/              # Integration tests
│   └── api.test.ts          # Full API endpoint tests
├── fixtures/                 # Test data and utilities
│   └── testData.ts          # Mock data and test helpers
├── setup.ts                 # Global test setup
├── globalSetup.ts           # Jest global setup
└── globalTeardown.ts        # Jest global teardown
```

## Running Tests

### Available Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Test Environment

Tests automatically use a separate test database and mock Plaid API calls to avoid affecting production data.

## Unit Tests

Unit tests focus on testing individual modules in isolation.

### Database Tests (`tests/unit/database.test.ts`)

Tests the SQLite database layer:

- ✅ Institution management (save, retrieve, list)
- ✅ Account management (save, retrieve by institution)
- ✅ Transaction management (save, retrieve, filtering)
- ✅ Transaction summary generation
- ✅ Error handling and database operations

### Bank Service Tests (`tests/unit/bankService.test.ts`)

Tests the business logic layer:

- ✅ Bank connection management
- ✅ Transaction fetching and processing
- ✅ Health check functionality
- ✅ Plaid API integration (mocked)
- ✅ Error handling and retry logic

### Scheduler Service Tests (`tests/unit/schedulerService.test.ts`)

Tests the background job scheduler:

- ✅ Job scheduling and management
- ✅ Manual sync triggers
- ✅ Health check scheduling
- ✅ Job status reporting
- ✅ Error handling in scheduled tasks

### Plaid Client Tests (`tests/unit/plaidClient.test.ts`)

Tests the Plaid API integration:

- ✅ Mocking setup verification
- ✅ API call validation
- ✅ Error handling

## Integration Tests

Integration tests verify the complete API functionality.

### API Tests (`tests/integration/api.test.ts`)

Tests all API endpoints with real HTTP requests:

- ✅ `POST /api/create_link_token` - Link token creation
- ✅ `POST /api/exchange_public_token` - Token exchange
- ✅ `POST /api/sandbox/public_token/create` - Sandbox testing
- ✅ `GET /api/connected_banks` - Bank listing
- ✅ `POST /api/fetch_transactions` - Transaction fetching
- ✅ `GET /api/health_check` - Connection health
- ✅ `GET /api/scheduler_status` - Scheduler status
- ✅ `DELETE /api/banks/:id` - Bank removal

## Postman API Testing

### Collection Features

The comprehensive Postman collection (`_postman_/postman_collection.json`) includes:

- **Environment Variables**: Dynamic token storage
- **Test Scripts**: Automated response validation
- **Pre-request Scripts**: Setup and validation
- **Error Testing**: Invalid data handling

### Collection Structure

1. **Authentication & Setup**

   - Create Link Token

2. **Sandbox Testing**

   - Create Sandbox Public Token (Chase)
   - Create Sandbox Public Token (Bank of America)

3. **Bank Connection Management**

   - Exchange Public Token
   - Get Connected Banks
   - Health Check

4. **Transaction Management**

   - Fetch Transactions (30 days)
   - Fetch Transactions (7 days)
   - Manual Sync

5. **System Status**

   - Scheduler Status

6. **Cleanup & Error Testing**
   - Remove Bank Connection
   - Test Invalid Endpoint
   - Test Invalid JSON

### Running Postman Tests

1. **Import Collection**: Import `_postman_/postman_collection.json`
2. **Set Variables**: Update `baseUrl` if needed (default: `http://localhost:3000/api`)
3. **Start Server**: Ensure MoneyMosaic server is running
4. **Run Collection**: Execute tests in order or use Collection Runner

### Automated Validation

Each request includes automatic validation:

```javascript
// Response time validation
pm.test("Response time is less than 5000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(5000);
});

// Status code validation
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

// Data structure validation
pm.test("Response has required properties", function () {
  pm.expect(pm.response.json()).to.have.property("link_token");
});
```

## Test Coverage

### Coverage Reports

Coverage reports are generated in multiple formats:

- **Terminal**: Real-time coverage output
- **HTML**: Detailed interactive report in `coverage/`
- **LCOV**: For CI/CD integration

### Coverage Thresholds

Minimum coverage requirements:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

## Best Practices

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain expected behavior
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Clean up after tests** using `afterEach` and `beforeEach`

### Mocking Strategy

1. **Mock external dependencies** (Plaid API, file system)
2. **Use real database** for integration tests
3. **Isolate units** in unit tests
4. **Mock time-dependent** functions when needed

### Test Data

1. **Use fixtures** for consistent test data
2. **Create minimal** test datasets
3. **Clean up** test data after each test
4. **Use factories** for complex object creation

### Assertions

```typescript
// Good: Specific assertions
expect(response.status).toBe(200);
expect(response.body).toHaveProperty("access_token");
expect(response.body.access_token).toMatch(/^access-sandbox-/);

// Avoid: Generic assertions
expect(response).toBeTruthy();
```

### Error Testing

1. **Test error conditions** as thoroughly as success paths
2. **Verify error messages** and status codes
3. **Test edge cases** and boundary conditions
4. **Mock API failures** to test error handling

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v1
```

### Environment Variables for CI

```bash
NODE_ENV=test
PLAID_CLIENT_ID=test_client_id
PLAID_SECRET=test_secret
PLAID_ENV=sandbox
DB_PATH=./data/test.db
```

## Debugging Tests

### Common Issues

1. **Database conflicts**: Ensure test DB is cleaned up
2. **Async issues**: Use proper `await` in tests
3. **Mock leakage**: Clear mocks between tests
4. **Port conflicts**: Use different ports for test server

### Debugging Tips

```typescript
// Add debugging output
console.log('Test data:', testData);

// Use Jest's debug mode
npm test -- --verbose --no-cache

// Run specific test file
npm test -- database.test.ts

// Run with debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Contributing

When adding new features:

1. **Write tests first** (TDD approach)
2. **Update test documentation** as needed
3. **Maintain coverage** above thresholds
4. **Add Postman tests** for new API endpoints
5. **Update fixtures** with new test data

For questions or issues with testing, please refer to the main project documentation or create an issue.
