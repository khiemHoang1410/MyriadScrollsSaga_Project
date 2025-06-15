// src/shared/ui/ErrorMessage/ErrorMessage.tsx

import { styled } from '@mui/material/styles'; // Import styled từ MUI

interface ErrorMessageProps {
  message?: string;
}

// Tạo các styled components
const ErrorContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2.5), // Dùng theme spacing của MUI (2.5 * 8px = 20px)
  border: `1px solid ${theme.palette.error.light}`, // Dùng màu error của MUI
  backgroundColor: '#fff5f5', // Hoặc dùng theme.palette.error.main với alpha
  borderRadius: theme.shape.borderRadius, // Dùng bo góc của MUI
  margin: theme.spacing(2.5),
}));

const ErrorText = styled('p')(({ theme }) => ({
  color: theme.palette.error.dark, // Dùng màu error của MUI
  fontWeight: 500,
  margin: 0,
}));


export const ErrorMessage = ({ message = 'An unexpected error occurred.' }: ErrorMessageProps) => {
  return (
    <ErrorContainer>
      <ErrorText>⚠️ {message}</ErrorText>
    </ErrorContainer>
  );
};