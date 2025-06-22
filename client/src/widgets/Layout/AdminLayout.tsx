// client/src/widgets/Layout/AdminLayout.tsx

import { useState } from 'react'; // <-- Step 1: Import useState
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, IconButton, Divider } from '@mui/material';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu'; // <-- Icon 3 gạch
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'; // <-- Icon mũi tên
import BookIcon from '@mui/icons-material/Book';
import CategoryIcon from '@mui/icons-material/Category';
import StyleIcon from '@mui/icons-material/Style';
import LanguageIcon from '@mui/icons-material/Language';
import PeopleIcon from '@mui/icons-material/People';

const expandedDrawerWidth = 240;
const collapsedDrawerWidth = 60; // Chiều rộng khi thu gọn

const adminNavItems = [
  { text: 'Quản Lý Sách', path: '/admin/manage-books', icon: <BookIcon /> },
  { text: 'Quản Lý Thể Loại', path: '/admin/manage-genres', icon: <CategoryIcon /> },
  { text: 'Quản Lý Thẻ', path: '/admin/manage-tags', icon: <StyleIcon /> },
  { text: 'Quản Lý Ngôn Ngữ', path: '/admin/manage-languages', icon: <LanguageIcon /> },
  { text: 'Quản Lý Người Dùng', path: '/admin/manage-users', icon: <PeopleIcon /> },
];

export const AdminLayout = () => {
  const location = useLocation();
  // Step 1: Dùng state để quản lý trạng thái đóng/mở, mặc định là mở
  const [open, setOpen] = useState(true);

  // Step 2: Hàm để bật/tắt menu
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const drawerContent = (
    <div>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: [1],
        }}
      >
        {/* Nút này sẽ thay đổi tùy theo menu đang đóng hay mở */}
        <IconButton onClick={handleDrawerToggle}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {adminNavItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              selected={location.pathname.startsWith(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {/* Step 4: Chỉ hiển thị chữ khi menu mở */}
              <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? expandedDrawerWidth : collapsedDrawerWidth,
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: open ? expandedDrawerWidth : collapsedDrawerWidth,
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: 'background.default',
          transition: (theme) => theme.transitions.create('margin', {
             easing: theme.transitions.easing.sharp,
             duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Step 5: Đẩy nội dung chính ra để không bị menu che */}
        <Toolbar /> 
        <Outlet />
      </Box>
    </Box>
  );
};