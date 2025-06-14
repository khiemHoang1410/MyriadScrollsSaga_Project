// File: server/src/modules/user/user.route.ts (Sau khi dọn dẹp)

import { Router } from 'express';
import { userController } from '@/modules/user'; // <--- Dùng alias
import { authenticateToken } from '@/middleware'; // <--- Dùng alias

const router = Router();

router.get('/:userId', authenticateToken, userController.getUserByIdHandler);

export default router;