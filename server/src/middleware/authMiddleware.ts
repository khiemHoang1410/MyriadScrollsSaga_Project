import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'; // Import JwtPayload để type cho decoded token
import dotenv from 'dotenv';
import { AuthenticatedRequest, AuthenticatedUserPayload, HttpStatus, AuthMessages } from '@/types/auth.types';
import { AppError, AuthError } from '@/utils/errors';
import logger from '@/config/logger';
import { UserRole } from '@/models/UserModel';

dotenv.config();

// Mở rộng interface Request của Express để có thể thêm thuộc tính 'user'
// Cách này giúp TypeScript hiểu req.user mà không báo lỗi
export interface AuthRequest extends Request {
    user?: string | JwtPayload; // user có thể là string (nếu chỉ lưu userId) hoặc cả object payload
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Lấy token từ header 'Authorization'. Token thường có dạng "Bearer TOKEN_STRING"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy phần TOKEN_STRING

    if (token == null) {
        // Nếu không có token, trả về lỗi 401 Unauthorized
        res.status(401).json({ message: 'No token provided. Access denied.' });
        return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('FATAL ERROR: JWT_SECRET is not defined in .env file. Cannot verify token.');
        res.status(500).json({ message: 'Server configuration error - Cannot verify token.' });
        return;
    }

    // Xác thực token
    jwt.verify(token, jwtSecret, (err: any, decoded: any) => { // decoded có thể là JwtPayload | string | undefined
        if (err) {
            // Nếu token không hợp lệ (ví dụ: hết hạn, sai chữ ký)
            if (err.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Token expired. Please log in again.' });
                return;
            }
            res.status(403).json({ message: 'Token is not valid. Access forbidden.' }); 
            return;
        }

        if (typeof decoded !== 'object' || decoded === null ||
            !('userId' in decoded) ||
            !('username' in decoded) ||
            !('roles' in decoded) || // << KIỂM TRA THÊM ROLES
            !Array.isArray(decoded.roles) // Đảm bảo roles là một mảng
        ) {
            logger.error('Decoded JWT payload is malformed or missing required fields (userId, username, roles).');
            return next(new AppError(AuthMessages.USER_DATA_NOT_FOUND_IN_TOKEN, HttpStatus.INTERNAL_SERVER_ERROR, false));
        }
        // Nếu token hợp lệ, lưu thông tin user đã giải mã vào request
        // để các route handler sau có thể sử dụng
        req.user = decoded as JwtPayload; // Ép kiểu decoded thành JwtPayload (hoặc kiểu payload bạn đã định nghĩa)
        next(); // Cho phép request đi tiếp đến route handler
    });
};

/**
 * Middleware kiểm tra vai trò (roles) của người dùng.
 * Middleware này phải được dùng SAU authenticateToken.
 * @param {...UserRole} allowedRoles - Danh sách các roles được phép truy cập.
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user || !req.user.roles) {
        // Lỗi này không nên xảy ra nếu authenticateToken chạy đúng
        logger.warn('authorizeRoles middleware called without req.user or req.user.roles populated.');
        return next(new AuthError(AuthMessages.TOKEN_INVALID, HttpStatus.FORBIDDEN));
      }
  
      const userRoles = req.user.roles;
      const hasRequiredRole = userRoles.some(role => allowedRoles.includes(role));
  
      if (!hasRequiredRole) {
        logger.warn(`User ${req.user.username} (roles: ${userRoles.join(', ')}) attempted to access a resource restricted to roles: ${allowedRoles.join(', ')}`);
        return next(new AuthError(
          `${AuthMessages.ACCESS_DENIED_MISSING_ROLES} Required: ${allowedRoles.join(' or ')}.`,
          HttpStatus.FORBIDDEN
        ));
      }
      next();
    };
  };
