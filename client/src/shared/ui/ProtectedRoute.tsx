// src/shared/ui/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';

export const ProtectedRoute = () => {
  // Lấy token từ store
  const token = useAuthStore((state) => state.token);

  // Nếu có token (đã đăng nhập), cho phép render các component con bên trong
  // <Outlet /> sẽ là component mà chúng ta bọc (ví dụ: DashboardPage)
  if (token) {
    return <Outlet />;
  }

  // Nếu không có token, điều hướng người dùng về trang /login
  return <Navigate to="/login" replace />;
};