// client/src/app/providers/ThemeProvider.tsx
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React from 'react';


// Bảng màutừ Coolors.co
const palette = {
    blackBean: '#330f0a',
    darkSlateGray: '#394f49',
    fernGreen: '#65743a',
    flax: '#efdd8d',
    mindaro: '#f4fdaf',
};

// ĐÂY LÀ NƠI MÌNH ĐỊNH NGHĨA BẢNG MÀU VÀ FONT
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: palette.fernGreen, // Màu xanh rêu làm màu chủ đạo
        },
        secondary: {
            main: palette.darkSlateGray, // Màu xám đen làm màu phụ
        },
        background: {
            default: '#f8f8f2', // Một màu nền sáng nhẹ, sạch sẽ
            paper: '#ffffff',
        },
        text: {
            primary: palette.darkSlateGray,
            secondary: '#555',
        },
        // Có thể định nghĩa thêm màu error, warning, success...
        error: {
            main: '#d32f2f',
        },
        warning: {
            main: '#f57c00',
        },
        info: {
            main: '#1976d2',
        },
        success: {
            main: '#388e3c',
        }
    },
    typography: {
        fontFamily: '"Public Sans", sans-serif', // Font mặc định của toàn trang
        h4: {
            fontWeight: 700,
            color: palette.blackBean, // Dùng màu đậm nhất cho tiêu đề lớn
        },
    },
    shape: {
        borderRadius: 8, // Bo góc đồng nhất
    },
});

// Tạo một component Provider để bọc toàn bộ app
export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <MuiThemeProvider theme={theme}>
            {/* CssBaseline giúp reset style mặc định của trình duyệt cho nhất quán */}
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
};