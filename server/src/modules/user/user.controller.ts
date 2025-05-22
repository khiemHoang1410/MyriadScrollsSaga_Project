// src/modules/user/user.controller.ts
import { Response } from 'express';
import * as userService from './user.service';
import { CreateUserInput, UpdateUserInput, UpdateUserParams, UserIdParams } from './user.schema';
import { HttpStatus, GeneralMessages, AuthenticatedRequest } from '@/types';
import { Request } from 'express'; // Import Request gốc từ Express

// Kiểu cho request handler đã được xác thực và có params/body cụ thể
type AuthRequestWithParams<P = any, ResBody = any, ReqBody = any, ReqQuery = any> = AuthenticatedRequest & Request<P, ResBody, ReqBody, ReqQuery>;

export const createUserHandler = async (
  req: AuthRequestWithParams<{}, {}, CreateUserInput>, // Sử dụng kiểu kết hợp
  res: Response
): Promise<void> => {
  const newUser = await userService.createUser(req.body);
  res.status(HttpStatus.CREATED).json({
    message: 'User created successfully by admin.',
    data: newUser,
  });
};

export const getAllUsersHandler = async (
  req: AuthenticatedRequest, // getAllUsers không có params hay body đặc biệt từ client
  res: Response
): Promise<void> => {
  const users = await userService.getAllUsers();
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.RETRIEVED_SUCCESS,
    count: users.length,
    data: users,
  });
};

export const getUserByIdHandler = async (
  req: AuthRequestWithParams<UserIdParams>, // Sử dụng kiểu kết hợp
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.RETRIEVED_SUCCESS,
    data: user,
  });
};

export const updateUserHandler = async (
  req: AuthRequestWithParams<UpdateUserParams, {}, UpdateUserInput>, // Sử dụng kiểu kết hợp
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const currentAdminId = req.user?.userId;
  const updatedUser = await userService.updateUser(userId, currentAdminId, req.body);
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.UPDATE_SUCCESS,
    data: updatedUser,
  });
};

export const deleteUserHandler = async (
  req: AuthRequestWithParams<UserIdParams>, // Sử dụng kiểu kết hợp
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const currentAdminId = req.user?.userId;
  await userService.deleteUser(userId, currentAdminId);
  res.status(HttpStatus.OK).json({ message: GeneralMessages.DELETE_SUCCESS });
};