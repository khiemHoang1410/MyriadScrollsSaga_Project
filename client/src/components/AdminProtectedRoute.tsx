import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';

export const AdminProtectedRoute = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('admin');

  if (isAdmin) {
    return <Outlet />; // Nếu là admin, cho qua
  }

  // Nếu không phải admin, đá về trang dashboard chính
  return <Navigate to="/dashboard" replace />;
};