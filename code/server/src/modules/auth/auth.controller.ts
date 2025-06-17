// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import * as authService from './auth.service';
import { RegisterUserInput, LoginUserInput } from './auth.schema';
import { HttpStatus, AuthMessages, AuthenticatedRequest } from '@/types';

export const registerUserHandler = async (
  req: Request<{}, {}, RegisterUserInput>,
  res: Response
): Promise<void> => {
  const user = await authService.register(req.body);
  res.status(HttpStatus.CREATED).json({
    message: AuthMessages.REGISTRATION_SUCCESS,
    data: user,
  });
};

export const loginUserHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response
): Promise<void> => {
  const { token, user } = await authService.login(req.body);
  res.status(HttpStatus.OK).json({
    message: AuthMessages.LOGIN_SUCCESS,
    token,
    data: user,
  });
};

export const getMeHandler = async (
  req: AuthenticatedRequest, // Sử dụng AuthenticatedRequest để có req.user
  res: Response
): Promise<void> => {
  // req.user được populate bởi authenticateToken middleware
  if (!req.user) {
    // Điều này không nên xảy ra nếu authenticateToken hoạt động đúng
    res.status(HttpStatus.UNAUTHORIZED).json({ message: AuthMessages.USER_DATA_NOT_FOUND_IN_TOKEN });
    return;
  }
  // Trả về thông tin người dùng từ token (không cần query DB lại nếu không cần thông tin mới nhất)
  res.status(HttpStatus.OK).json({
    message: 'User data retrieved successfully.',
    data: {
      userId: req.user.userId,
      username: req.user.username,
      roles: req.user.roles,
    },
  });
};