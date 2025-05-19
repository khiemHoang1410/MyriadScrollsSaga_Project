// server/src/utils/errors.ts
import { HttpStatus } from '@/types'; // Sẽ tạo barrel file cho types

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthError extends AppError {
  constructor(message: string, statusCode: number = HttpStatus.UNAUTHORIZED) {
    super(message, statusCode, true);
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

// export class NotFoundError extends AppError {
//   constructor(message: string = 'Resource not found') {
//     super(message, HttpStatus.NOT_FOUND, true);
//     Object.setPrototypeOf(this, NotFoundError.prototype);
//   }
// }

// export class ValidationError extends AppError {
//   public readonly errors?: any[]; // Để chứa mảng lỗi chi tiết từ Zod hoặc Mongoose
//   constructor(message: string = 'Validation failed', errors?: any[], statusCode: number = HttpStatus.BAD_REQUEST) {
//     super(message, statusCode, true);
//     this.errors = errors;
//     Object.setPrototypeOf(this, ValidationError.prototype);
//   }
// }