# MoneyMosaic Testing Guide

Comprehensive testing setup with 70%+ coverage including unit tests, integration tests, and API testing.

## 🧪 Test Structure

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
└── setup files              # Global test configuration
```

## 🚀 Quick Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- bankService.test.ts

# Watch mode
npm run test:watch
```

## 📊 Coverage

**70%+ coverage across:**

- ✅ **Unit Tests**: Database, BankService, SchedulerService, PlaidClient
- ✅ **Integration Tests**: Complete API endpoint coverage
- ✅ **Postman Collection**: Manual API testing with automated validation

**Thresholds**: 70% minimum for branches, functions, lines, and statements

## 🔧 Configuration

- **Framework**: Jest with TypeScript support
- **Mocking**: External dependencies (Plaid API, file system)
- **Database**: Separate test database with automatic cleanup
- **CI/CD**: Automated testing on pull requests and main branch

## 🛠️ Development

### Adding Tests

1. Create test files in `unit/` or `integration/`
2. Use descriptive test names (AAA pattern)
3. Mock external dependencies
4. Ensure cleanup in `afterEach` hooks

### Debugging

```bash
# Verbose output
npm test -- --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand database.test.ts
```

For detailed examples, refer to the individual test files.
