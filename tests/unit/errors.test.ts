import { Request, Response, NextFunction } from 'express';
import { APIError, ValidationError, NotFoundError, AuthenticationError, PlaidError, errorHandler } from '../../src/utils/errors';
import { logger } from '../../src/utils/logger';

// Mock the logger
jest.mock('../../src/utils/logger');

describe('Error Classes', () => {
  describe('APIError', () => {
    it('should create an APIError with default status code', () => {
      const error = new APIError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
    });

    it('should create an APIError with custom status code', () => {
      const error = new APIError('Custom error', 422);
      
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(422);
      expect(error.isOperational).toBe(true);
    });

    it('should capture stack trace', () => {
      const error = new APIError('Test error');
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Test error');
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with default message', () => {
      const error = new ValidationError();
      
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should create a ValidationError with custom message', () => {
      const error = new ValidationError('Custom validation error');
      
      expect(error.message).toBe('Custom validation error');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with default message', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it('should create a NotFoundError with custom message', () => {
      const error = new NotFoundError('User not found');
      
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('AuthenticationError', () => {
    it('should create an AuthenticationError with default message', () => {
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Authentication failed');
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
    });

    it('should create an AuthenticationError with custom message', () => {
      const error = new AuthenticationError('Invalid token');
      
      expect(error.message).toBe('Invalid token');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('PlaidError', () => {
    let mockLogger: jest.Mocked<typeof logger>;

    beforeEach(() => {
      mockLogger = logger as jest.Mocked<typeof logger>;
      jest.clearAllMocks();
    });

    it('should create a PlaidError with message', () => {
      const error = new PlaidError('Plaid API failed');
      
      expect(error.message).toBe('Plaid API failed');
      expect(error.statusCode).toBe(503);
      expect(error.isOperational).toBe(true);
    });

    it('should log original error', () => {
      const originalError = new Error('Original error');
      new PlaidError('Plaid API failed', originalError);
      
      expect(mockLogger.error).toHaveBeenCalledWith('Plaid API Error', originalError);
    });
  });
});

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockLogger: jest.Mocked<typeof logger>;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      path: '/test'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    mockLogger = logger as jest.Mocked<typeof logger>;
    
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle APIError correctly', () => {
      const error = new APIError('Test API error', 422);
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Test API error'
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Error in GET /test', error);
    });

    it('should handle ValidationError correctly', () => {
      const error = new ValidationError('Invalid input');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid input'
      });
    });

    it('should handle generic Error as 500', () => {
      const error = new Error('Generic error');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Error in GET /test', error);
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new APIError('Test error');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Test error',
        stack: expect.any(String)
      });
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should include error details in development mode for generic errors', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Generic error');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Generic error',
        stack: expect.any(String)
      });
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new APIError('Test error');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Test error'
      });
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});
