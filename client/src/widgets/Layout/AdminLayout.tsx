// src/widgets/Layout/AdminLayout.tsx

import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Box, Drawer as MuiDrawer, List, ListItem, ListItemButton as MuiListItemButton, ListItemIcon, ListItemText, IconButton, Typography, Divider, CssBaseline, Avatar } from '@mui/material';
import { styled, type Theme, type CSSObject } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import BookIcon from '@mui/icons-material/Book';
import CategoryIcon from '@mui/icons-material/Category';
import StyleIcon from '@mui/icons-material/Style';
import LanguageIcon from '@mui/icons-material/Language';
import PeopleIcon from '@mui/icons-material/People';
import AdbIcon from '@mui/icons-material/Adb';
import { paths } from '@/shared/config/paths';

const expandedDrawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: expandedDrawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: expandedDrawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const ListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  minHeight: 48,
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiListItemIcon-root': { color: theme.palette.primary.contrastText },
    '&:hover': { backgroundColor: theme.palette.primary.dark }
  },
  '&:hover': { backgroundColor: theme.palette.action.hover },
}));

const adminNavItems = [
  { text: 'Quản Lý Sách', path: paths.admin.manageBooks, icon: <BookIcon /> },
  { text: 'Quản Lý Thể Loại', path: paths.admin.manageGenres, icon: <CategoryIcon /> },
  { text: 'Quản Lý Thẻ', path: paths.admin.manageTags, icon: <StyleIcon /> },
  { text: 'Quản Lý Ngôn Ngữ', path: paths.admin.manageLanguages, icon: <LanguageIcon /> },
  { text: 'Quản Lý Người Dùng', path: paths.admin.manageUsers, icon: <PeopleIcon /> },
];

export const AdminLayout = () => {
  const [open, setOpen] = useState(true);
  const handleDrawerToggle = () => setOpen(!open);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <Box sx={{
          // Thêm transition để paddingTop thay đổi mượt mà
          transition: 'padding-top .5s ease-in-out 0s',
          paddingTop: open ? 10 : 8  , // Khi mở có padding, khi đóng thì không
          textAlign: 'center',
        }}>
          {/* Box chứa nội dung sẽ co giãn */}
          <Box sx={{
            // Quan trọng: Ẩn nội dung bị tràn ra khi co lại
            overflow: 'hidden',
            // "Chiêu" chính nằm ở đây: transition max-height
            maxHeight: open ? '200px' : '0px', // Khi mở, cho chiều cao tối đa (phải lớn hơn chiều cao thật của nội dung)
            opacity: open ? 1 : 0,
            // Thêm transition cho các thuộc tính này
            transition: 'max-height 1s ease-in-out, opacity 1s ease-in-out',
          }}>
            <Avatar sx={{
              mx: 'auto', width: 64, height: 64, mb: 1,
              transition: 'max-height 0s ease-in-out, opacity 1s ease-in-out',
            }}>A</Avatar>
            <Typography fontWeight="bold">Admin User</Typography>
          </Box>
        </Box>
        <DrawerHeader>
          <Typography variant="h6" noWrap component="div" sx={{
            flexGrow: 1, opacity: open ? 1 : 0, transition: 'max-height 1s ease-in-out, opacity 0s ease-in-out',
          }}>
            MENU
          </Typography>

          {/* >>> NÚT "THỤT THÒ" NẰM Ở ĐÂY <<< */}
          <IconButton onClick={handleDrawerToggle}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {adminNavItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <NavLink to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                {({ isActive }) => (
                  <ListItemButton selected={isActive} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                  </ListItemButton>
                )}
              </NavLink>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <DrawerHeader /> {/* This is the spacer */}
        <Outlet />
      </Box>
    </Box>
  );
};