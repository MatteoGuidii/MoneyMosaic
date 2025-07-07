# MoneyMosaic Testing Guide

Comprehensive testing documentation for MoneyMosaic.

## 🧪 Testing Overview

MoneyMosaic includes comprehensive testing with 85%+ coverage including unit tests, integration tests, and API testing.

### Test Structure

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
├── setup.ts                  # Test environment setup
├── globalSetup.ts           # Global test setup
└── globalTeardown.ts        # Global test cleanup
```

## 🚀 Quick Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- bankService.test.ts

# Run tests in watch mode
npm run test:watch

# Run only integration tests
npm test -- --testPathPattern=integration

# Run only unit tests
npm test -- --testPathPattern=unit
```

## 📊 Test Coverage

Current test coverage targets:

- **Overall Coverage**: 85%+
- **Unit Tests**: 90%+
- **Integration Tests**: 80%+
- **Critical Paths**: 100%

### Viewing Coverage Reports

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🔧 Writing Tests

### Unit Test Example

```typescript
// tests/unit/bankService.test.ts
import { BankService } from "../../src/services/bank.service";
import { Database } from "../../src/database";

describe("BankService", () => {
  let bankService: BankService;
  let mockDatabase: jest.Mocked<Database>;

  beforeEach(() => {
    mockDatabase = {
      saveInstitution: jest.fn(),
      getInstitutions: jest.fn(),
      saveAccount: jest.fn(),
      // ... other mocked methods
    } as any;

    bankService = new BankService(mockDatabase);
  });

  it("should add bank connection successfully", async () => {
    const mockData = {
      public_token: "public-test-token",
      institution: {
        institution_id: "ins_test",
        name: "Test Bank",
      },
    };

    mockDatabase.saveInstitution.mockResolvedValue(undefined);

    const result = await bankService.addBankConnection(mockData);

    expect(result).toBeDefined();
    expect(mockDatabase.saveInstitution).toHaveBeenCalledWith(
      expect.objectContaining({
        institution_id: "ins_test",
        name: "Test Bank",
      })
    );
  });
});
```

### Integration Test Example

```typescript
// tests/integration/api.test.ts
import request from "supertest";
import { app } from "../../src/server";

describe("API Integration Tests", () => {
  describe("Health Check", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toEqual({
        status: "healthy",
        timestamp: expect.any(String),
        environment: "test",
      });
    });
  });

  describe("Plaid Integration", () => {
    it("should create link token", async () => {
      const response = await request(app)
        .post("/api/link/token/create")
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty("link_token");
      expect(response.body).toHaveProperty("expiration");
    });
  });
});
```

## 🛠️ Test Environment Setup

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  globalSetup: "<rootDir>/tests/globalSetup.ts",
  globalTeardown: "<rootDir>/tests/globalTeardown.ts",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/types/**", "!src/**/*.d.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
```

### Test Database Setup

```typescript
// tests/setup.ts
import { Database } from "../src/database";

let testDb: Database;

beforeEach(async () => {
  // Create temporary test database
  testDb = new Database(":memory:");
  await testDb.init();
});

afterEach(async () => {
  // Clean up test database
  if (testDb) {
    await testDb.close();
  }
});
```

## 🎯 Testing Best Practices

### 1. Test Organization

- **Arrange-Act-Assert (AAA)** pattern
- **One assertion per test** when possible
- **Clear test descriptions** that explain behavior
- **Grouped related tests** using `describe` blocks

### 2. Mock External Dependencies

```typescript
// Mock Plaid client
jest.mock("../src/plaidClient", () => ({
  plaidClient: {
    linkTokenCreate: jest.fn(),
    itemPublicTokenExchange: jest.fn(),
    accountsGet: jest.fn(),
    transactionsGet: jest.fn(),
  },
}));
```

### 3. Test Data Management

```typescript
// tests/fixtures/testData.ts
export const mockBankData = {
  institution: {
    institution_id: "ins_test",
    name: "Test Bank",
  },
  accounts: [
    {
      account_id: "acc_test",
      name: "Test Checking",
      type: "depository",
      balances: {
        current: 1000.0,
      },
    },
  ],
  transactions: [
    {
      transaction_id: "txn_test",
      account_id: "acc_test",
      amount: -50.0,
      date: "2025-07-06",
      name: "Test Transaction",
    },
  ],
};
```

### 4. Async Testing

```typescript
it("should handle async operations", async () => {
  const promise = bankService.fetchTransactions();
  await expect(promise).resolves.toBeDefined();
});

it("should handle errors", async () => {
  mockDatabase.getTransactions.mockRejectedValue(new Error("DB Error"));

  await expect(bankService.fetchTransactions()).rejects.toThrow("DB Error");
});
```

## 🔍 Testing Strategies

### Unit Testing Focus Areas

1. **Business Logic**

   - Service layer methods
   - Data transformations
   - Validation functions

2. **Error Handling**

   - Invalid inputs
   - Network failures
   - Database errors

3. **Edge Cases**
   - Empty data sets
   - Boundary conditions
   - Race conditions

### Integration Testing Focus Areas

1. **API Endpoints**

   - Request/response validation
   - Error status codes
   - Authentication flows

2. **Database Operations**

   - CRUD operations
   - Data consistency
   - Transaction handling

3. **External Services**
   - Plaid API integration
   - Error handling
   - Rate limiting

## 🚀 Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 🧪 Manual Testing

### API Testing with Postman

1. Import collection from `collections/postman_collection.json`
2. Set environment variables
3. Run collection tests

### Frontend Testing

```bash
# Start development servers
npm run dev:both

# Manual testing checklist:
# - Bank connection flow
# - Transaction sync
# - Dashboard data display
# - Error handling
# - Responsive design
```

## 📋 Testing Checklist

### Before Release

- [ ] All tests passing
- [ ] Coverage above threshold (85%)
- [ ] Integration tests cover all API endpoints
- [ ] Error scenarios tested
- [ ] Manual testing completed
- [ ] Performance tests (if applicable)
- [ ] Security testing (if applicable)

### Code Review Checklist

- [ ] New features have tests
- [ ] Tests follow naming conventions
- [ ] Mock dependencies appropriately
- [ ] Test edge cases and error conditions
- [ ] Tests are maintainable and readable

## 🐛 Debugging Tests

### Common Issues

1. **Async timing issues**

   ```typescript
   // Use proper async/await
   await expect(promise).resolves.toBeTruthy();
   ```

2. **Database state pollution**

   ```typescript
   // Clean up after each test
   afterEach(async () => {
     await testDb.clear();
   });
   ```

3. **Mock issues**
   ```typescript
   // Reset mocks between tests
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

### Debugging Commands

```bash
# Run tests with debugging
npm test -- --verbose

# Run single test with debugging
npm test -- --testNamePattern="specific test" --verbose

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
