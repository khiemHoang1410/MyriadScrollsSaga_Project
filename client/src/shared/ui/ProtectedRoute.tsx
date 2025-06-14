// File: client/src/shared/ui/ProtectedRoute.tsx (FINAL FIX)

import React, { type PropsWithChildren } from 'react'; // SỬA: Thêm PropsWithChildren
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '@/features/auth/types';

// SỬA: Dùng PropsWithChildren để khai báo type, không dùng interface nữa
type ProtectedRouteProps = PropsWithChildren<{
  allowedRoles: UserRole[];
}>;

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, token } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRequiredRole = user?.roles.some((role) =>
    allowedRoles.includes(role as UserRole),
  );

  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};