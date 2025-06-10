// src/app/AppRouter.tsx
import { ProtectedRoute } from '@/shared/ui/ProtectedRoute'; // <-- Import component "gác cổng"
import { Route, Routes } from 'react-router-dom';

import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard'; 
import { BookDetailPage } from '@/pages/book-detail';
import { ManageBooksPage } from '@/pages/manage-books';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Các route công khai */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="books/:slug" element={<BookDetailPage />} />
      {/* Các route được bảo vệ */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* 2. Thêm route mới cho trang quản lý sách */}
        <Route path="/dashboard/manage-books" element={<ManageBooksPage />} />
      </Route>
    </Routes>
  );
};