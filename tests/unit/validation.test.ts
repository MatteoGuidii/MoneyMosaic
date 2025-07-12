import { Request, Response, NextFunction } from 'express';
import { Validator, ValidationRule, commonValidations } from '../../src/utils/validation';
import { ValidationError } from '../../src/utils/errors';

// Mock Express objects
const mockRequest = (body: any = {}) => ({
  body
}) as Request;

const mockResponse = () => ({}) as Response;

const mockNext = jest.fn() as NextFunction;

describe('Validator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    describe('required field validation', () => {
      it('should pass when required field is present', () => {
        const rules: ValidationRule[] = [
          { field: 'name', required: true, type: 'string' }
        ];
        
        const req = mockRequest({ name: 'John Doe' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError when required field is missing', () => {
        const rules: ValidationRule[] = [
          { field: 'name', required: true, type: 'string' }
        ];
        
        const req = mockRequest({});
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('name is required');
      });

      it('should throw ValidationError when required field is null', () => {
        const rules: ValidationRule[] = [
          { field: 'name', required: true, type: 'string' }
        ];
        
        const req = mockRequest({ name: null });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('name is required');
      });

      it('should throw ValidationError when required field is empty string', () => {
        const rules: ValidationRule[] = [
          { field: 'name', required: true, type: 'string' }
        ];
        
        const req = mockRequest({ name: '' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('name is required');
      });
    });

    describe('type validation', () => {
      it('should validate string type correctly', () => {
        const rules: ValidationRule[] = [
          { field: 'name', type: 'string' }
        ];
        
        const req = mockRequest({ name: 'John Doe' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError for invalid string type', () => {
        const rules: ValidationRule[] = [
          { field: 'name', type: 'string' }
        ];
        
        const req = mockRequest({ name: 123 });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('name must be of type string');
      });

      it('should validate number type correctly', () => {
        const rules: ValidationRule[] = [
          { field: 'age', type: 'number' }
        ];
        
        const req = mockRequest({ age: 25 });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError for invalid number type', () => {
        const rules: ValidationRule[] = [
          { field: 'age', type: 'number' }
        ];
        
        const req = mockRequest({ age: 'twenty-five' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('age must be of type number');
      });

      it('should validate boolean type correctly', () => {
        const rules: ValidationRule[] = [
          { field: 'active', type: 'boolean' }
        ];
        
        const req = mockRequest({ active: true });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError for invalid boolean type', () => {
        const rules: ValidationRule[] = [
          { field: 'active', type: 'boolean' }
        ];
        
        const req = mockRequest({ active: 'yes' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('active must be of type boolean');
      });

      it('should validate email type correctly', () => {
        const rules: ValidationRule[] = [
          { field: 'email', type: 'email' }
        ];
        
        const req = mockRequest({ email: 'test@example.com' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError for invalid email format', () => {
        const rules: ValidationRule[] = [
          { field: 'email', type: 'email' }
        ];
        
        const req = mockRequest({ email: 'invalid-email' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('email must be of type email');
      });

      it('should validate date type correctly', () => {
        const rules: ValidationRule[] = [
          { field: 'birthdate', type: 'date' }
        ];
        
        const req = mockRequest({ birthdate: '2023-01-01' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError for invalid date format', () => {
        const rules: ValidationRule[] = [
          { field: 'birthdate', type: 'date' }
        ];
        
        const req = mockRequest({ birthdate: 'invalid-date' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('birthdate must be of type date');
      });
    });

    describe('string length validation', () => {
      it('should validate minimum length correctly', () => {
        const rules: ValidationRule[] = [
          { field: 'password', type: 'string', minLength: 8 }
        ];
        
        const req = mockRequest({ password: 'password123' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError for string too short', () => {
        const rules: ValidationRule[] = [
          { field: 'password', type: 'string', minLength: 8 }
        ];
        
        const req = mockRequest({ password: '123' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('password must be at least 8 characters long');
      });

      it('should validate maximum length correctly', () => {
        const rules: ValidationRule[] = [
          { field: 'title', type: 'string', maxLength: 100 }
        ];
        
        const req = mockRequest({ title: 'Short title' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError for string too long', () => {
        const rules: ValidationRule[] = [
          { field: 'title', type: 'string', maxLength: 10 }
        ];
        
        const req = mockRequest({ title: 'This is a very long title' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('title must be at most 10 characters long');
      });
    });

    describe('number range validation', () => {
      it('should validate minimum value correctly', () => {
        const rules: ValidationRule[] = [
          { field: 'age', type: 'number', min: 18 }
        ];
        
        const req = mockRequest({ age: 25 });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError for number too small', () => {
        const rules: ValidationRule[] = [
          { field: 'age', type: 'number', min: 18 }
        ];
        
        const req = mockRequest({ age: 15 });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('age must be at least 18');
      });

      it('should validate maximum value correctly', () => {
        const rules: ValidationRule[] = [
          { field: 'score', type: 'number', max: 100 }
        ];
        
        const req = mockRequest({ score: 85 });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError for number too large', () => {
        const rules: ValidationRule[] = [
          { field: 'score', type: 'number', max: 100 }
        ];
        
        const req = mockRequest({ score: 150 });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('score must be at most 100');
      });
    });

    describe('pattern validation', () => {
      it('should validate pattern correctly', () => {
        const rules: ValidationRule[] = [
          { field: 'phone', type: 'string', pattern: /^\d{10}$/ }
        ];
        
        const req = mockRequest({ phone: '1234567890' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError for invalid pattern', () => {
        const rules: ValidationRule[] = [
          { field: 'phone', type: 'string', pattern: /^\d{10}$/ }
        ];
        
        const req = mockRequest({ phone: 'invalid-phone' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('phone format is invalid');
      });
    });

    describe('custom validation', () => {
      it('should validate custom function correctly', () => {
        const rules: ValidationRule[] = [
          { field: 'username', type: 'string', custom: (value: string) => value.toLowerCase() === value }
        ];
        
        const req = mockRequest({ username: 'lowercase' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError for failed custom validation', () => {
        const rules: ValidationRule[] = [
          { field: 'username', type: 'string', custom: (value: string) => value.toLowerCase() === value }
        ];
        
        const req = mockRequest({ username: 'UPPERCASE' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('username is invalid');
      });
    });

    describe('optional field validation', () => {
      it('should skip validation for optional empty fields', () => {
        const rules: ValidationRule[] = [
          { field: 'optional_field', required: false, type: 'string', minLength: 5 }
        ];
        
        const req = mockRequest({});
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should validate optional field when present', () => {
        const rules: ValidationRule[] = [
          { field: 'optional_field', required: false, type: 'string', minLength: 5 }
        ];
        
        const req = mockRequest({ optional_field: 'valid' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });

      it('should throw ValidationError for invalid optional field', () => {
        const rules: ValidationRule[] = [
          { field: 'optional_field', required: false, type: 'string', minLength: 10 }
        ];
        
        const req = mockRequest({ optional_field: 'short' });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('optional_field must be at least 10 characters long');
      });
    });

    describe('multiple validation errors', () => {
      it('should combine multiple validation errors', () => {
        const rules: ValidationRule[] = [
          { field: 'name', required: true, type: 'string' },
          { field: 'email', required: true, type: 'email' }
        ];
        
        const req = mockRequest({});
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
        expect(() => validator(req, res, mockNext)).toThrow('name is required, email is required');
      });
    });

    describe('complex validation scenarios', () => {
      it('should handle complex validation rules', () => {
        const rules: ValidationRule[] = [
          { field: 'email', required: true, type: 'email' },
          { field: 'password', required: true, type: 'string', minLength: 8, maxLength: 50 },
          { field: 'age', required: true, type: 'number', min: 13, max: 120 },
          { field: 'phone', required: false, type: 'string', pattern: /^\d{10}$/ }
        ];
        
        const req = mockRequest({
          email: 'test@example.com',
          password: 'securepassword123',
          age: 25,
          phone: '1234567890'
        });
        const res = mockResponse();
        
        const validator = Validator.validate(rules);
        
        expect(() => validator(req, res, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe('validateType', () => {
    it('should handle NaN for number type', () => {
      const rules: ValidationRule[] = [
        { field: 'num', type: 'number' }
      ];
      
      const req = mockRequest({ num: NaN });
      const res = mockResponse();
      
      const validator = Validator.validate(rules);
      
      expect(() => validator(req, res, mockNext)).toThrow(ValidationError);
      expect(() => validator(req, res, mockNext)).toThrow('num must be of type number');
    });

    it('should handle unknown type gracefully', () => {
      const rules: ValidationRule[] = [
        { field: 'field', type: 'unknown' as any }
      ];
      
      const req = mockRequest({ field: 'value' });
      const res = mockResponse();
      
      const validator = Validator.validate(rules);
      
      expect(() => validator(req, res, mockNext)).not.toThrow();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});

describe('commonValidations', () => {
  it('should have correct publicToken validation', () => {
    expect(commonValidations.publicToken).toEqual({
      field: 'public_token',
      required: true,
      type: 'string',
      minLength: 10
    });
  });

  it('should have correct institution validation', () => {
    expect(commonValidations.institution).toEqual({
      field: 'institution',
      required: true,
      type: 'string'
    });
  });

  it('should have correct dateRange validation', () => {
    expect(commonValidations.dateRange).toEqual({
      field: 'range',
      required: false,
      type: 'number',
      min: 1,
      max: 365
    });
  });
});
