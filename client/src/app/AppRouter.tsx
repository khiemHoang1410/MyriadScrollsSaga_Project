// client/src/app/AppRouter.tsx
import { Route, Routes } from 'react-router-dom';
import {
  HomePage,
  LoginPage,
  BookDetailPage,
  DashboardPage,
  ManageBooksPage,
  BookEditPage,
} from '@/pages';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';

export const AppRouter = () => {
  return (
    <Routes>
      {/* === CÁC ROUTE CÔNG KHAI === */}
      <Route path="/" element={<HomePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="books/:slug" element={<BookDetailPage />} />

      {/* === KHU VỰC SAU ĐĂNG NHẬP === */}
      <Route path="/dashboard" element={<ProtectedRoute />}>
        {/* Trang dashboard chung, ai đăng nhập cũng vào được */}
        <Route index element={<DashboardPage />} />

        {/* Khu vực admin, được bảo vệ thêm 1 lớp */}
        <Route path="admin" element={<AdminProtectedRoute />}>
            <Route path="manage-books" element={<ManageBooksPage />} />
            <Route path="manage-books/add" element={<BookEditPage />} />
            <Route path="manage-books/edit/:bookId" element={<BookEditPage />} />
            {/* Sau này có manage-users thì thêm vào đây */}
        </Route>
      </Route>
    </Routes>
  );
};