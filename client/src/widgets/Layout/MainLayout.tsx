// client/src/widgets/Layout/MainLayout.tsx
import { Box, Toolbar, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <Box>
      {/* Toolbar này là "cục gạch" vô hình để đẩy mọi thứ xuống dưới Header */}
      <Toolbar />
      
      {/* Container sẽ căn giữa và giới hạn chiều rộng nội dung */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Nội dung các trang con sẽ được render ở đây */}
        <Outlet />
      </Container>
    </Box>
  );
};