import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class APIError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends APIError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class PlaidError extends APIError {
  constructor(message: string, originalError?: any) {
    super(message, 503);
    logger.error('Plaid API Error', originalError);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`Error in ${req.method} ${req.path}`, error);

  // Handle known operational errors
  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      message: error.message,
      stack: error.stack 
    })
  });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
