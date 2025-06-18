// src/app/App.tsx
import { Header } from '@/widgets/Header/Header';
import { AppRouter } from './AppRouter';
import { Toaster } from 'react-hot-toast'; 
// import './styles.css';

export const App = () => {
    return (
        <div>
            <Toaster position="top-center" />
            <Header /> {/* <-- Thêm Header vào đây */}
            <main>
                <AppRouter />
            </main>
        </div>
    );
};