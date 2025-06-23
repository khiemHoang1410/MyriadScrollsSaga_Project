// client/src/app/AppRouter.tsx
import { Route, Routes, Navigate } from 'react-router-dom';
import {
  HomePage, LoginPage, RegisterPage, BookDetailPage, PlayPage,
  ManageBooksPage, BookEditPage, ManageGenresPage,
  ManageTagsPage, ManageLanguagesPage,
  DashboardPage,
  NotFoundPage,
} from '@/pages';
import { ProtectedRoute, AdminProtectedRoute } from '@/shared/components';
import { AdminLayout } from '@/widgets/Layout/AdminLayout';
import { paths } from '@/shared/config/paths';

import { MainLayout } from '@/widgets/Layout';



export const AppRouter = () => {
  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route element={<MainLayout />}>
        <Route path={paths.home} element={<HomePage />} />
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.register} element={<RegisterPage />} />
        <Route path={paths.bookDetail()} element={<BookDetailPage />} />

        {/* ===== USER PROTECTED ROUTES ===== */}
        <Route element={<ProtectedRoute />}>
          <Route path={paths.dashboard.root} element={<DashboardPage />} />
          <Route path={paths.play()} element={<PlayPage />} />
        </Route>
      </Route>

      {/* ===== ADMIN PROTECTED ROUTES - CẤU TRÚC MỚI ===== */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to={paths.admin.manageBooks} replace />} />
          <Route path="manage-books" element={<ManageBooksPage />} />
          <Route path="manage-books/add" element={<BookEditPage />} />
          <Route path="manage-books/edit/:bookId" element={<BookEditPage />} />
          <Route path="manage-genres" element={<ManageGenresPage />} />
          <Route path="manage-tags" element={<ManageTagsPage />} />
          <Route path="manage-languages" element={<ManageLanguagesPage />} />

        </Route>
      </Route>

      {/* NOT FOUND ROUTE */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};