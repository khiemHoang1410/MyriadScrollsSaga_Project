// src/pages/dashboard/index.tsx
import { useAuthStore } from '@/shared/store/authStore';
import { Typography } from '@mui/material';

export const DashboardPage = () => {
  // Lấy thông tin user từ store để hiển thị
  const { user } = useAuthStore();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1">
        Chào mừng trở lại, <strong>{user?.username}</strong>!
      </Typography>
      <Typography variant="body2">
        Đây là khu vực được bảo vệ, chỉ những người đã đăng nhập mới thấy được.
      </Typography>
    </div>
  );
};