// src/pages/login/index.tsx
import { LoginForm } from '@/features/auth/LoginForm'; // Sẽ tạo feature này ngay sau đây

export const LoginPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '5rem' }}>
      <LoginForm />
    </div>
  );
};