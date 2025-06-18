// client/src/app/AppRouter.tsx
import { Route, Routes, Navigate } from 'react-router-dom';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  BookDetailPage,
  DashboardPage,
  ManageBooksPage,
  BookEditPage,
  PlayPage,
  // NotFoundPage, // Mình có thể tạo trang này sau
} from '@/pages';
import { ProtectedRoute } from '@/shared/components';
import { AdminProtectedRoute } from '@/shared/components';

// Một component đơn giản cho trang 404
const NotFoundPage = () => <h1>404: Not Found</h1>;

export const AppRouter = () => {
  return (
    <Routes>
      {/* ================================= */}
      {/* 1. PUBLIC ROUTES           */}
      {/* ================================= */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/books/:slug" element={<BookDetailPage />} />

      {/* ================================= */}
      {/* 2. PROTECTED ROUTES (User+)    */}
      {/* ================================= */}
      <Route element={<ProtectedRoute />}>
        {/* Trang dashboard chung cho mọi user đã đăng nhập */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/play/:slug" element={<PlayPage />} />

      {/* ================================= */}
      {/* 2. PROTECTED ROUTES (ADMIN)    */}
      {/* ================================= */}
        <Route path="/admin" element={<AdminProtectedRoute />}>
        
          <Route index element={<Navigate to="/admin/manage-books" replace />} />
          <Route path="manage-books" element={<ManageBooksPage />} />
          <Route path="manage-books/add" element={<BookEditPage />} />
          <Route path="manage-books/edit/:bookId" element={<BookEditPage />} />
          {/* Sau này có manage-users thì thêm vào đây */}
        </Route>
      </Route>

      {/* ================================= */}
      {/* 3. NOT FOUND ROUTE         */}
      {/* ================================= */}
      {/* Bắt tất cả các đường dẫn không khớp ở trên và hiển thị trang 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};