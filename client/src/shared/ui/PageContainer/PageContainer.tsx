// client/src/shared/ui/PageContainer/PageContainer.tsx
import { Box } from '@mui/material';
import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    // Đây chính là cái Box sếp muốn, chỉ giữ lại padding cho nó chung chung
    <Box sx={{
      p: { xs: 2, sm: 3, md: 4 } // Padding responsive
    }}>
      {children}
    </Box>
  );
};