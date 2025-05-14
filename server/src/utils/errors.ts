// server/src/utils/errors.ts

import { HttpStatus } from "@/types/auth.types";

/**
 * Lớp lỗi tùy chỉnh cho các vấn đề liên quan đến Authentication và Authorization.
 * Giúp phân biệt lỗi và xử lý tập trung hơn.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean; // Phân biệt lỗi do người dùng/client (operational) và lỗi hệ thống
  
    constructor(message: string, statusCode: number, isOperational: boolean = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
  
      // Đảm bảo prototype chain hoạt động đúng cho instanceof
      Object.setPrototypeOf(this, AppError.prototype);
  
      // Ghi lại stack trace (không bao gồm constructor của AppError)
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class AuthError extends AppError {
    constructor(message: string, statusCode: number = HttpStatus.UNAUTHORIZED) {
      super(message, statusCode, true); // Lỗi auth thường là operational
      Object.setPrototypeOf(this, AuthError.prototype);
    }
  }
  
  // Có thể thêm các lớp lỗi cụ thể khác nếu cần
  // export class NotFoundError extends AppError { ... }
  // export class ValidationError extends AppError { ... }