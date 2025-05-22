// src/modules/user/user.service.ts
import UserModel, { IUser, UserRole } from './user.model';
import { CreateUserInput, UpdateUserInput } from './user.schema';
import { AppError } from '@/utils';
import { HttpStatus, AuthMessages, GeneralMessages } from '@/types';
import { logger } from '@/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const createUser = async (input: CreateUserInput): Promise<Partial<IUser>> => {
  const { username, email, password, roles } = input;

  const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] }).lean();
  if (existingUser) {
    const field = existingUser.email === email ? 'Email' : 'Username';
    throw new AppError(`${field} ${AuthMessages.EMAIL_EXISTS.toLowerCase().includes(field.toLowerCase()) ? AuthMessages.EMAIL_EXISTS.split(' ').slice(1).join(' ') : AuthMessages.USERNAME_EXISTS.split(' ').slice(1).join(' ')}`, HttpStatus.CONFLICT);
  }

  let passwordHash;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash(password, salt);
  } else {
    // Nếu admin không đặt pass, có thể tạo 1 pass tạm thời hoặc yêu cầu user đặt sau
    // Hoặc đơn giản là không cho tạo nếu không có pass - tùy theo yêu cầu nghiệp vụ
    // Hiện tại, model yêu cầu passwordHash, nên nếu không có input password, cần xử lý
    throw new AppError('Password is required for new user creation by admin if not set by user later.', HttpStatus.BAD_REQUEST);
  }

  const newUserDoc = new UserModel({
    username,
    email,
    passwordHash, // Phải có passwordHash
    roles: roles && roles.length > 0 ? roles : [UserRole.USER],
  });
  const savedUser = await newUserDoc.save();
  return savedUser.toObject(); // toObject() sẽ áp dụng transform đã định nghĩa trong model
};

export const getAllUsers = async (): Promise<Partial<IUser>[]> => {
  // .lean() để tăng tốc độ và .select('-passwordHash') để loại bỏ passwordHash
  const users = await UserModel.find().lean();
  return users.map(user => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

export const getUserById = async (userId: string): Promise<Partial<IUser> | null> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(GeneralMessages.INVALID_ID_FORMAT, HttpStatus.BAD_REQUEST);
  }
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw new AppError(AuthMessages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUser = async (
  userId: string,
  currentUserId: string | undefined, // ID của admin đang thực hiện hành động
  input: UpdateUserInput
): Promise<Partial<IUser> | null> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(GeneralMessages.INVALID_ID_FORMAT, HttpStatus.BAD_REQUEST);
  }

  const userToUpdate = await UserModel.findById(userId);
  if (!userToUpdate) {
    throw new AppError(AuthMessages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  // Logic kiểm tra admin tự gỡ role cuối cùng
  if (currentUserId === userId && input.roles) {
    const isCurrentlyAdmin = userToUpdate.roles.includes(UserRole.ADMIN);
    const willBeAdmin = input.roles.includes(UserRole.ADMIN);

    if (isCurrentlyAdmin && !willBeAdmin) {
      const otherAdminsCount = await UserModel.countDocuments({
        _id: { $ne: userId },
        roles: UserRole.ADMIN,
      });
      if (otherAdminsCount === 0) {
        throw new AppError(AuthMessages.LAST_ADMIN_ROLE_REMOVE_ERROR, HttpStatus.BAD_REQUEST);
      }
    }
  }
  
  // Cập nhật các trường được phép
  if (input.username !== undefined) userToUpdate.username = input.username;
  if (input.email !== undefined) userToUpdate.email = input.email;
  if (input.roles !== undefined) userToUpdate.roles = input.roles;

  // Không cho cập nhật password ở đây, cần API riêng nếu muốn
  
  const updatedUser = await userToUpdate.save();
  logger.info(`User ${updatedUser.username} (ID: ${userId}) updated by admin (ID: ${currentUserId})`);
  return updatedUser.toObject();
};

export const deleteUser = async (
  userIdToDelete: string,
  currentUserId: string | undefined // ID của admin đang thực hiện hành động
): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(userIdToDelete)) {
    throw new AppError(GeneralMessages.INVALID_ID_FORMAT, HttpStatus.BAD_REQUEST);
  }

  const userToDelete = await UserModel.findById(userIdToDelete);
  if (!userToDelete) {
    throw new AppError(AuthMessages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  // Logic kiểm tra admin tự xóa mình khi là admin cuối cùng
  if (currentUserId === userIdToDelete && userToDelete.roles.includes(UserRole.ADMIN)) {
    const otherAdminsCount = await UserModel.countDocuments({
      _id: { $ne: userIdToDelete },
      roles: UserRole.ADMIN,
    });
    if (otherAdminsCount === 0) {
      throw new AppError(AuthMessages.LAST_ADMIN_DELETE_ERROR, HttpStatus.BAD_REQUEST);
    }
  }

  await UserModel.findByIdAndDelete(userIdToDelete);
  logger.info(`User ${userToDelete.username} (ID: ${userIdToDelete}) deleted by admin (ID: ${currentUserId})`);
  return true;
};