// server/src/middleware/authenticateToken.ts
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthenticatedUserPayload, HttpStatus, AuthMessages } from '@/types'; // Import từ barrel file types
import { AppError, AuthError } from '@/utils'; // Import từ barrel file utils
import { logger } from '@/config'; // Import từ barrel file config

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    if (!JWT_SECRET) {
      logger.error(AuthMessages.JWT_SECRET_MISSING + ' Ensure .env file is loaded and JWT_SECRET is set.');
      throw new AppError(AuthMessages.SERVER_ERROR_VERIFY_TOKEN, HttpStatus.INTERNAL_SERVER_ERROR, false);
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return next(new AuthError(AuthMessages.NO_TOKEN, HttpStatus.UNAUTHORIZED)); // Trả lỗi qua next()
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return next(new AuthError(AuthMessages.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED));
        }
        logger.warn(`Invalid token received: ${err.name} - ${err.message}`);
        return next(new AuthError(AuthMessages.TOKEN_INVALID, HttpStatus.FORBIDDEN));
      }

      if (
        typeof decoded !== 'object' ||
        decoded === null ||
        !('userId' in decoded) ||
        !('username' in decoded) ||
        !('roles' in decoded) ||
        !Array.isArray(decoded.roles)
      ) {
        logger.error('Decoded JWT payload is malformed or missing required fields (userId, username, roles).');
        return next(new AppError(AuthMessages.USER_DATA_NOT_FOUND_IN_TOKEN, HttpStatus.INTERNAL_SERVER_ERROR, false));
      }

      req.user = decoded as AuthenticatedUserPayload;
      next();
    });
  } catch (error) {
    next(error); // Chuyển lỗi cho global error handler
  }
};