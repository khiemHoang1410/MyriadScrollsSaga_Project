// server/src/middleware/optionalAuthenticateToken.ts
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthenticatedUserPayload, AuthMessages } from '@/types';
import { logger } from '@/config';

const JWT_SECRET = process.env.JWT_SECRET;

export const optionalAuthenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!JWT_SECRET) {
      logger.error(AuthMessages.JWT_SECRET_MISSING);
      // Vẫn tiếp tục để không làm treo request, server sẽ hoạt động như user chưa đăng nhập.
      return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Nếu không có token, đây là trường hợp hợp lệ, tiếp tục xử lý như người dùng ẩn danh.
    if (!token) {
      return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      // Nếu token không hợp lệ (hết hạn, sai chữ ký), cũng không sao, tiếp tục xử lý như ẩn danh.
      if (err) {
        logger.debug(`Optional auth: Invalid token received (${err.name}). Proceeding as anonymous.`);
        return next();
      }

      // Chỉ khi token hợp lệ VÀ có cấu trúc đúng, chúng ta mới gán req.user
      if (
        typeof decoded === 'object' &&
        decoded !== null &&
        'userId' in decoded &&
        'username' in decoded &&
        'roles' in decoded &&
        Array.isArray(decoded.roles)
      ) {
        req.user = decoded as AuthenticatedUserPayload;
        logger.debug(`Optional auth: User ${req.user.username} authenticated.`);
      } else {
        logger.warn('Optional auth: Decoded JWT payload is malformed.');
      }
      
      // Luôn luôn gọi next() để đi tiếp
      next();
    });
};