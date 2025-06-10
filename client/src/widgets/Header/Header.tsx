// src/widgets/Header/Header.tsx

import React, { useState } from 'react';
import { Link, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Container,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const isAdmin = user?.roles?.includes('admin');

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
              <Avatar alt={user.username} sx={{ width: 32, height: 32 }} />
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

              {/* 2. Thêm MenuItem mới, chỉ hiển thị nếu là admin */}
              {isAdmin && (
                <MenuItem
                  component={Link}
                  to="/dashboard/manage-books"
                  onClick={handleClose}
                >
                  Quản lý Sách
                </MenuItem>
              )}

              <MenuItem onClick={handleClose}>Tài khoản</MenuItem>
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