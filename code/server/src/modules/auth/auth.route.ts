// src/modules/auth/auth.route.ts
import express from 'express';
import { asyncHandler } from '@/utils';
import { validateResource, authenticateToken } from '@/middleware';
import * as authController from './auth.controller';
import { registerUserSchema, loginUserSchema } from './auth.schema';

const router = express.Router();

router.post(
  '/register',
  validateResource(registerUserSchema),
  asyncHandler(authController.registerUserHandler)
);

router.post(
  '/login',
  validateResource(loginUserSchema),
  asyncHandler(authController.loginUserHandler)
);

router.get(
  '/me',
  authenticateToken, // Middleware xác thực token
  asyncHandler(authController.getMeHandler)
);

export default router;