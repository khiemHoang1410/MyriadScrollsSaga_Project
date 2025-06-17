// server/src/middleware/flexibleAuth.ts

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthenticatedUserPayload, HttpStatus, AuthMessages } from '@/types';
import { AuthError } from '@/utils';
import { logger } from '@/config';

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware này sẽ:
// 1. Nếu không có token, cho qua như guest.
// 2. Nếu có token hợp lệ, gán req.user và cho qua.
// 3. Nếu có token nhưng KHÔNG hợp lệ (hết hạn, sai), NÉM LỖI 401.
export const flexibleAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!JWT_SECRET) {
    // Trường hợp server lỗi, không nên để lộ thông tin, cứ cho qua như guest
    logger.error(AuthMessages.JWT_SECRET_MISSING);
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // Nếu không có token, đây là guest, cho qua
  if (!token) {
    return next();
  }

  // Nếu CÓ token, ta phải kiểm tra nó
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    // Nếu token lỗi (hết hạn, sai chữ ký) -> NÉM LỖI
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AuthError(AuthMessages.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED));
      }
      logger.warn(`Invalid token received: ${err.name} - ${err.message}`);
      return next(new AuthError(AuthMessages.TOKEN_INVALID, HttpStatus.FORBIDDEN));
    }

    // Nếu token hợp lệ, gán user và cho qua
    req.user = decoded as AuthenticatedUserPayload;
    next();
  });
};