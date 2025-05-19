// server/src/models/UserModel.ts
import logger from '@/config/logger';
import { AuthenticatedRequest, AuthMessages, HttpStatus } from '@/types/api.types';
import { AuthError } from '@/utils/errors';
import { NextFunction } from 'express';
import mongoose, { Document, Schema } from 'mongoose';


export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator', // Ví dụ thêm role
}
// Định nghĩa interface cho User document (để TypeScript hiểu rõ hơn)
export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string; // Sẽ lưu mật khẩu đã được băm (hashed)
  roles: UserRole[];
  createdAt?: Date; 
  updatedAt?: Date; 
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'], // Bắt buộc phải có username
      unique: true, // Username phải là duy nhất
      trim: true, // Xóa khoảng trắng thừa ở đầu và cuối
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true, // Lưu email dưới dạng chữ thường
      match: [ // Kiểm tra định dạng email cơ bản
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    passwordHash: {
      // Đổi tên từ HashedPassword cho nó "chuẩn Mongoose" hơn một chút
      // và bỏ Salt vì thư viện băm mật khẩu như bcryptjs sẽ tự quản lý salt
      type: String,
      required: [true, 'Password is required'],
      // Không lưu salt riêng, bcryptjs sẽ nhúng salt vào trong chuỗi hash
    },
    roles: { // << THÊM KHỐI NÀY
      type: [String],
      enum: Object.values(UserRole), // Chỉ cho phép các giá trị trong UserRole enum
      default: [UserRole.USER], // Mặc định là user
      required: true,
    },
  },
  {
    timestamps: true, // Tự động thêm hai trường: createdAt (registrationDate) và updatedAt (có thể dùng cho lastLoginDate)
  }
);

UserSchema.pre<IUser>('save', function (next) {
  if (this.roles.length === 0) {
    this.roles.push(UserRole.USER);
  }
  next();
});
// Tạo và export User model
const UserModel = mongoose.model<IUser>('User', UserSchema);


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

export default UserModel;
