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
import { ProtectedRoute } from '@/shared/ui/ProtectedRoute';
import { UserRole } from '@/features/auth/types';
 // Nhớ import thêm PropsWithChildren
export const AppRouter = () => {
  return (
    <Routes>
      {/* Các route không cần bọc trong layout nữa */}
      
      {/* === CÁC ROUTE CÔNG KHAI === */}
      <Route path="/" element={<HomePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="books/:slug" element={<BookDetailPage />} />

      {/* === CÁC ROUTE ĐƯỢC BẢO VỆ === */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.USER]} />}>
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}/>}>
        <Route path="dashboard/manage-books" element={<ManageBooksPage />} />
        <Route path="dashboard/manage-books/add" element={<BookEditPage />} />
        <Route path="dashboard/manage-books/edit/:bookId" element={<BookEditPage />} />
      </Route>
    </Routes>
  );
};