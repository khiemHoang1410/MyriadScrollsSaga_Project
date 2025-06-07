// src/shared/ui/Button/Button.tsx

// import React from 'react';
// Dòng import cũ đã được tách ra làm hai:
import { Button as MuiButton } from '@mui/material'; // Import "giá trị" (component)
import type { ButtonProps as MuiButtonProps } from '@mui/material'; // Import "kiểu" với từ khóa `type`

// Export lại kiểu props của MUI để có thể dùng ở nơi khác nếu cần
export type ButtonProps = MuiButtonProps;

/**
 * Component Button dùng chung, được xây dựng dựa trên Button của MUI.
 * Sau này có thể tùy biến thêm ở đây.
 */
export const Button = (props: ButtonProps) => {
  // Chúng ta chỉ đơn giản là render ra component Button của MUI
  // và truyền tất cả props vào nó.
  return <MuiButton {...props} />;
};