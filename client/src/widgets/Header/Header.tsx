// src/widgets/Header/Header.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Chỉ cần import Link 1 lần
import { useAuthStore } from '@/shared/store/authStore';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const isAdmin = user?.roles?.includes('admin');

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          Myriad Scrolls Saga
        </Typography>
        {user ? (
          <Box>
            <IconButton onClick={handleMenu} sx={{ p: 0 }}>
              <Avatar alt={user.username} sx={{ width: 32, height: 32, textTransform: 'uppercase' }}>
                {user.username.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
              sx={{ mt: '45px' }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1">Xin chào, {user.username}</Typography>
              </Box>

              {isAdmin && (
                <MenuItem
                  component={Link}
                  // FIX 1: Thêm '/admin' vào giữa cho khớp với AppRouter mới
                  to="/admin/manage-books"
                  onClick={handleClose}
                >
                  Quản lý Sách
                </MenuItem>
              )}

              {/* FIX 2: Trỏ link "Tài khoản" về trang dashboard chính */}
              <MenuItem component={Link} to="/dashboard" onClick={handleClose}>
                Tài khoản
              </MenuItem>
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            Đăng nhập
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};