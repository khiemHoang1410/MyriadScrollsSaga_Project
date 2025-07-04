// client/src/widgets/Header/Header.tsx

import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Menu, MenuItem, Avatar, Divider, Tooltip, ListItemIcon } from '@mui/material';
import { paths } from '@/shared/config/paths';
import { UserRole } from '@/features/auth';

// --- Import thêm icon cho nó lung linh ---
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useThemeStore } from '@/shared/store/themeStore';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Icon mặt trăng
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Icon mặt trời

// Custom hook để giải quyết vấn đề hydration, giữ nguyên vì nó quá xịn
const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
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

  const isAuthenticated = !!token;
  const isAdmin = user?.roles?.includes(UserRole.ADMIN);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };
  const { mode, toggleMode } = useThemeStore(); // Lấy trạng thái và hành động từ store

  // Nếu chưa hydrated, render một cái skeleton để tránh FOUC (Flash of Unstyled Content)
  // Đây là kỹ thuật rất chuyên nghiệp, mình giữ lại.
  if (!hydrated) {
    return (
      <AppBar position="fixed" sx={{
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <Toolbar />
      </AppBar>
    );
  }

  return (
    // ===== BẮT ĐẦU PHẪU THUẬT THẨM MỸ =====
    <AppBar
      position="sticky" // Giữ cho header luôn ở trên cùng khi cuộn
      sx={{
        // Hiệu ứng "kính mờ" (glassmorphism) siêu trend
        background: 'rgba(255, 255, 255, 0.7)', // Nền trắng mờ
        backdropFilter: 'blur(10px)', // Hiệu ứng mờ
        boxShadow: 'inset 0px -1px 1px #ddd', // Đường kẻ mờ tinh tế ở dưới
        color: '#000', // Đổi màu chữ mặc định thành màu đen
      }}
    >
      <Toolbar>
        {/* === Logo/Tên trang web === */}
        <Typography
          variant="h6"
          component={NavLink} to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'text.primary', // Dùng màu chữ chính của theme
            fontWeight: 'bold',
            fontFamily: 'monospace',
            letterSpacing: '.1rem',
            '&:hover': {
              color: 'primary.main' // Hiệu ứng đổi màu khi hover
            }
          }}
        >
          MyriadScrollsSaga
        </Typography>
        <IconButton sx={{ ml: 1 }} onClick={toggleMode} color="inherit">
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        {/* === Nút Bấm Khi Đã Đăng Nhập / Chưa Đăng Nhập === */}
        {isAuthenticated && user ? (
          <Box>
            {/* Thêm Tooltip để khi rê chuột vào thấy tên đầy đủ */}
            <Tooltip title={user.username || ''}>
              <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                <Avatar alt={user.username} sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  {user.username?.[0]?.toUpperCase() || '?'}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* Menu người dùng được "tân trang" lại */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              sx={{ mt: '45px' }}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            // Thêm hiệu ứng cho cái khung menu

            >
              <Box sx={{ p: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold">{user.username}</Typography>
                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />

              {/* Thêm icon vào các MenuItem */}
              <MenuItem component={NavLink} to={paths.dashboard.root} onClick={handleClose}>
                <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                Dashboard
              </MenuItem>
              {isAdmin && (
                <MenuItem component={NavLink} to={paths.admin.root} onClick={handleClose}>
                  <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
                  Trang Admin
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                Đăng xuất
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          // Nút đăng nhập cũng có icon cho nó "chanh sả"
          <Button
            color="primary"
            variant="contained"
            component={NavLink} to={paths.login}
            startIcon={<LoginIcon />}
            sx={{ borderRadius: '20px', textTransform: 'none' }} // Bo tròn và chữ không viết hoa
          >
            Đăng nhập
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};