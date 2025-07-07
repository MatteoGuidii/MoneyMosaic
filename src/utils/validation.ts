import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errors';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'date';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

export class Validator {
  static validate(rules: ValidationRule[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
      const errors: string[] = [];
      
      rules.forEach(rule => {
        const value = req.body[rule.field];
        
        // Check required fields
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push(`${rule.field} is required`);
          return;
        }
        
        // Skip validation if field is not required and empty
        if (!rule.required && (value === undefined || value === null || value === '')) {
          return;
        }
        
        // Type validation
        if (rule.type) {
          if (!Validator.validateType(value, rule.type)) {
            errors.push(`${rule.field} must be of type ${rule.type}`);
            return;
          }
        }
        
        // String validations
        if (rule.type === 'string') {
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${rule.field} must be at most ${rule.maxLength} characters long`);
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${rule.field} format is invalid`);
          }
        }
        
        // Number validations
        if (rule.type === 'number') {
          if (rule.min !== undefined && value < rule.min) {
            errors.push(`${rule.field} must be at least ${rule.min}`);
          }
          if (rule.max !== undefined && value > rule.max) {
            errors.push(`${rule.field} must be at most ${rule.max}`);
          }
        }
        
        // Custom validation
        if (rule.custom && !rule.custom(value)) {
          errors.push(`${rule.field} is invalid`);
        }
      });
      
      if (errors.length > 0) {
        throw new ValidationError(errors.join(', '));
      }
      
      next();
    };
  }
  
  private static validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'date':
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  }
}

// Common validation rules
export const commonValidations = {
  publicToken: {
    field: 'public_token',
    required: true,
    type: 'string' as const,
    minLength: 10
  },
  institution: {
    field: 'institution',
    required: true,
    type: 'string' as const
  },
  dateRange: {
    field: 'range',
    required: false,
    type: 'number' as const,
    min: 1,
    max: 365
  }
};
