// client/src/widgets/Header/Header.tsx
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Menu, MenuItem, Avatar, Divider, Skeleton } from '@mui/material';
import { paths } from '@/shared/config/paths';
import { UserRole } from '@/features/auth';

// Tạo một custom hook nhỏ để giải quyết vấn đề hydration
const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // onMount, set hydrated to true
    setHydrated(true);
  }, []);
  return hydrated;
};

export const Header = () => {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const hydrated = useHydration();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Tự suy ra trạng thái đăng nhập từ token
  const isAuthenticated = !!token;
  const isAdmin = user?.roles?.includes(UserRole.ADMIN);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };
  
  // Rất quan trọng: Nếu chưa hydrated, render một cái skeleton để tránh hiển thị sai
  if (!hydrated) {
    return (
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Myriad Scrolls Saga</Typography>
          <Skeleton variant="circular" width={32} height={32} />
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component={NavLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          Myriad Scrolls Saga
        </Typography>

        {isAuthenticated && user ? (
          <Box>
            <IconButton onClick={handleMenu} sx={{ p: 0 }}>
              <Avatar alt={user.username} sx={{ width: 32, height: 32, textTransform: 'uppercase' }}>
                {user.username?.[0] || '?'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose} sx={{ mt: '45px' }} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <Box sx={{ p: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold">{user.username}</Typography>
                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
              </Box>
              <Divider />
              {isAdmin && (
                <MenuItem component={NavLink} to={paths.admin.root} onClick={handleClose}>
                  Trang Admin
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button color="inherit" component={NavLink} to={paths.login}>
            Đăng nhập
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};