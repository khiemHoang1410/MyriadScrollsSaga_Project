// server/src/routes/authRoutes.ts
import express from 'express';
import { registerUser,loginUser } from '@/controllers/authController'; // Dùng alias @/

const router = express.Router();

// Định nghĩa route cho việc đăng ký: POST /api/auth/register
router.post('/register', registerUser);
router.post('/login', loginUser); 
// (Sau này mình sẽ thêm các route khác cho login, logout,... ở đây)

export default router;