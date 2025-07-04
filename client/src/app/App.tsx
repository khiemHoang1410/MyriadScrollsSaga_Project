// src/app/App.tsx

import { CssBaseline, ThemeProvider, Box } from '@mui/material'; // <-- Thêm ThemeProvider và CssBaseline
import { Toaster } from 'react-hot-toast';
import { Header } from '@/widgets/Header/Header';
import { AppRouter } from './AppRouter';

// --- Mấy món đồ mới mình vừa tạo ---
import { useThemeStore } from '@/shared/store/themeStore';
import { lightTheme, darkTheme } from '@/providers';


export const App = () => {
    // Lấy trạng thái sáng/tối từ "công tắc" store
    const { mode } = useThemeStore();
    // Dựa vào trạng thái để chọn "bộ skin" phù hợp
    const currentTheme = mode === 'light' ? lightTheme : darkTheme;

    return (
        // Bọc toàn bộ ứng dụng bằng ThemeProvider để "skin" có tác dụng
        <ThemeProvider theme={currentTheme}>
            {/* CssBaseline giúp reset và chuẩn hóa CSS cho toàn bộ trang */}
            <CssBaseline />

            {/* Phần code cũ của ông được giữ nguyên bên trong */}
            <Box sx={{ height: '100%', bgcolor: 'background.default', color: 'text.primary' }}>
                <Toaster position="top-center" />
                <Header />
                <Box component="main" sx={{ height: '100%' }}>
                    <AppRouter />
                </Box>
            </Box>
        </ThemeProvider>
    );
};