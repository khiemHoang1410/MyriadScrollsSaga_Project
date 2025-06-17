// src/shared/ui/Spinner/Spinner.tsx

import { Box, CircularProgress } from '@mui/material'; // Import từ MUI

export const Spinner = () => {
  return (
    // Dùng Box của MUI để tạo lớp overlay
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: (theme) => theme.zIndex.drawer + 1, // Đảm bảo nó nổi lên trên
      }}
    >
      <CircularProgress />
    </Box>
  );
};