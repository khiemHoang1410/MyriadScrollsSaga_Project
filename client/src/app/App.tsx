// src/app/App.tsx

import { Header } from '@/widgets/Header/Header';
import { AppRouter } from './AppRouter';
import { Toaster } from 'react-hot-toast';
import { Box } from '@mui/material';

export const App = () => {
    return (
        // Box này đảm bảo toàn bộ App có chiều cao 100%
        <Box sx={{ height: '100%' }}>
            <Toaster position="top-center" />
            <Header />
            
            {/* Box này chứa nội dung chính, cũng cao 100% */}
            <Box component="main" sx={{ height: '100%' }}>
                <AppRouter />
            </Box>
        </Box>
    );
};

// Trigger CI/CD run