// src/modules/user/user.route.ts
import express from 'express';
import { asyncHandler } from '@/utils';
import { validateResource, authenticateToken, authorizeRoles } from '@/middleware';
import * as userController from './user.controller';
import { createUserSchema, updateUserSchema, userIdParamsSchema } from './user.schema';
import { UserRole } from './user.model';

const router = express.Router();

// Tất cả các route trong file này đều yêu cầu xác thực và role ADMIN
router.use(authenticateToken);
router.use(authorizeRoles(UserRole.ADMIN));

router.post(
  '/',
  validateResource(createUserSchema),
  asyncHandler(userController.createUserHandler)
);

router.get(
  '/',
  asyncHandler(userController.getAllUsersHandler)
);

router.get(
  '/:userId',
  validateResource(userIdParamsSchema),
  asyncHandler(userController.getUserByIdHandler)
);

router.put(
  '/:userId',
  validateResource(updateUserSchema),
  asyncHandler(userController.updateUserHandler)
);

router.delete(
  '/:userId',
  validateResource(userIdParamsSchema),
  asyncHandler(userController.deleteUserHandler)
);

export default router;