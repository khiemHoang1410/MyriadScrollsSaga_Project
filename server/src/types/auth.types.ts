// server/src/types/auth.types.ts
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '@/models/UserModel'; // Import UserRole

export interface AuthenticatedUserPayload extends JwtPayload {
  userId: string;
  username: string;
  roles: UserRole[]; // << THÊM/CẬP NHẬT DÒNG NÀY
  // email?: string;
}
// ... (AuthenticatedRequest, HttpStatus, AuthMessages giữ nguyên như trước)
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload;
}

export const HttpStatus = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  BAD_REQUEST: 400,
  OK: 200,
  CREATED: 201,
  NOT_FOUND: 404,
} as const;

export const AuthMessages = {
  NO_TOKEN: 'No token provided. Access denied.',
  TOKEN_EXPIRED: 'Token expired. Please log in again.',
  TOKEN_INVALID: 'Token is not valid. Access forbidden.',
  JWT_SECRET_MISSING: 'Server configuration error: JWT_SECRET is not defined.',
  SERVER_ERROR_VERIFY_TOKEN: 'Server configuration error - Cannot verify token.',
  USER_DATA_NOT_FOUND_IN_TOKEN: 'User data not found in token after verification.',
  ACCESS_DENIED_MISSING_ROLES: 'Access denied. User does not have the required roles.',
  USER_NOT_FOUND: 'User not found.',
  INVALID_CREDENTIALS: 'Invalid credentials.',
} as const;

export const GeneralMessages = {
    SUCCESS: 'Operation successful.',
    ERROR: 'An error occurred.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION_ERROR: 'Validation failed.',
} as const;