module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    // Infrastructure files that don't need testing
    '!src/server.ts', // Main server entry point
    '!src/generate-openapi.ts', // OpenAPI generation script
    '!src/swagger.ts', // Swagger configuration
    '!src/config/**', // Configuration files
    '!src/types/**', // Type definitions
    // Routes that are not yet implemented or are integration-heavy
    '!src/routes/sync.ts', // Not implemented yet
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 60000, // Increased timeout to 60 seconds
  // Force exit after tests complete to prevent hanging
  forceExit: true,
  // Handle SQLite database in tests
  globalSetup: '<rootDir>/tests/globalSetup.ts',
  globalTeardown: '<rootDir>/tests/globalTeardown.ts',
  // Module mapping for better imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  // Optimized test output settings - minimal but informative
  verbose: false,
  silent: false,
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  // Coverage thresholds - aiming for 85%+ coverage
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  // Run tests serially to prevent database conflicts
  maxWorkers: 1,
  // Prevent worker crashes
  workerIdleMemoryLimit: '512MB',
  // Handle unhandled promise rejections
  detectOpenHandles: false,
  // Bail on first failure to prevent cascading issues
  bail: 1,
  // Clean up mocks between tests
  clearMocks: true,
  restoreMocks: true
};
