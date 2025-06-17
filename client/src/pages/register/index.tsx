// client/src/pages/register/index.tsx
import { RegisterForm } from '@/features/auth/RegisterForm';
import { Box } from '@mui/material';

export const RegisterPage = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
      <RegisterForm />
    </Box>
  );
};