// server/src/routes/adminRoutes.ts
import express from 'express';
import { authenticateToken, authorizeRoles } from '@/middleware/authenticateToken';
import { UserRole } from '@/models/UserModel';
import {
    getAllUsers,
    getUserById,
    updateUserByAdmin,
    deleteUserByAdmin,
} from '@/controllers/adminController';
// Import thêm các controller khác cho admin (quản lý sách, xem stats, etc.)

const router = express.Router();

// Tất cả các route trong file này đều yêu cầu xác thực và role ADMIN
router.use(authenticateToken);
router.use(authorizeRoles(UserRole.ADMIN)); // Chỉ admin mới được vào các route này

// User Management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUserByAdmin); // API để admin cập nhật thông tin user (gồm cả roles)
router.delete('/users/:userId', deleteUserByAdmin);

// Book Management (ví dụ, sẽ cần tạo BookController)
// router.post('/books', bookController.createBook);
// router.put('/books/:bookId', bookController.updateBook);
// router.delete('/books/:bookId', bookController.deleteBook);

// Statistics/Analytics (ví dụ, sẽ cần tạo StatsController)
// router.get('/stats/overview', statsController.getOverview);

export default router;