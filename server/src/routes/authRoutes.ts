// server/src/routes/authRoutes.ts
import express from 'express';
import { registerUser,loginUser } from '@/controllers/authController'; // Dùng alias @/
import { authenticateToken } from '@/middleware/authenticateToken';
import { AuthenticatedRequest } from '@/types';


const router = express.Router();

// Định nghĩa route cho việc đăng ký: POST /api/auth/register
router.post('/register', registerUser);
router.post('/login', loginUser); 
// (Sau này mình sẽ thêm các route khác cho login, logout,... ở đây)
// Route "VIP" cần "giấy thông hành"
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => { 
    // Nếu qua được authenticateToken, req.user sẽ chứa thông tin từ JWT payload
    if (!req.user) {
      // Trường hợp này ít khi xảy ra nếu authenticateToken làm đúng nhiệm vụ
      res.status(403).json({ message: 'User data not found in token.' });
      return;
    }
    res.json({
      message: 'Welcome to your VIP area!',
      userDataFromToken: {
          userId: req.user.userId,
          username: req.user.username,
          roles: req.user.roles,
          iat: req.user.iat,
          exp: req.user.exp,
      },
  });
  });
export default router;