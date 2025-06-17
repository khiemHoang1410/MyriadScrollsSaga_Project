// src/shared/ui/ErrorMessage/ErrorMessage.tsx

import { styled } from '@mui/material/styles';

interface ErrorMessageProps {
  message?: string;
}

// Tạo component container được style bằng Emotion
const ErrorContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2.5), // Dùng theme spacing của MUI (2.5 * 8px = 20px)
  border: `1px solid ${theme.palette.error.light}`, // Dùng màu error từ theme
  backgroundColor: '#fff5f5', // Có thể dùng alpha(theme.palette.error.main, 0.1)
  borderRadius: theme.shape.borderRadius, // Dùng bo góc chuẩn của theme
  margin: theme.spacing(2.5),
}));

// Tạo component text được style bằng Emotion
const ErrorText = styled('p')(({ theme }) => ({
  color: theme.palette.error.dark, // Dùng màu error từ theme
  fontWeight: 500,
  margin: 0,
}));

export const ErrorMessage = ({ message = 'An unexpected error occurred.' }: ErrorMessageProps) => {
  return (
    // Dùng 2 component đã được style ở trên
    // Thêm role="alert" để cải thiện accessibility
    <ErrorContainer role="alert">
      <ErrorText>⚠️ {message}</ErrorText>
    </ErrorContainer>
  );
};