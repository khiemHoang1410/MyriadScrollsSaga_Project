// File: server/src/modules/admin.router.ts

import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '@/middleware'; // <--- Dùng alias
import { UserRole } from '@/modules/user/user.model'; // <--- Dùng alias

// Import các route admin của từng module
import bookAdminRoutes from '@/modules/book/book.admin.route'; // <--- Dùng alias
import userAdminRoutes from '@/modules/user/user.admin.route'; // <--- Dùng alias

const adminRouter = Router();

// ÁP DỤNG LỚP BẢO VỆ CHUNG CHO TẤT CẢ API ADMIN
adminRouter.use(authenticateToken, authorizeRoles(UserRole.ADMIN));

// Gắn các route của từng module admin vào
adminRouter.use('/books', bookAdminRoutes);
adminRouter.use('/users', userAdminRoutes);

export default adminRouter;