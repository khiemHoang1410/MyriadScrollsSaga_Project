// File: server/src/modules/user/user.admin.route.ts

import { Router } from 'express';
import { userController } from '@/modules/user/'; // <--- Dùng alias
import { validateResource } from '@/middleware'; // <--- Dùng alias
import { updateUserSchema } from '@/modules/user/user.schema'; // <--- Dùng alias

const router = Router();

router.get('/', userController.getAllUsersHandler);

router.put(
  '/:userId',
  validateResource(updateUserSchema),
  userController.updateUserHandler
);

export default router;