// src/app/App.tsx
import { Header } from '@/widgets/Header/Header';
import { AppRouter } from './AppRouter';
// import './styles.css';

export const App = () => {
    return (
        <div>
            <Header /> {/* <-- Thêm Header vào đây */}
            <main>
                <AppRouter />
            </main>
        </div>
    );
};