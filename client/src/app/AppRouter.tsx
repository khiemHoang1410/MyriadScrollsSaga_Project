// src/app/AppRouter.tsx
import { Route, Routes } from 'react-router-dom';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard'; // <-- Import trang mới
import { ProtectedRoute } from '@/shared/ui/ProtectedRoute'; // <-- Import component "gác cổng"

export const AppRouter = () => {
  return (
    <Routes>
      {/* Các route công khai */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Các route được bảo vệ */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Có thể thêm các trang cần bảo vệ khác vào đây */}
        {/* <Route path="/profile" element={<ProfilePage />} /> */}
      </Route>
    </Routes>
  );
};