// server/src/types/auth.types.ts (Hoặc đổi tên thành api.types.ts nếu muốn chung hơn)
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
// Giả sử UserRole sẽ được import từ user.model.ts sau này
// import { UserRole } from '@/modules/user/user.model'; // Đường dẫn sẽ thay đổi

// Tạm thời định nghĩa UserRole ở đây, sau sẽ import từ user.model
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export interface AuthenticatedUserPayload extends JwtPayload {
  userId: string;
  username: string;
  roles: UserRole[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload;
}

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409, // Ví dụ: resource đã tồn tại
  INTERNAL_SERVER_ERROR: 500,
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
  EMAIL_EXISTS: 'Email already exists.',
  USERNAME_EXISTS: 'Username already exists.',
  REGISTRATION_SUCCESS: 'User registered successfully! Please log in.',
  LOGIN_SUCCESS: 'Login successful!',
  ACCOUNT_CONFIG_ERROR: 'User account is improperly configured.',
  TOKEN_GENERATION_FAILED: 'Failed to generate authentication token.',
  USERID_MISSING_FOR_TOKEN: 'Cannot generate token: Valid User ID is missing or invalid.',
  LAST_ADMIN_ROLE_REMOVE_ERROR: 'Cannot remove the last admin role from your own account.',
  LAST_ADMIN_DELETE_ERROR: 'Cannot delete your own account as the last admin.',
} as const;

export const GeneralMessages = {
  SUCCESS: 'Operation successful.',
  ERROR: 'An error occurred.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation failed.',
  UPDATE_SUCCESS: 'Resource updated successfully.',
  DELETE_SUCCESS: 'Resource deleted successfully.',
  RETRIEVED_SUCCESS: 'Resource retrieved successfully.',
  EMPTY_BODY_ERROR: 'Request body cannot be empty. At least one field to update must be provided.',
  INVALID_ID_FORMAT: 'Invalid ID format.',
} as const;