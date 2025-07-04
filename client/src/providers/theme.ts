// file: client/src/app/providers/theme.ts (Phiên bản đã được sửa lỗi)
import { createTheme } from '@mui/material/styles';

const primary = {
  main: '#6366F1',
  light: '#A5B4FC',
  dark: '#4F46E5',
};

// --- Theme cho chế độ SÁNG ---
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary,
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
  },
  // Các tùy chỉnh component
  components: {
    // Thêm transition cho body
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
        },
      },
    },
    // Transition cho Header
    MuiAppBar: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.3s ease-in-out, backdrop-filter 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        },
      },
    },
    // Transition cho các component Paper (ví dụ: Card, Menu...)
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.3s ease-in-out',
        },
      },
    },
  },
});

// --- Theme cho chế độ TỐI ---
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary,
    background: {
      default: '#111827',
      paper: '#1F2937',
    },
    text: {
        primary: '#F9FAFB',
        secondary: '#9CA3AF',
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.3s ease-in-out, backdrop-filter 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.3s ease-in-out',
        },
      },
    },
  },
});