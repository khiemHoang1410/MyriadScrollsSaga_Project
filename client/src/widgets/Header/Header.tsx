// src/widgets/Header/Header.tsx

import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#232f3e' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
              Myriad Scrolls Saga
            </RouterLink>
          </Typography>

          {user ? (
            // Nếu ĐÃ đăng nhập
            <Box sx={{ display: 'flex', alignItems: 'center' }}> {/* Căn giữa các item */}
              
              {/* DÒNG CODE ĐƯỢC THÊM LẠI Ở ĐÂY */}
              <Typography sx={{ mr: 2 }}> {/* Thêm khoảng cách bên phải (margin-right) */}
                Xin chào, {user.username}!
              </Typography>

              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="primary-search-account-menu"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={isMenuOpen}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>Dashboard</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            // Nếu CHƯA đăng nhập
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={RouterLink} to="/login" color="inherit">
                Login
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};