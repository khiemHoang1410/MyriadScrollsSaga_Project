// client/src/shared/components/AdminProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { UserRole } from '@/features/auth';

export const AdminProtectedRoute = () => {
  const { token, user } = useAuthStore(); // Lấy cả token và user
  const location = useLocation();

  // Check xem đã đăng nhập chưa (có token không)
  if (!token) {
    // Nếu chưa, đá về trang login và lưu lại trang đang định vào
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đăng nhập rồi, check xem có phải admin không
  if (!user || !user.roles.includes(UserRole.ADMIN)) {
    // Nếu không phải admin, đá về trang chủ (hoặc trang 403 Forbidden)
    return <Navigate to="/" replace />;
  }

  // Nếu qua hết các cổng bảo vệ, cho phép render các route con
  return <Outlet />;
};