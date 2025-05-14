import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'; // Import JwtPayload để type cho decoded token
import dotenv from 'dotenv';

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

        // Nếu token hợp lệ, lưu thông tin user đã giải mã vào request
        // để các route handler sau có thể sử dụng
        req.user = decoded as JwtPayload; // Ép kiểu decoded thành JwtPayload (hoặc kiểu payload bạn đã định nghĩa)
        next(); // Cho phép request đi tiếp đến route handler
    });
};
