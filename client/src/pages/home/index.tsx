// client/src/pages/home/index.tsx
import { BookList } from '@/widgets/BookList/BookList';
import { Box, Typography } from '@mui/material';
import { useAuthStore } from '@/shared/store/authStore'; // Import store
import { BookStatus } from '@/features/book';

// ==========================================================
// ======= COMPONENT DEBUG - MÁY THEO DÕI STATE =============
const AuthStatusDebug = () => {
  const { token, user } = useAuthStore();
  
  // Log ra console mỗi khi component này render lại
  console.log('[DEBUGGER] Component AuthStatusDebug đang render. Token:', token);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        background: 'rgba(0, 30, 0, 0.8)',
        color: '#00ff00',
        padding: '10px',
        borderRadius: '8px',
        zIndex: 9999,
        border: '1px solid #00ff00',
        fontFamily: 'monospace',
      }}
    >
      <Typography variant="caption" display="block" fontWeight="bold">AUTH STATE DEBUGGER</Typography>
      <Typography variant="caption" display="block">Token: {token ? `...${token.slice(-6)}` : 'NULL'}</Typography>
      <Typography variant="caption" display="block">User: {user ? user.username : 'NULL'}</Typography>
    </Box>
  );
};
// ==========================================================
// ==========================================================


export const HomePage = () => {
  return (
    <div>
      {/* Gắn máy theo dõi vào đây */}
      <AuthStatusDebug />

      <Typography variant="h4" component="h1" gutterBottom>
        Khám phá các thế giới
      </Typography>
      <BookList filters={{ status: BookStatus.PUBLISHED }} />
    </div>
  );
};