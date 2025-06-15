// src/modules/user/user.model.ts
import mongoose, { Document, Schema } from 'mongoose';
// logger, AuthMessages, HttpStatus, AuthError, NextFunction, AuthenticatedRequest không còn cần ở đây

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}
export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  refreshToken?: string; // <-- DÒNG MỚI 1: Thêm vào interface
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [50, 'Username cannot exceed 50 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
      maxlength: [100, 'Email cannot exceed 100 characters.'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Mặc định không trả về passwordHash khi query
    },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.USER],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Loại bỏ passwordHash khi chuyển thành JSON
      transform: function (doc, ret) {
        delete ret.passwordHash;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        return ret;
      },
    }
  }
);

UserSchema.pre<IUser>('save', function (next) {
  if (this.isModified('roles') && this.roles.length === 0) {
    this.roles.push(UserRole.USER);
  }
  next();
});

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;